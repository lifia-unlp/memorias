import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set inside the environment.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Instantiate MCP Server
const server = new Server(
  {
    name: "memorias-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// 1. Expose standard text Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: "memorias://stats",
        name: "Memorias Statistics",
        mimeType: "text/plain",
        description: "General counts of researchers, publications, and theses in the repository."
      },
      {
        uri: "memorias://publications/recent",
        name: "Recent Publications",
        mimeType: "text/plain",
        description: "The 10 most recently added publications."
      }
    ]
  };
});

// Handle reading of exposed resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  
  if (uri === "memorias://stats") {
    const membersCount = await prisma.member.count();
    const projectsCount = await prisma.project.count();
    const thesesCount = await prisma.thesis.count();
    const publicationsCount = await prisma.publication.count();
    
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `Memorias Research Portal Statistics:\n- Total Members: ${membersCount}\n- Total Projects: ${projectsCount}\n- Total Theses: ${thesesCount}\n- Total Publications: ${publicationsCount}`
        }
      ]
    };
  }
  
  if (uri === "memorias://publications/recent") {
    const recent = await prisma.publication.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });
    
    const text = recent.map((p, i) => `${i+1}. [${p.year}] "${p.title}" by ${p.authors} (slug: ${p.slug})`).join("\n");
    return {
      contents: [
        {
          uri,
          mimeType: "text/plain",
          text: `Recent Publications:\n${text}`
        }
      ]
    };
  }
  
  throw new Error(`Resource not found: ${uri}`);
});

// 2. Define standard Tools for AI interactions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_members",
        description: "List all researchers/members with optional filters and token optimization.",
        inputSchema: {
          type: "object",
          properties: {
            positionAtLab: { type: "string", description: "Filter by lab position (e.g. Director, Researcher, PhD Student)" },
            active: { type: "boolean", description: "Filter by active user account status" },
            summaryOnly: { 
              type: "boolean", 
              default: true,
              description: "RECOMMENDED. If true, returns only basic fields (id, firstName, lastName, slug, positionAtLab). Set to false only if you explicitly need to read full CV/biography details." 
            },
            limit: { 
              type: "integer", 
              default: 20, 
              description: "Maximum number of members to return. Use smaller values to optimize token usage." 
            }
          }
        }
      },
      {
        name: "get_member_profile",
        description: "Get comprehensive profile details of a researcher using their slug.",
        inputSchema: {
          type: "object",
          properties: {
            slug: { type: "string", description: "The unique slug identifier of the member" }
          },
          required: ["slug"]
        }
      },
      {
        name: "search_publications",
        description: "Search publication records using query filters and token optimization.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search term matching title, authors, or tags" },
            year: { type: "integer", description: "Filter by publication year" },
            summaryOnly: { 
              type: "boolean", 
              default: true, 
              description: "RECOMMENDED. If true, returns only basic metadata (title, authors, year, slug). Set to false ONLY if you explicitly need to read the heavy raw BibTeX JSON citation data." 
            },
            limit: { 
              type: "integer", 
              default: 10, 
              description: "Maximum number of publications to return (max 50). Use smaller values to optimize token usage." 
            }
          }
        }
      },
      {
        name: "get_projects",
        description: "List all research projects with optional status, text, and token filters.",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["active", "completed", "all"], description: "Filter by project status (active has no endDate or endDate in future)" },
            query: { type: "string", description: "Search query matching title, code, or summary" },
            summaryOnly: { 
              type: "boolean", 
              default: true, 
              description: "RECOMMENDED. If true, returns only basic fields (title, slug, code, director, startDate, endDate). Set to false only if you explicitly need to read summaries, website links, and tags." 
            },
            limit: { 
              type: "integer", 
              default: 10, 
              description: "Maximum number of projects to return. Use smaller values to optimize token usage." 
            }
          }
        }
      },
      {
        name: "get_theses",
        description: "List all academic theses (PhD, Masters, Grade) with optional filters and token optimization.",
        inputSchema: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["in_progress", "completed", "all"], description: "Filter by status: completed (endDate exists or progress=100), in_progress (no endDate and progress < 100)" },
            level: { type: "string", description: "Filter by level (e.g. PhD, Masters, Grade)" },
            student: { type: "string", description: "Search by student name" },
            summaryOnly: { 
              type: "boolean", 
              default: true, 
              description: "RECOMMENDED. If true, returns only basic fields (title, slug, student, level, progress, endDate). Set to false only if you explicitly need to read summaries, advisors, and tag lists." 
            },
            limit: { 
              type: "integer", 
              default: 10, 
              description: "Maximum number of theses to return. Use smaller values to optimize token usage." 
            }
          }
        }
      }
    ]
  };
});

// 3. Handle Tool Calls from AI Client
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "get_members") {
    const filters: any = {};
    if (args?.positionAtLab) filters.positionAtLab = args.positionAtLab as string;
    
    if (args?.active !== undefined) {
      filters.user = { active: args.active as boolean };
    }
    
    const summaryOnly = args?.summaryOnly !== false; // defaults to true
    const limit = Math.min(Number(args?.limit) || 20, 100);
    
    const selectFields = summaryOnly
      ? {
          id: true,
          firstName: true,
          lastName: true,
          slug: true,
          positionAtLab: true,
          positionAtUnlp: true
        }
      : undefined;
    
    const members = await prisma.member.findMany({
      where: filters,
      select: selectFields as any,
      take: limit,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
    });
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(members, null, 2)
        }
      ]
    };
  }
  
  if (name === "get_member_profile") {
    const slug = args?.slug as string;
    const member = await prisma.member.findUnique({
      where: { slug },
      include: {
        projects: { select: { title: true, slug: true } },
        theses: { select: { title: true, slug: true } },
        scholarships: { select: { title: true, slug: true } },
        publications: { select: { title: true, slug: true, year: true } }
      }
    });
    
    if (!member) {
      return {
        content: [{ type: "text", text: `Researcher with slug "${slug}" not found.` }],
        isError: true
      };
    }
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(member, null, 2)
        }
      ]
    };
  }
  
  if (name === "search_publications") {
    const query = args?.query as string || "";
    const year = args?.year as number;
    const summaryOnly = args?.summaryOnly !== false; // defaults to true
    const limit = Math.min(Number(args?.limit) || 10, 50);
    
    const filters: any = {};
    if (year) filters.year = year;
    
    if (query) {
      filters.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { authors: { contains: query, mode: "insensitive" } },
        { tags: { has: query } }
      ];
    }
    
    const selectFields = summaryOnly
      ? {
          id: true,
          slug: true,
          type: true,
          title: true,
          authors: true,
          year: true,
          featured: true
        }
      : undefined;
    
    const pubs = await prisma.publication.findMany({
      where: filters,
      select: selectFields as any,
      take: limit,
      orderBy: { year: "desc" }
    });
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(pubs, null, 2)
        }
      ]
    };
  }
  
  if (name === "get_projects") {
    const status = args?.status as string || "all";
    const query = args?.query as string || "";
    const summaryOnly = args?.summaryOnly !== false; // defaults to true
    const limit = Math.min(Number(args?.limit) || 10, 50);
    
    const filters: any = {};
    
    if (status === "active") {
      filters.OR = [
        { endDate: null },
        { endDate: { gte: new Date() } }
      ];
    } else if (status === "completed") {
      filters.endDate = { lt: new Date() };
    }
    
    if (query) {
      filters.AND = filters.AND || [];
      filters.AND.push({
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { code: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } }
        ]
      });
    }
    
    const selectFields = summaryOnly
      ? {
          id: true,
          title: true,
          slug: true,
          code: true,
          director: true,
          startDate: true,
          endDate: true,
          featured: true
        }
      : undefined;
    
    const projects = await prisma.project.findMany({
      where: filters,
      select: selectFields as any,
      take: limit,
      orderBy: { startDate: "desc" }
    });
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(projects, null, 2)
        }
      ]
    };
  }
  
  if (name === "get_theses") {
    const status = args?.status as string || "all";
    const level = args?.level as string;
    const student = args?.student as string;
    const summaryOnly = args?.summaryOnly !== false; // defaults to true
    const limit = Math.min(Number(args?.limit) || 10, 50);
    
    const filters: any = {};
    
    if (level) filters.level = level;
    if (student) filters.student = { contains: student, mode: "insensitive" };
    
    if (status === "completed") {
      filters.OR = [
        { endDate: { not: null } },
        { progress: 100 }
      ];
    } else if (status === "in_progress") {
      filters.endDate = null;
      filters.OR = [
        { progress: null },
        { progress: { lt: 100 } }
      ];
    }
    
    const selectFields = summaryOnly
      ? {
          id: true,
          title: true,
          slug: true,
          student: true,
          level: true,
          progress: true,
          endDate: true,
          featured: true
        }
      : undefined;
    
    const theses = await prisma.thesis.findMany({
      where: filters,
      select: selectFields as any,
      take: limit,
      orderBy: { startDate: "desc" }
    });
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(theses, null, 2)
        }
      ]
    };
  }
  
  throw new Error(`Tool not found: ${name}`);
});

// 4. Bind stdio transport
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Memorias MCP Server running on stdio transport!");
}

run().catch((error) => {
  console.error("Fatal error running MCP server:", error);
  process.exit(1);
});
