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

