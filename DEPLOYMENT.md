# Production Docker Deployment Guide

This guide is the unified, production-ready reference for deploying the modernized **Memorias Research Portal** and its **AI Conversational Copilot** using Docker containers, and executing the database migrations from legacy MongoDB instances.

---

## 🏗️ Architecture Overview

The production deployment runs as a containerized stack utilizing Docker containers:
1. **Next.js Web App**: Multi-stage, highly optimized Docker container (`new-memorias`) serving the portal on port `3000`.
2. **PostgreSQL Database**: Persistent database (`memorias-db`) serving relational portal entries on port `5432`.
3. **MongoDB Container (Temporary)**: Spun up temporarily (`mongodb-temp`) only during the initial legacy data migration phase.
4. **AI Copilot Container**: Python FastAPI backend and HTML frontend container (`memorias-copilot`) serving the assistant on port `8000`.

All containers communicate securely over a shared external Docker network named `memorias-network`.

---

## 🛠️ Step 1: Prepare the Host Environment (Ubuntu/LXC/VM)

Ensure Docker and Docker Compose are installed on your server:

```bash
# Update package lists
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

### 1. `Dockerfile` (Save in `/opt/memorias/Dockerfile` or build context root)
Put this file in your root project folder to build a secure, lightweight Next.js production image:

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

---

## 🐳 Step 3: Docker Compose Configurations

To maintain clean modularity, the stack is divided into independent Docker Compose files sharing `memorias-network`.

### A. `docker-compose.db.yml` (Relational Database)
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

### B. `docker-compose.app.yml` (Next.js Application)
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
      - MONGODB_URI=mongodb://mongodb-temp:27017
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

### C. `docker-compose.migration.yml` (Temporary MongoDB Engine)
This is only active during the initial data ingestion phase. Save this inside `/opt/memorias/docker-compose.migration.yml`:

```yaml
version: '3.8'

services:
  mongodb-temp:
    image: mongo:4.4
    container_name: mongodb-temp
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db
      - ./dump:/migration-dump
    networks:
      - memorias-network

volumes:
  mongodata:

networks:
  memorias-network:
    external: true
```

### D. `docker-compose.copilot.yml` (AI Copilot Assistant)
Save this inside `/opt/memorias/docker-compose.copilot.yml`:

```yaml
version: '3.8'

services:
  memorias-copilot:
    image: cientopolis/memorias-copilot:latest
    container_name: memorias-copilot
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres_secure_pwd@memorias-db:5432/memorias?schema=public
      - OPENAI_API_KEY=your_openai_api_key
      - OPENAI_MODEL=gpt-4o-mini
      - MEMORIAS_WEB_BASE_URL=http://new-memorias:3000
      - SESSION_TIMEOUT_SECONDS=3600
    volumes:
      - copilot-logs:/app/logs
    networks:
      - memorias-network

volumes:
  copilot-logs:

networks:
  memorias-network:
    external: true
```

---

## 🚀 Step 4: Step-by-Step Launch Order

Execute the following sequences on the host server to boot up and initialize the stack:

1. **Boot up your relational PostgreSQL instance**:
   ```bash
   sudo docker compose -f docker-compose.db.yml up -d
   ```
2. **Build and boot the web portal application**:
   ```bash
   sudo docker compose -f docker-compose.app.yml up -d --build
   ```
3. **Synchronize schemas and seed initial data**:
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx prisma db push
   sudo docker compose -f docker-compose.app.yml exec new-memorias node prisma/seed-options.js
   ```

At this stage, the web portal is running successfully on **`http://<server-ip>:3000`** with a fresh, empty schema!

---

## 🔄 Step 5: Legacy Data Migration

To populate your database with legacy entries from the old Pharo/MongoDB system:

### Option A: Migrating from a MongoDB Dump File (Recommended)
1. **Upload the Dump Directory**:
   Copy your `lifiometro` MongoDB dump folder onto the host machine at `/opt/memorias/dump/lifiometro`.
2. **Start the Migration Database**:
   ```bash
   sudo docker compose -f docker-compose.migration.yml up -d
   ```
3. **Restore the BSON Dump**:
   ```bash
   sudo docker compose -f docker-compose.migration.yml exec mongodb-temp mongorestore --db lifiometro /migration-dump/lifiometro
   ```
4. **Execute the Migration Script** (translates Mongo BSON records to relational Postgres schema):
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx tsx scripts/migrate.ts
   ```
5. **Mark Featured Items**:
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx tsx scripts/feature-items.ts
   ```
6. **Teardown Temporary MongoDB Instance**:
   ```bash
   sudo docker compose -f docker-compose.migration.yml down -v
   ```

### Option B: Migrating directly from an Active MongoDB Server
1. **Modify Configuration**:
   Update `MONGODB_URI` environment variable inside your `docker-compose.app.yml` file to point to your live remote MongoDB server:
   ```yaml
   - MONGODB_URI=mongodb://<remote-mongo-ip>:27017
   ```
2. **Execute scripts**:
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx tsx scripts/migrate.ts
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx tsx scripts/feature-items.ts
   ```

---

## 🤖 Step 6: Launching the AI Copilot Assistant

Once the database has been successfully migrated, start the conversational AI container:

```bash
sudo docker compose -f docker-compose.copilot.yml up -d
```
The assistant API will be available on port `8000`.

---

## 🔑 Step 7: Configuring OAuth Identity Providers

The Memorias portal supports Google, GitHub, and Microsoft (Entra ID / Office 365) authentication. 

### Dynamic Provider Button Visibility
Only the identity providers that have **both** their Client ID and Client Secret variables fully specified inside the `docker-compose.app.yml` environment block will show up as active login options. If any credential is omitted, that option is dynamically hidden.

### Provider Details:
- **Google OAuth**:
  - Authorized Redirect URI: `https://your-domain.com/api/auth/callback/google`
  - Variables: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
- **GitHub OAuth**:
  - Authorized Redirect URI: `https://your-domain.com/api/auth/callback/github`
  - Variables: `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`
- **Microsoft Entra ID**:
  - Authorized Redirect URI: `https://your-domain.com/api/auth/callback/microsoft-entra-id`
  - Variables: `AUTH_MICROSOFT_ENTRA_ID_ID`, `AUTH_MICROSOFT_ENTRA_ID_SECRET`

---

## 🔒 Step 8: Database Backups & Recovery

### 1. Backing Up the Database
Run this command from your host machine to generate a compressed custom-format PG backup file:
```bash
docker exec -t memorias-db pg_dump -U postgres -F c -d memorias > pre_migration_$(date +%F).dump
```

### 2. Restoring the Database
Restore your PostgreSQL database from a backup file:
```bash
docker exec -i memorias-db pg_restore -U postgres -d memorias --clean --no-owner < backup.dump
```
- `--clean`: Drops database objects before recreating them.
- `--no-owner`: Prevents setting table ownership constraints.
