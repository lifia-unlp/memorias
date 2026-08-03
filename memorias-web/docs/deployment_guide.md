# Production Docker Deployment Guide

> [!TIP]
> **Unified Stack Deployment**: For the master deployment guide covering the entire ecosystem (Web Portal + PostgreSQL + AI Copilot containers), see the root **[DEPLOYMENT.md](../../DEPLOYMENT.md)**.

This guide describes how to deploy the modernized **Memorias Research Portal** in a Proxmox environment (running an Ubuntu Server VM or LXC container) using Docker containers.

---

## 🏗️ Architecture Overview

The production stack consists of:
1. **Next.js Web App**: Multi-stage, highly optimized Docker container.
2. **PostgreSQL Database**: Persistent database storing relational portal entries.

---

## 🛠️ Step 1: Prepare the Proxmox Ubuntu Environment

Ensure Docker and Docker Compose are installed on your Ubuntu Server. If not, run the following:

```bash
# Update Ubuntu package lists
sudo apt update && sudo apt upgrade -y

# Install Docker prerequisites
sudo apt install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine & Compose
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Enable and start Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Create the shared external network
sudo docker network create memorias-network
```

---

## 📦 Step 2: Main Application Docker Setup

Create a deployment directory on your server (e.g. `/opt/memorias`) and add these core configurations:

### 1. `Dockerfile` (Multi-stage next build)
Put this file in your root project folder to build a secure, lightweight Next.js image:

```dockerfile
# Stage 1: Dependencies
FROM node:19-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:19-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and build next app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Stage 3: Production Runner
FROM node:19-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy essential files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000

ENV PORT=3000
CMD ["npm", "run", "start"]
```

### 2. Docker Compose Configuration Files

#### A. `docker-compose.app.yml` (Next.js Application)
Save this inside `/opt/memorias/docker-compose.app.yml`:

```yaml
version: '3.8'

services:
  new-memorias:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: new-memorias
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres_secure_pwd@memorias-db:5432/memorias?schema=public
      - AUTH_SECRET=your_very_long_auth_jwt_secret_key
      - AUTH_URL=http://your-server-ip:3000
      # Google OAuth Credentials (Optional)
      - AUTH_GOOGLE_ID=your_google_oauth_client_id.apps.googleusercontent.com
      - AUTH_GOOGLE_SECRET=your_google_oauth_client_secret
      # GitHub OAuth Credentials (Optional)
      - AUTH_GITHUB_ID=your_github_client_id
      - AUTH_GITHUB_SECRET=your_github_client_secret
      # Microsoft OAuth (Entra ID) Credentials (Optional)
      - AUTH_MICROSOFT_ENTRA_ID_ID=your_microsoft_client_id
      - AUTH_MICROSOFT_ENTRA_ID_SECRET=your_microsoft_client_secret
    networks:
      - memorias-network

networks:
  memorias-network:
    external: true
```

#### B. `docker-compose.db.yml` (PostgreSQL Database)
Save this inside `/opt/memorias/docker-compose.db.yml`:

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: memorias-db
    restart: always
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres_secure_pwd
      - POSTGRES_DB=memorias
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d memorias"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - memorias-network

volumes:
  pgdata:

networks:
  memorias-network:
    external: true
```

---

## 🚀 Step 3: Run the deployment

1. **Boot your Database**:
   ```bash
   sudo docker compose -f docker-compose.db.yml up -d
   ```
2. **Boot the web portal**:
   ```bash
   sudo docker compose -f docker-compose.app.yml up -d
   ```
3. **Initialize the database tables**:
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx prisma db push
   sudo docker compose -f docker-compose.app.yml exec new-memorias node prisma/seed-options.js
   ```

At this stage, the web portal is running cleanly on **`http://<your-proxmox-ip>:3000`** with a fresh database!

---

## 🔒 Step 4: Post-Deployment Revalidation

After starting the services, log into the dashboard at `http://your-server-ip:3000` as an administrator to verify the active components, registered authors, and default settings load correctly.

---

## 🔑 Step 5: Configuring OAuth Identity Providers

The Memorias portal supports Google, GitHub, and Microsoft (Entra ID / Office 365) authentication. 

### Conditional Visibility Features
To simplify configuration and reduce user confusion, **only the identity providers that are fully configured in the environment will appear in the login window**. If an identity provider does not have both its Client ID and Client Secret specified, its login button will automatically be hidden. 

If no OAuth identity providers are configured, the login screen displays a prominent configuration alert banner (while local development mode retains a backdoor login for administrative testing).

### Provider Configuration Guide

#### 1. Google OAuth
- Go to the **Google Cloud Console** > **APIs & Services** > **Credentials**.
- Create an **OAuth 2.0 Client ID** as a *Web Application*.
- Set the **Authorized Redirect URI** to: `https://your-domain.com/api/auth/callback/google`.
- Set these variables in `docker-compose.app.yml` environment:
  - `AUTH_GOOGLE_ID`
  - `AUTH_GOOGLE_SECRET`

#### 2. GitHub OAuth
- Go to your GitHub account or Organization settings > **Developer Settings** > **OAuth Apps**.
- Click **New OAuth App**.
- Set the **Authorization callback URL** to: `https://your-domain.com/api/auth/callback/github`.
- Set these variables in `docker-compose.app.yml` environment:
  - `AUTH_GITHUB_ID`
  - `AUTH_GITHUB_SECRET`

#### 3. Microsoft OAuth (Entra ID / Office 365)
- Go to the **Microsoft Entra Admin Center** (formerly Azure Portal) > **App registrations**.
- Click **New registration** and name it (e.g. `Memorias Research Portal`).
- Set **Supported account types** to: *Accounts in any organizational directory (Any Microsoft Entra ID tenant - Multitenant) and personal Microsoft accounts (e.g. Skype, Xbox)*. This ensures personal, work, and school Outlook/Office accounts can authenticate without demanding tenant administrator approval.
- Set the **Redirect URI (Web)** to: `https://your-domain.com/api/auth/callback/microsoft-entra-id`.
- Generate a new client secret under **Certificates & secrets** > **Client secrets**.
- Set these variables in `docker-compose.app.yml` environment:
  - `AUTH_MICROSOFT_ENTRA_ID_ID`
  - `AUTH_MICROSOFT_ENTRA_ID_SECRET`

---

## Step 6: Database Backups & Disaster Recovery

To prevent data loss during upgrades or server maintenance, follow these commands to backup and restore your production database.

### 1. Backing Up the Database

Run this command from your host machine (where Docker is running) to create a compressed custom-format backup of your PostgreSQL database:

```bash
docker exec -t memorias-db pg_dump -U postgres -F c -d memorias > backup.dump
```

* **Note**: It is highly recommended to include the current date in the filename when performing manual backups:
  ```bash
  docker exec -t memorias-db pg_dump -U postgres -F c -d memorias > backup_$(date +%F).dump
  ```

### 2. Restoring the Database

If you need to restore your database from a backup file (e.g., `backup.dump`), run:

```bash
docker exec -i memorias-db pg_restore -U postgres -d memorias --clean --no-owner < backup.dump
```

* **Explanation of flags**:
  * `--clean`: Drops database objects (tables, indexes, etc.) before recreating them to ensure a clean state.
  * `--no-owner`: Skips setting the ownership of objects to match the original database, which avoids permission issues during restore.



