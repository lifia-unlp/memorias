# Local Development & Database Management Guide

This guide explains how to manage your local **Prisma Postgres** database sandbox and run the Next.js portal on your local machine.

---

## 🐘 1. Managing your local Prisma Postgres Database

Prisma v7 utilizes a lightweight local database engine running in the background. You do **not** need to install or run a separate PostgreSQL server on your Mac.

### Check if the database is running:
To list all active local database sandboxes and get their connection URLs:
```bash
npx prisma dev ls
```

### Start the database in the background (e.g. after a computer reboot):
If you restart your computer and the database status is stopped, start it in "detached" mode so it runs silently in the background:
```bash
npx prisma dev --detach
```

### Start the database in the foreground (blocking terminal tab):
```bash
npx prisma dev
```

### Stop the database sandbox:
```bash
npx prisma dev stop default
```

### Dropping and Recreating the Database:
Depending on whether you want to just clear the data or completely delete and recreate the local Postgres sandbox:

#### Method A: Reset all Tables and Clear Data (Keep the sandbox server running)
If the database server is already running, you can drop all tables and reset the schema to start fresh with a single command:
```bash
npx prisma db push --force-reset
```

#### Method B: Completely Drop and Recreate the Database Server Sandbox
To delete the actual sandbox database server instance and its underlying data files, and recreate a new one:
```bash
# 1. Stop and remove the database server sandbox (force stops it if running)
npx prisma dev rm default --force

# 2. Re-create and start a brand new database server sandbox in the background
npx prisma dev --detach

# 3. Push your Prisma schema to synchronize the new database
npx prisma db push
```

---

## 💻 2. Running the Next.js Web App

To start the modernized **Memorias** portal locally:

```bash
# Navigate to Next.js project folder
cd memorias-web

# Run the development server
npm run dev
```
Open **`http://localhost:3000`** in your browser. It will automatically connect to your running local database sandbox!

