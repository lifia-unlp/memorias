"use server";

import { auth } from "@/auth";
import {
  getLabSummaryStats,
  searchLabMembers,
  searchLabProjects,
  searchLabTheses,
  searchLabPublications,
  searchLabScholarships
} from "./db-tools";

// System prompt explaining that the assistant accesses research portal data via predefined type-safe TS tools
const SYSTEM_PROMPT = `You are a brilliant research assistant for MEMORIAS, a scientific research laboratory portal.
Your goal is to answer the user's natural language queries accurately by invoking the structured database search tools available to you.

You have access to the following predefined search functions:
1. getLabSummaryStats: Retrieve overall laboratory counts (Members, Projects, Theses, Publications, Scholarships) and top research tags. Use this when the user asks for database summaries, overview metrics, counts, or tag scopes.
2. searchLabMembers: Find scientific staff and researchers by name, position, or tags.
3. searchLabProjects: Find research projects by code, funding agency, title/summary keywords, or tags.
4. searchLabPublications: Search for papers by author name, title keywords, year, or tags.
5. searchLabTheses: Search academic theses defended at the lab by student name, director, career, level (PhD, Masters, Grade), or tags.
6. searchLabScholarships: Search student scholarships by student name, scholarship type, or tags.

CRITICAL INSTRUCTIONS:
- You must ONLY use the provided tools to query or fetch database records.
- Do not make assumptions or fabricate names, numbers, or dates. Rely entirely on the output of your tools.
- When returning your final response, provide a clean, helpful, markdown-formatted answer.
- If the results contain names, projects, theses, or publications, always use their slugs to build internal portal links!
  Example:
  - Member link: [First Last](/members/slug)
  - Project link: [Title](/projects/slug)
  - Thesis link: [Title](/theses/slug)
  - Scholarship link: [Title](/scholarships/slug)
  - Publication link: [Title](/publications/slug)
- Make your responses visual and premium! Use lists, tables, bold highlights, and clean spacing.`;

interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

/**
 * Server Action to handle the conversation with the OpenAI model.
 * Performs direct lookup through type-safe predefined DB tools.
 */
export async function sendChatMessage(messages: ChatMessage[]) {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session || !session.user?.active) {
      throw new Error("Unauthorized. Active session required to talk to the AI.");
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return {
        role: "assistant" as const,
        content: "Error: OpenAI API key is not configured in the server environment (.env file). Please contact your administrator.",
      };
    }

    // Prepare message history
    const fullMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
        ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
        ...(m.name ? { name: m.name } : {}),
      })),
    ];

    // Define custom tools
    const tools = [
      {
        type: "function",
        function: {
          name: "getLabSummaryStats",
          description: "Retrieve laboratory summary counts (Members, Projects, Theses, Publications, Scholarships) and top research tags."
        }
      },
      {
        type: "function",
        function: {
          name: "searchLabMembers",
          description: "Search laboratory researchers and scientific staff.",
          parameters: {
            type: "object",
            properties: {
              name: { type: "string", description: "First or last name to search." },
              position: { type: "string", description: "Position at laboratory (e.g. Director, Researcher)." },
              tags: { type: "array", items: { type: "string" }, description: "Research tags to filter by." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "searchLabProjects",
          description: "Search laboratory projects.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Keyword search on title, summary, or code." },
              fundingAgency: { type: "string", description: "Funding agency to filter by." },
              tags: { type: "array", items: { type: "string" }, description: "Tags to filter by." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "searchLabTheses",
          description: "Search academic theses defended at the lab.",
          parameters: {
            type: "object",
            properties: {
              student: { type: "string", description: "Name of student." },
              director: { type: "string", description: "Name of director or co-director." },
              level: { type: "string", enum: ["PhD", "Masters", "Grade"], description: "Thesis level." },
              tags: { type: "array", items: { type: "string" }, description: "Tags to filter by." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "searchLabPublications",
          description: "Search laboratory research publications.",
          parameters: {
            type: "object",
            properties: {
              query: { type: "string", description: "Keyword search on title." },
              author: { type: "string", description: "Filter by author name." },
              year: { type: "integer", description: "Filter by specific publication year." },
              tags: { type: "array", items: { type: "string" }, description: "Tags to filter by." }
            }
          }
        }
      },
      {
        type: "function",
        function: {
          name: "searchLabScholarships",
          description: "Search student scholarships.",
          parameters: {
            type: "object",
            properties: {
              student: { type: "string", description: "Name of student." },
              type: { type: "string", description: "Filter by scholarship type." },
              tags: { type: "array", items: { type: "string" }, description: "Tags to filter by." }
            }
          }
        }
      }
    ];

    // Call OpenAI
    let response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: fullMessages,
        tools,
        tool_choice: "auto",
        temperature: 0.1, // very deterministic to select the best tool
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI Chat Completion failed:", errText);
      throw new Error(`OpenAI API failed: ${response.statusText}`);
    }

    let data = await response.json();
    let choice = data.choices?.[0];
    let assistantMessage = choice?.message;

    // Check for tool calling
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResultsMessages: any[] = [];
      const executedTools: { name: string; result: any; error?: string }[] = [];

      for (const toolCall of assistantMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionArgs = JSON.parse(toolCall.function.arguments || "{}");

        let toolResult: any;
        let executionError: string | null = null;

        console.log(`⚡ AI Calling Predefined Tool: ${functionName}`, functionArgs);

        try {
          if (functionName === "getLabSummaryStats") {
            toolResult = await getLabSummaryStats();
          } else if (functionName === "searchLabMembers") {
            toolResult = await searchLabMembers(functionArgs);
          } else if (functionName === "searchLabProjects") {
            toolResult = await searchLabProjects(functionArgs);
          } else if (functionName === "searchLabTheses") {
            toolResult = await searchLabTheses(functionArgs);
          } else if (functionName === "searchLabPublications") {
            toolResult = await searchLabPublications(functionArgs);
          } else if (functionName === "searchLabScholarships") {
            toolResult = await searchLabScholarships(functionArgs);
          } else {
            throw new Error(`Unknown tool: ${functionName}`);
          }
        } catch (err: any) {
          executionError = err.message || "Unknown tool execution error.";
          console.error(`❌ Tool execution failed for ${functionName}:`, executionError);
        }

        toolResultsMessages.push({
          role: "tool" as const,
          tool_call_id: toolCall.id,
          name: functionName,
          content: executionError
            ? JSON.stringify({ error: executionError })
            : JSON.stringify(toolResult),
        });

        executedTools.push({
          name: functionName,
          result: toolResult,
          error: executionError || undefined,
        });
      }

      const updatedMessages = [
        ...messages,
        {
          role: "assistant" as const,
          content: assistantMessage.content || "",
          tool_calls: assistantMessage.tool_calls,
        },
        ...toolResultsMessages,
      ];

      // Second turn call to OpenAI to synthesize answer from tool data
      const secondResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
              ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
              ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
              ...(m.name ? { name: m.name } : {}),
            })),
          ],
          temperature: 0.2,
        }),
      });

      if (!secondResponse.ok) {
        const errText = await secondResponse.text();
        console.error("OpenAI second-turn Chat Completion failed:", errText);
        throw new Error(`OpenAI second-turn failed: ${secondResponse.statusText}`);
      }

      const secondData = await secondResponse.json();
      const finalChoice = secondData.choices?.[0];

      // Aggregate outputs for client UI consumption
      const toolNames = executedTools.map((t) => t.name).join(", ");
      let combinedResult: any = undefined;
      let combinedError: string | undefined = undefined;

      if (executedTools.length === 1) {
        combinedResult = executedTools[0].result;
        combinedError = executedTools[0].error;
      } else if (executedTools.length > 1) {
        const allArrays = executedTools.every((t) => Array.isArray(t.result));
        if (allArrays) {
          combinedResult = executedTools.flatMap((t) => t.result);
        } else {
          combinedResult = {};
          for (const t of executedTools) {
            combinedResult[t.name] = t.result;
          }
        }
        combinedError = executedTools.map((t) => t.error).filter(Boolean).join("; ") || undefined;
      }

      return {
        role: "assistant" as const,
        content: finalChoice?.message?.content || "I apologize, but I was unable to compile an answer.",
        toolCalled: toolNames,
        toolResult: combinedError ? undefined : combinedResult,
        toolError: combinedError || undefined,
      };
    }

    // Default response
    return {
      role: "assistant" as const,
      content: assistantMessage?.content || "No response received.",
    };
  } catch (error: any) {
    console.error("sendChatMessage error:", error);
    return {
      role: "assistant" as const,
      content: `I encountered an error while trying to process your request: ${error.message || error}`,
    };
  }
}
