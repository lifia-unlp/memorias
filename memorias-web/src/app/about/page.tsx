import React from "react";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Box, Container, Typography, Divider } from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

// Server-side function to read and fetch ABOUT.md contents
async function getAboutContent(): Promise<string> {
  const githubUrl =
    "https://raw.githubusercontent.com/casco/memorias-migration-antigrativy/main/ABOUT.md";
  
  try {
    const res = await fetch(githubUrl, {
      next: { revalidate: 60 }, // Cache for 60 seconds
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    if (res.ok) {
      return await res.text();
    }
  } catch (error) {
    console.warn(
      "Failed to fetch ABOUT.md from GitHub, falling back to local file:",
      error
    );
  }

  // Fallback to local files in the workspace
  try {
    // 1. Try parent directory (repo root when run inside memorias-web)
    const localPath = path.join(process.cwd(), "..", "ABOUT.md");
    if (fs.existsSync(localPath)) {
      return await fs.promises.readFile(localPath, "utf-8");
    }
    // 2. Try current directory as secondary fallback
    const appPath = path.join(process.cwd(), "ABOUT.md");
    if (fs.existsSync(appPath)) {
      return await fs.promises.readFile(appPath, "utf-8");
    }
  } catch (err) {
    console.error("Failed to read local ABOUT.md:", err);
  }

  // Default hardcoded fallback in case both network and disk are inaccessible
  return `# About Memorias\n\nWelcome to Memorias, a scientific research repository and laboratory management portal. Powered by LIFIA.`;
}

// Lightweight Inline Markdown Parser for React Nodes
function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let currentText = text;
  let keyIdx = 0;

  while (currentText.length > 0) {
    const boldMatch = currentText.match(/\*\*([\s\S]*?)\*\*/);
    const linkMatch = currentText.match(/\[([\s\S]*?)\]\(([\s\S]*?)\)/);
    const codeMatch = currentText.match(/`([\s\S]*?)`/);

    const boldIdx =
      boldMatch && boldMatch.index !== undefined ? boldMatch.index : Infinity;
    const linkIdx =
      linkMatch && linkMatch.index !== undefined ? linkMatch.index : Infinity;
    const codeIdx =
      codeMatch && codeMatch.index !== undefined ? codeMatch.index : Infinity;

    const minIdx = Math.min(boldIdx, linkIdx, codeIdx);

    if (minIdx === Infinity) {
      parts.push(<span key={keyIdx++}>{currentText}</span>);
      break;
    }

    if (minIdx > 0) {
      parts.push(
        <span key={keyIdx++}>{currentText.substring(0, minIdx)}</span>
      );
    }

    if (minIdx === boldIdx && boldMatch) {
      parts.push(
        <Box
          component="strong"
          key={keyIdx++}
          sx={{ fontWeight: 900, color: "text.primary" }}
        >
          {boldMatch[1]}
        </Box>
      );
      currentText = currentText.substring(boldIdx + boldMatch[0].length);
    } else if (minIdx === linkIdx && linkMatch) {
      const href = linkMatch[2];
      const isInternal = href.startsWith("/");
      parts.push(
        isInternal ? (
          <Link
            key={keyIdx++}
            href={href}
            style={{ color: "inherit", fontWeight: "bold" }}
          >
            {linkMatch[1]}
          </Link>
        ) : (
          <a
            key={keyIdx++}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "inherit", fontWeight: "bold" }}
          >
            {linkMatch[1]}
          </a>
        )
      );
      currentText = currentText.substring(linkIdx + linkMatch[0].length);
    } else if (minIdx === codeIdx && codeMatch) {
      parts.push(
        <Box
          component="code"
          key={keyIdx++}
          sx={{
            px: 0.5,
            py: 0.25,
            borderRadius: 1,
            bgcolor: "action.hover",
            fontSize: "0.75rem",
            fontFamily: "monospace",
            color: "secondary.main",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {codeMatch[1]}
        </Box>
      );
      currentText = currentText.substring(codeIdx + codeMatch[0].length);
    }
  }

  return parts;
}

// Block-level Parser that converts markdown text to semantic, styled React nodes
function parseMarkdownToJSX(md: string): React.ReactNode[] {
  const lines = md.split("\n");
  const blocks: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Group list items into a single UL component
    const isListItem = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    if (currentList.length > 0 && !isListItem && trimmed !== "") {
      blocks.push(
        <Box
          component="ul"
          key={`list-${listKey++}`}
          sx={{ pl: 3, my: 2.5, display: "flex", flexDirection: "column", gap: 1 }}
        >
          {currentList}
        </Box>
      );
      currentList = [];
    }

    if (trimmed === "---") {
      blocks.push(<Divider key={i} sx={{ my: 4 }} />);
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push(
        <Typography
          key={i}
          variant="h1"
          sx={{
            fontSize: { xs: "1.75rem", md: "2.25rem" },
            fontWeight: 900,
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
            mb: 3,
            mt: 2,
          }}
        >
          {parseInline(line.slice(2))}
        </Typography>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push(
        <Typography
          key={i}
          variant="h2"
          sx={{
            fontSize: { xs: "1.1rem", md: "1.25rem" },
            fontWeight: 700,
            mt: 5,
            mb: 2,
          }}
        >
          {parseInline(line.slice(3))}
        </Typography>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push(
        <Typography
          key={i}
          variant="h3"
          sx={{ fontSize: "1rem", fontWeight: 700, mt: 4, mb: 1.5 }}
        >
          {parseInline(line.slice(4))}
        </Typography>
      );
      continue;
    }

    if (isListItem) {
      const content = trimmed.slice(2);
      currentList.push(
        <Box component="li" key={`li-${i}`} sx={{ lineHeight: 1.7 }}>
          {parseInline(content)}
        </Box>
      );
      continue;
    }

    if (trimmed === "") {
      continue;
    }

    // Default: render line as a styled paragraph
    blocks.push(
      <Typography
        key={i}
        variant="body2"
        sx={{ mb: 2, lineHeight: 1.7, color: "text.secondary" }}
      >
        {parseInline(line)}
      </Typography>
    );
  }

  // Handle list items that were at the very end of the markdown string
  if (currentList.length > 0) {
    blocks.push(
      <Box
        component="ul"
        key={`list-${listKey++}`}
        sx={{ pl: 3, my: 2.5, display: "flex", flexDirection: "column", gap: 1 }}
      >
        {currentList}
      </Box>
    );
  }

  return blocks;
}

export default async function AboutPage() {
  const rawContent = await getAboutContent();
  const renderedElements = parseMarkdownToJSX(rawContent);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* Portal Header */}
      <Header />

      {/* Hero Banner Section */}
      <Box data-component-semantics="Hero banner"
        component="section"
        sx={{
          background: "linear-gradient(to bottom right, var(--mui-palette-primary-main), var(--mui-palette-primary-dark))",
          color: "primary.contrastText",
          py: { xs: 8, md: 10 },
          px: 3,
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)",
          position: "relative",
          overflow: "hidden",
          borderBottom: "1px solid",
          borderColor: "primary.dark",
        }}
      >
        {/* Decorative SVG background */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.1,
            pointerEvents: "none",
            color: "primary.contrastText",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0,50 Q25,30 50,50 T100,50 L100,100 L0,100 Z"
              fill="currentColor"
            />
          </svg>
        </Box>

        <Box
          sx={{
            maxWidth: "xl",
            mx: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 3,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box>
              <Box
                component="span"
                sx={{
                  fontSize: "0.625rem",
                  letterSpacing: "0.15em",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  color: "warning.light",
                  bgcolor: "rgba(255,255,255,0.1)",
                  px: 1.25,
                  py: 0.25,
                  borderRadius: 1,
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                System Context
              </Box>
            </Box>
            <Typography
              variant="h1"
              sx={{ fontSize: "2.25rem", fontWeight: 900, letterSpacing: "-0.025em" }}
            >
              About Memorias
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "primary.contrastText", opacity: 0.8, maxWidth: "36rem", lineHeight: 1.6 }}
            >
              Discover the history, objectives, and the unique agent-driven technology behind this scientific research catalog.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Container
        component="main"
        maxWidth="xl"
        sx={{ flex: 1, py: 5, px: { xs: 3, md: 3 } }}
      >
        <Box
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 3,
            borderRadius: 4,
            p: { xs: 4, md: 6 },
          }}
        >
          {/* Main Parsed Markdown Document */}
          <Box component="article" sx={{ maxWidth: "none" }}>
            {renderedElements}
          </Box>
        </Box>
      </Container>

      {/* Unified Footer */}
      <Footer />
    </Box>
  );
}
