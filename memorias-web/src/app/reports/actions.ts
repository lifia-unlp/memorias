"use server";

import { auth } from "@/auth";
import { reportService } from "@/lib/services/reportService";
import fs from "fs";
import path from "path";

export async function ensureActiveUser() {
  const session = await auth();
  if (!session || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
}

/**
 * Fetches all initialization data needed by the Report Builder page.
 */
export async function getReportInitData() {
  await ensureActiveUser();
  return reportService.getInitData();
}

interface PublicationFilters {
  memberIds?: string[];
  types?: string[];
  year?: string;
  style?: string;
  startYear?: number;
  endYear?: number;
  tags?: string[];
}

interface ProjectFilters {
  memberIds?: string[];
  startYear?: number;
  endYear?: number;
  tags?: string[];
}

interface ScholarshipFilters {
  memberIds?: string[];
  types?: string[];
  startYear?: number;
  endYear?: number;
  tags?: string[];
}

interface ThesisFilters {
  memberIds?: string[];
  levels?: string[];
  startYear?: number;
  endYear?: number;
  tags?: string[];
}

interface SortConfig {
  field: "year" | "title";
  direction: "asc" | "desc";
}

/**
 * Queries Publications based on filters and sorting configs
 */
export async function queryPublications(filters: PublicationFilters, sort: SortConfig) {
  await ensureActiveUser();
  return reportService.queryPublications(filters, sort);
}

/**
 * Queries Projects based on filters and sorting configs
 */
export async function queryProjects(filters: ProjectFilters, sort: SortConfig) {
  await ensureActiveUser();
  return reportService.queryProjects(filters, sort);
}

/**
 * Queries Scholarships based on filters and sorting configs
 */
export async function queryScholarships(filters: ScholarshipFilters, sort: SortConfig) {
  await ensureActiveUser();
  return reportService.queryScholarships(filters, sort);
}

/**
 * Queries Theses based on filters and sorting configs
 */
export async function queryTheses(filters: ThesisFilters, sort: SortConfig) {
  await ensureActiveUser();
  return reportService.queryTheses(filters, sort);
}

/**
 * Saves or updates a report configuration for the active user.
 */
export async function saveReport(data: { 
  id?: string; 
  title: string; 
  blocks: any[]; 
  ignoreDuplicateCheck?: boolean;
}) {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  return reportService.saveReport(session.user.id, data);
}

/**
 * Fetches all saved reports belonging to the authenticated user.
 */
export async function getReports() {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  return reportService.getReports(session.user.id);
}

/**
 * Fetches a single saved report by ID, verifying ownership.
 */
export async function getReport(id: string) {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  return reportService.getReport(id, session.user.id);
}

/**
 * Deletes a saved report by ID, verifying ownership.
 */
export async function deleteReport(id: string) {
  const session = await auth();
  if (!session || !session.user?.id || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }
  return reportService.deleteReport(id, session.user.id);
}

/**
 * Generates AI content for a report block based on user prompt, context, and max length constraints.
 * Restricted strictly for POWER_EDITOR and ADMIN roles.
 */
export async function generateReportAIContent(params: {
  prompt: string;
  maxLength: number;
  inputContent: string;
}) {
  const session = await auth();
  if (!session || !session.user?.active) {
    throw new Error("Unauthorized. Active session required.");
  }

  const isAuthorized = session.user.role === "ADMIN" || session.user.role === "POWER_EDITOR";
  if (!isAuthorized) {
    throw new Error("Unauthorized. GenAI blocks are restricted to Power Editors and Administrators.");
  }

  const { prompt, maxLength, inputContent } = params;
  if (!prompt.trim()) {
    return { content: "" };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key is missing. Please contact system administrator.");
  }

  let systemPrompt = "";
  try {
    const promptPath = path.join(process.cwd(), "src/lib/ai/system-prompt.txt");
    const systemPromptText = fs.readFileSync(promptPath, "utf-8");
    systemPrompt = systemPromptText.replace("{{MAX_LENGTH}}", maxLength.toString());
  } catch (readErr) {
    console.warn("Failed to read system prompt file, falling back to default.", readErr);
    systemPrompt = `You are an expert scientific reporting assistant for an R&D laboratory.
Analyze the academic data context provided by the user (which may contain lists of publications, projects, scholarships, theses, or text) and execute the requested instruction.

CRITICAL INSTRUCTIONS:
1. Format your response strictly in clean Markdown (using markdown headings, lists, bold text, etc.). Do NOT output any HTML tags under any circumstances.
2. Adhere strictly to the prompt instructions.
3. Rely only on the provided data context. Do not invent outputs.
4. Limit your output to at most ${maxLength} words.`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Context:\n${inputContent || "(No context blocks provided)"}\n\nTask: ${prompt}` }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI GenAI Report Generation failed:", errText);
      throw new Error(`LLM Generation failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return { content };
  } catch (err: any) {
    console.error("Failed to generate AI content:", err);
    throw new Error(err.message || "Failed to generate AI content.");
  }
}
