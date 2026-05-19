import fs from "fs";
import path from "path";
import { Client } from "pg";

async function run() {
  console.log("🚀 Starting database read-only user setup...");

  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env file not found in the current working directory.");
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, "utf-8");

  // Parse DATABASE_URL
  const dbUrlMatch = envContent.match(/DATABASE_URL=["']?([^"'\n\s]+)["']?/);
  if (!dbUrlMatch) {
    console.error("❌ Could not find DATABASE_URL in .env file.");
    process.exit(1);
  }

  const databaseUrl = dbUrlMatch[1];
  console.log("🔗 Found database URL:", databaseUrl.replace(/:([^:@]+)@/, ":****@")); // hide password in console log

  // Extract database name from connection string
  // Matches the characters after the slash (excluding query parameters)
  const dbNameMatch = databaseUrl.match(/\/([^?\/]+)(\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : "template1";
  console.log(`📂 Target Database Name: "${dbName}"`);

  // Connect using pg client
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log("✅ Successfully connected as database superuser.");

    const readOnlyPassword = "memorias_readonly_password_secure_2026";

    // 1. Drop existing role if it exists to reset permissions cleanly
    console.log("⚙️ Resetting any existing 'memorias_readonly' role...");
    await client.query("DROP ROLE IF EXISTS memorias_readonly;").catch((err) => {
      console.warn("⚠️ Warning during role teardown:", err.message);
    });

    // 2. Create the readonly user role
    console.log("⚙️ Creating role 'memorias_readonly'...");
    await client.query(`CREATE ROLE memorias_readonly WITH LOGIN PASSWORD '${readOnlyPassword}';`);

    // 3. Grant connection permission on the database
    console.log(`⚙️ Granting CONNECT on database "${dbName}"...`);
    await client.query(`GRANT CONNECT ON DATABASE "${dbName}" TO memorias_readonly;`);

    // 4. Grant SELECT on public schema and whitelist research tables
    console.log("⚙️ Granting SELECT permissions on research tables...");
    const whitelistTables = [
      "Member", "Project", "Thesis", "Scholarship", "Publication",
      "_ProjectMembers", "_ThesisMembers", "_ScholarshipMembers", "_PublicationMembers",
      "_ProjectTheses", "_ProjectScholarships", "_ProjectPublications", "_ThesisPublications"
    ];

    for (const table of whitelistTables) {
      console.log(`   - Granting SELECT on "${table}"`);
      await client.query(`GRANT SELECT ON "${table}" TO memorias_readonly;`);
    }

    // 5. Explicitly revoke permissions from sensitive tables just in case
    console.log("🛡️ Explicitly revoking permissions on sensitive tables for strict safety...");
    const sensitiveTables = ["User", "Account", "Session", "AuditLog", "SystemSetting"];
    for (const table of sensitiveTables) {
      await client.query(`REVOKE ALL ON "${table}" FROM memorias_readonly;`).catch(() => {});
    }

    // 6. Formulate read-only connection string
    // Replace username/password in the original connection string
    let readOnlyUrl = databaseUrl
      .replace(/:\/\/([^:]+):([^@]+)@/, `://memorias_readonly:${readOnlyPassword}@`);

    console.log("✅ Database permissions successfully set up!");

    // 7. Update .env file automatically
    if (envContent.includes("DATABASE_READONLY_URL")) {
      // Overwrite existing DATABASE_READONLY_URL line
      const updatedEnv = envContent.replace(
        /DATABASE_READONLY_URL=["']?[^"'\n]+["']?/g,
        `DATABASE_READONLY_URL="${readOnlyUrl}"`
      );
      fs.writeFileSync(envPath, updatedEnv, "utf-8");
      console.log("📝 Updated DATABASE_READONLY_URL in .env file.");
    } else {
      // Append DATABASE_READONLY_URL to the file
      const updatedEnv = envContent + `\nDATABASE_READONLY_URL="${readOnlyUrl}"\n`;
      fs.writeFileSync(envPath, updatedEnv, "utf-8");
      console.log("📝 Appended DATABASE_READONLY_URL to .env file.");
    }

    console.log("\n✨ Read-only user setup completed successfully!");
    console.log("Use the following connection string for read-only tasks:");
    console.log(`DATABASE_READONLY_URL="${readOnlyUrl.replace(/:([^:@]+)@/, ":****@")}"\n`);

  } catch (error: any) {
    console.error("❌ Failed to set up read-only user:", error.message || error);
  } finally {
    await client.end();
  }
}

run();
