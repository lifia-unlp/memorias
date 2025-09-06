#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Lee una lista de URLs (una por línea) y raspa el abstract.
Salida: SOLO un array JSON por stdout con objetos:
  {"self_archiving_url": "<url>", "abstract": "<texto>"}
- Solo incluye entradas con abstract no vacío.
- Progreso (FOUND / NOT FOUND) se imprime por stderr.

Uso:
  pip install requests beautifulsoup4 lxml
  python scrape_self_archives.py urls.txt > results.json
"""

import sys
import re
import json
import time
from typing import Optional, List, Dict, Tuple
import requests
from bs4 import BeautifulSoup

# -------- Config --------
UA = "SelfArchiveScraper/1.0 (+contacto@example.org)"
TIMEOUT = 25
SLEEP = 0.6  # cortesía con los servidores
HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

# -------- Utils --------
def clean(s: Optional[str]) -> str:
    if not s:
        return ""
    return re.sub(r"\s+", " ", s).strip()

def fetch_html(url: str) -> Tuple[Optional[str], Optional[str]]:
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code != 200:
            return None, f"HTTP {r.status_code}"
        # Evitar PDFs (si el servidor redirige a un PDF directo no lo podemos parsear con HTML)
        ctype = r.headers.get("Content-Type", "").lower()
        if "pdf" in ctype:
            return None, "PDF content (skip HTML scraping)"
        return r.text, None
    except Exception as e:
        return None, str(e)
    finally:
        time.sleep(SLEEP)

def meta_values(soup: BeautifulSoup, names: List[str]) -> List[str]:
    vals: List[str] = []
    for name in names:
        # <meta name="..."> y <meta property="...">
        for m in soup.find_all("meta", attrs={"name": name}):
            v = clean(m.get("content"))
            if v:
                vals.append(v)
        for m in soup.find_all("meta", attrs={"property": name}):
            v = clean(m.get("content"))
            if v:
                vals.append(v)
    # dedup preservando orden
    seen, out = set(), []
    for v in vals:
        if v not in seen:
            out.append(v); seen.add(v)
    return out

# -------- Parsers --------
def parse_dspace_like(soup: BeautifulSoup) -> str:
    """
    DSpace 6/7: primero meta-tags (DC/DCTERMS/og/description),
    luego fallbacks visuales (tablas/listas/bloques).
    Devuelve abstract (string vacío si no hay).
    """
    # 1) meta
    meta_abst = meta_values(soup, [
        "DC.description.abstract", "DCTERMS.abstract",
        "DC.description", "og:description", "description"
    ])
    if meta_abst:
        # limpiar posibles tags embebidas
        return clean(re.sub(r"<[^>]+>", " ", meta_abst[0]))

    # 2) tablas/listas etiquetadas como Abstract/Resumen
    for lab in soup.find_all(["th", "dt", "span", "strong", "label"]):
        text = lab.get_text(" ", strip=True).lower()
        if any(k in text for k in ["abstract", "resumen"]):
            td = lab.find_next("td")
            if td:
                val = clean(td.get_text(" ", strip=True))
                if val:
                    return val
            dd = lab.find_next("dd")
            if dd:
                val = clean(dd.get_text(" ", strip=True))
                if val:
                    return val

    # 3) bloques con id/clase típica
    blk = soup.find(attrs={"id": re.compile(r"(abstract|resumen)", re.I)})
    if not blk:
        blk = soup.find(class_=re.compile(r"(abstract|resumen)", re.I))
    if blk:
        return clean(blk.get_text(" ", strip=True))

    return ""

def parse_ojs_like(soup: BeautifulSoup) -> str:
    """
    OJS (Open Journal Systems): meta citation_abstract y bloques #articleAbstract, etc.
    """
    # 1) meta
    meta_abst = meta_values(soup, [
        "citation_abstract", "DC.description", "DCTERMS.abstract",
        "og:description", "description"
    ])
    if meta_abst:
        return clean(meta_abst[0])

    # 2) bloque de abstract común en OJS
    blk = soup.select_one("#articleAbstract, section#abstract, .item.abstract, [id*=abstract], [class*=abstract]")
    if blk:
        return clean(blk.get_text(" ", strip=True))

    return ""

def parse_generic(soup: BeautifulSoup) -> str:
    """
    Fallback muy general: intenta encontrar un bloque con 'abstract/resumen'.
    """
    blk = soup.find(attrs={"id": re.compile(r"(abstract|resumen)", re.I)})
    if not blk:
        blk = soup.find(class_=re.compile(r"(abstract|resumen)", re.I))
    if blk:
        return clean(blk.get_text(" ", strip=True))
    # último intento: párrafos con 'Abstract'/'Resumen' como título cercano
    for tag in soup.find_all(["h2", "h3", "strong", "b"]):
        txt = tag.get_text(" ", strip=True).lower()
        if any(k in txt for k in ["abstract", "resumen"]):
            p = tag.find_next("p")
            if p:
                return clean(p.get_text(" ", strip=True))
    return ""

# -------- Router por dominio --------
def classify(url: str) -> str:
    u = url.lower()
    if "revistas." in u:
        return "ojs"
    if "/handle/" in u or "/items/" in u or "dspace" in u or "cic.gba.gob.ar" in u or "sedici." in u:
        return "dspace"
    return "unknown"

def extract_abstract(html: str, url: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    kind = classify(url)
    if kind == "dspace":
        abs_ = parse_dspace_like(soup)
        if abs_:
            return abs_
        # a veces los DSpace de revistas usan plantillas cercanas a OJS
        abs_ = parse_ojs_like(soup)
        if abs_:
            return abs_
        return parse_generic(soup)
    if kind == "ojs":
        abs_ = parse_ojs_like(soup)
        if abs_:
            return abs_
        # fallback dspace-like por si es híbrido
        abs_ = parse_dspace_like(soup)
        if abs_:
            return abs_
        return parse_generic(soup)
    # unknown → intentar todo
    for fn in (parse_dspace_like, parse_ojs_like, parse_generic):
        abs_ = fn(soup)
        if abs_:
            return abs_
    return ""

# -------- Main --------
def main():
    if len(sys.argv) < 2:
        sys.stderr.write("Uso: python scrape_self_archives.py <archivo_urls>\n")
        print("[]")
        return

    path = sys.argv[1]
    try:
        with open(path, "r", encoding="utf-8") as f:
            urls = [clean(line) for line in f if clean(line)]
    except Exception as e:
        sys.stderr.write(f"ERROR abriendo {path}: {e}\n")
        print("[]")
        return

    results: List[Dict[str, str]] = []

    for i, url in enumerate(urls, 1):
        sys.stderr.write(f"[{i}/{len(urls)}] Fetch {url}\n")
        sys.stderr.flush()

        # saltar workflow items (suelen requerir auth)
        if "/workflowitems/" in url:
            sys.stderr.write(f"  NOT FOUND (workflow item)\n")
            sys.stderr.flush()
            continue

        html, err = fetch_html(url)
        if err or not html:
            sys.stderr.write(f"  NOT FOUND ({err or 'no HTML'})\n")
            sys.stderr.flush()
            continue

        abstract = extract_abstract(html, url)
        if abstract:
            results.append({"self_archiving_url": url, "abstract": abstract})
            sys.stderr.write("  FOUND\n")
        else:
            sys.stderr.write("  NOT FOUND (empty abstract)\n")
        sys.stderr.flush()

    # solo los encontrados en JSON
    print(json.dumps(results, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()