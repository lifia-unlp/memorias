import re
from dataclasses import dataclass
from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, computed_field


@dataclass(frozen=True)
class SessionId:
    value: str


class Message(BaseModel):
    model_config = {"frozen": True}
    role: Literal["system", "user", "assistant", "tool"]
    content: str


class ChatRequest(BaseModel):
    model_config = {"frozen": True}
    messages: list[Message]


class Member(BaseModel):
    model_config = {"frozen": True}
    id: str
    firstName: str
    lastName: str
    slug: str
    startDate: date | None = None
    endDate: date | None = None
    highestDegree: str | None = None
    coursesAtUNLP: str | None = None
    positionAtLab: str | None = None
    positionAtUnlp: str | None = None
    category: str | None = None
    sicadiCategory: str | None = None
    positionAtCIC: str | None = None
    positionAtCONICET: str | None = None
    personalEmail: str | None = None
    institutionalEmail: str | None = None
    phone: str | None = None
    webPage: str | None = None
    orcid: str | None = None
    dblpProfile: str | None = None
    googleResearchProfile: str | None = None
    researchGateProfile: str | None = None
    shortCvInSpanish: str | None = None
    shortCvInEnglish: str | None = None
    interestsInEnglish: str | None = None
    interestsInSpanish: str | None = None
    affiliations: str | None = None
    notes: str | None = None
    avatarUrl: str | None = None
    tags: list[str] = []
    createdAt: datetime
    updatedAt: datetime


class Project(BaseModel):
    model_config = {"frozen": True}
    id: str
    title: str
    code: str | None = None
    slug: str
    startDate: date | None = None
    endDate: date | None = None
    director: str | None = None
    coDirector: str | None = None
    responsibleGroup: str | None = None
    fundingAgency: str | None = None
    amount: str | None = None
    summary: str | None = None
    website: str | None = None
    tags: list[str] = []
    featured: bool = False
    createdAt: datetime
    updatedAt: datetime


class Thesis(BaseModel):
    model_config = {"frozen": True}
    id: str
    title: str
    slug: str
    career: str | None = None
    level: str | None = None
    student: str | None = None
    director: str | None = None
    coDirector: str | None = None
    otherAdvisors: str | None = None
    startDate: date | None = None
    endDate: date | None = None
    summary: str | None = None
    reportUrl: str | None = None
    progress: int | None = None
    keywords: str | None = None
    website: str | None = None
    tags: list[str] = []
    featured: bool = False
    createdAt: datetime
    updatedAt: datetime


class Scholarship(BaseModel):
    model_config = {"frozen": True}
    id: str
    title: str
    slug: str
    type: str | None = None
    student: str | None = None
    director: str | None = None
    coDirector: str | None = None
    fundingAgency: str | None = None
    startDate: date | None = None
    endDate: date | None = None
    summary: str | None = None
    tags: list[str] = []
    createdAt: datetime
    updatedAt: datetime


def get_bibtex_string(val: Any) -> str:
    if not val:
        return ""
    if isinstance(val, (str, int, float)):
        return str(val)
    if isinstance(val, list):
        return " ".join(get_bibtex_string(v) for v in val)
    if isinstance(val, dict):
        if "value" in val:
            return get_bibtex_string(val["value"])
        for k in ("text", "name", "label"):
            if k in val:
                return get_bibtex_string(val[k])
        return str(val)
    return str(val)


def format_apa(pb: Any) -> str:
    try:
        bib = pb.bibtexData
        if (
            not bib
            or not isinstance(bib, dict)
            or bib.get("raw") is True
            or pb.authors == "Raw Reference"
            or not bib
        ):
            return (pb.title or "").strip()

        tags = bib.get("entryTags") or bib.get("tags") or bib

        authors_str = (
            pb.authors
            or get_bibtex_string(tags.get("author"))
            or get_bibtex_string(tags.get("authors"))
            or ""
        )
        if authors_str:
            author_list = [
                a.strip()
                for a in re.split(r"\s+and\s+", authors_str, flags=re.IGNORECASE)
            ]
            formatted_authors = []
            for auth in author_list:
                parts = auth.split(",")
                if len(parts) == 2:
                    last = parts[0].strip()
                    first_parts = parts[1].strip().split()
                    initials = " ".join(f"{f[0].upper()}." for f in first_parts if f)
                    formatted_authors.append(f"{last}, {initials}")
                else:
                    names = auth.split()
                    if len(names) > 1:
                        last = names[-1]
                        first_initials = " ".join(
                            f"{n[0].upper()}." for n in names[:-1] if n
                        )
                        formatted_authors.append(f"{last}, {first_initials}")
                    else:
                        formatted_authors.append(auth)

            if len(formatted_authors) > 1:
                last_auth = formatted_authors.pop()
                authors_str = f"{', '.join(formatted_authors)} & {last_auth}"
            elif formatted_authors:
                authors_str = formatted_authors[0]
            else:
                authors_str = ""

        title = get_bibtex_string(tags.get("title")) or pb.title or ""
        year = get_bibtex_string(tags.get("year")) or pb.year or ""
        entry_type = get_bibtex_string(
            bib.get("entryType") or bib.get("type") or pb.type or ""
        ).lower()

        citation = f"{authors_str} ({year}). {title}. "

        if entry_type == "article":
            journal = (
                get_bibtex_string(tags.get("journal"))
                or get_bibtex_string(tags.get("journaltitle"))
                or ""
            )
            volume = get_bibtex_string(tags.get("volume")) or ""
            number = get_bibtex_string(tags.get("number")) or ""
            pages = get_bibtex_string(tags.get("pages")) or ""
            if journal:
                citation += f"*{journal}*"
            if volume:
                citation += f", *{volume}*"
            if number:
                citation += f"({number})"
            if pages:
                citation += f", {pages}"
            citation += "."
        elif entry_type in ("inproceedings", "conference", "inbook"):
            booktitle = get_bibtex_string(tags.get("booktitle")) or ""
            pages = get_bibtex_string(tags.get("pages")) or ""
            publisher = get_bibtex_string(tags.get("publisher")) or ""
            if booktitle:
                citation += f"In *{booktitle}*"
            if pages:
                citation += f" (pp. {pages})"
            if publisher:
                citation += f". {publisher}"
            citation += "."
        elif entry_type == "book":
            publisher = get_bibtex_string(tags.get("publisher")) or ""
            address = get_bibtex_string(tags.get("address")) or ""
            citation = f"{authors_str} ({year}). *{title}*. "
            if address:
                citation += f"{address}: "
            if publisher:
                citation += f"{publisher}."
        elif entry_type in ("phdthesis", "mastersthesis"):
            school = get_bibtex_string(tags.get("school")) or ""
            type_label = (
                "Doctoral dissertation"
                if entry_type == "phdthesis"
                else "Master's thesis"
            )
            citation += f"({type_label}, {school})."
        else:
            howpublished = get_bibtex_string(tags.get("howpublished")) or ""
            note = get_bibtex_string(tags.get("note")) or ""
            if howpublished:
                citation += f"{howpublished}. "
            if note:
                citation += f"{note}."

        doi = (
            get_bibtex_string(tags.get("doi"))
            or get_bibtex_string(tags.get("DOI"))
            or ""
        )
        if doi:
            doi_url = doi.strip()
            if not doi_url.startswith("http"):
                doi_url = f"https://doi.org/{doi_url}"
            citation += f" DOI: [{doi_url}]({doi_url})"

        return citation
    except Exception:
        return f"{pb.authors}. ({pb.year}). {pb.title}."


class Publication(BaseModel):
    model_config = {"frozen": True}
    id: str
    slug: str
    type: str
    title: str
    authors: str
    year: int
    ranking: str | None = None
    selfArchivingUrl: str | None = None
    bibtexData: Any  # JSON field representing BibTex data
    tags: list[str] = []
    featured: bool = False
    createdAt: datetime
    updatedAt: datetime

    @computed_field  # type: ignore[prop-decorator]
    @property
    def apa_citation(self) -> str:
        return format_apa(self)
