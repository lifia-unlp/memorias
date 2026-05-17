const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env") });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULTS = {
  positionAtLab: ["Director", "Co-Director", "Researcher", "PhD Student", "Postdoc", "Technical Staff", "Collaborator"],
  positionAtUnlp: ["Profesor Titular", "Profesor Asociado", "Profesor Adjunto", "Jefe de Trabajos Prácticos", "Ayudante Diplomado", "None"],
  positionAtCIC: ["Investigador Principal", "Investigador Independiente", "Investigador Adjunto", "Investigador Asistente", "Personal de Apoyo", "None"],
  positionAtCONICET: ["Investigador Superior", "Investigador Principal", "Investigador Independiente", "Investigador Adjunto", "Investigador Asistente", "Personal de Apoyo", "None"],
  thesisLevel: ["PhD", "Masters", "Grade"],
  scholarshipType: ["Doctoral", "Postdoctoral", "Estímulo", "Iniciación"]
};

async function main() {
  console.log("Starting Configurable Lists Smart Seeding in Javascript...");
  const finalOptions = [];

  // 1. Lab Positions
  console.log("Analyzing Member.positionAtLab...");
  const existingLab = await prisma.member.findMany({
    select: { positionAtLab: true },
    distinct: ["positionAtLab"]
  });
  const labVals = new Set([
    ...DEFAULTS.positionAtLab,
    ...existingLab.map(x => x.positionAtLab?.trim()).filter(Boolean)
  ]);
  for (const val of labVals) {
    finalOptions.push({ listName: "positionAtLab", value: val });
  }

  // 2. UNLP Positions
  console.log("Analyzing Member.positionAtUnlp...");
  const existingUnlp = await prisma.member.findMany({
    select: { positionAtUnlp: true },
    distinct: ["positionAtUnlp"]
  });
  const unlpVals = new Set([
    ...DEFAULTS.positionAtUnlp,
    ...existingUnlp.map(x => x.positionAtUnlp?.trim()).filter(Boolean)
  ]);
  for (const val of unlpVals) {
    finalOptions.push({ listName: "positionAtUnlp", value: val });
  }

  // 3. CIC Positions
  console.log("Analyzing Member.positionAtCIC...");
  const existingCic = await prisma.member.findMany({
    select: { positionAtCIC: true },
    distinct: ["positionAtCIC"]
  });
  const cicVals = new Set([
    ...DEFAULTS.positionAtCIC,
    ...existingCic.map(x => x.positionAtCIC?.trim()).filter(Boolean)
  ]);
  for (const val of cicVals) {
    finalOptions.push({ listName: "positionAtCIC", value: val });
  }

  // 4. CONICET Positions
  console.log("Analyzing Member.positionAtCONICET...");
  const existingConicet = await prisma.member.findMany({
    select: { positionAtCONICET: true },
    distinct: ["positionAtCONICET"]
  });
  const conicetVals = new Set([
    ...DEFAULTS.positionAtCONICET,
    ...existingConicet.map(x => x.positionAtCONICET?.trim()).filter(Boolean)
  ]);
  for (const val of conicetVals) {
    finalOptions.push({ listName: "positionAtCONICET", value: val });
  }

  // 5. Thesis Level
  console.log("Analyzing Thesis.level...");
  const existingThesis = await prisma.thesis.findMany({
    select: { level: true },
    distinct: ["level"]
  });
  const thesisVals = new Set([
    ...DEFAULTS.thesisLevel,
    ...existingThesis.map(x => x.level?.trim()).filter(Boolean)
  ]);
  for (const val of thesisVals) {
    finalOptions.push({ listName: "thesisLevel", value: val });
  }

  // 6. Scholarship Type
  console.log("Analyzing Scholarship.type...");
  const existingScholarship = await prisma.scholarship.findMany({
    select: { type: true },
    distinct: ["type"]
  });
  const scholarshipVals = new Set([
    ...DEFAULTS.scholarshipType,
    ...existingScholarship.map(x => x.type?.trim()).filter(Boolean)
  ]);
  for (const val of scholarshipVals) {
    finalOptions.push({ listName: "scholarshipType", value: val });
  }

  // Write unique combined set to Database
  console.log(`Writing ${finalOptions.length} combined SystemOptions to database...`);
  for (const opt of finalOptions) {
    await prisma.systemOption.upsert({
      where: {
        listName_value: {
          listName: opt.listName,
          value: opt.value
        }
      },
      update: {},
      create: opt
    });
  }

  console.log("Configurable Lists Smart Seeding completed successfully!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
