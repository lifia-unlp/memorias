# Production Docker Deployment & MongoDB Migration Guide

This guide describes how to deploy the modernized **Memorias Research Portal** in a Proxmox environment (running an Ubuntu Server VM or LXC container) using Docker containers, and how to execute the database migrations from a live MongoDB instance or a local database dump.

---

## 🏗️ Architecture Overview

The production stack consists of:
1. **Next.js Web App**: Multi-stage, highly optimized Docker container.
2. **PostgreSQL Database**: Persistent database storing relational portal entries.
3. **MongoDB Container (Temporary)**: Spun up temporarily only during data migration phase if using a database dump file.

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
```

---

## 📝 Step 2: Docker Configuration Files

Create a directory on your Ubuntu server (e.g. `/opt/memorias`) and add these files:

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

### 2. `docker-compose.yml`
Save this compose configuration inside `/opt/memorias/docker-compose.yml`:

```yaml
version: '3.8'

services:
  # Next.js Application
  web:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: memorias-web
    restart: always
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres_secure_pwd@db:5432/memorias?schema=public
      - NEXTAUTH_SECRET=your_very_long_nextauth_jwt_secret_key
      - NEXTAUTH_URL=http://your-server-ip:3000
      - GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
      - GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
    depends_on:
      db:
        condition: service_healthy

  # PostgreSQL relational database
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

  # Temporary MongoDB (Only active during migration)
  mongodb-temp:
    image: mongo:6
    container_name: mongodb-temp
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db
      - ./dump:/migration-dump
    profiles:
      - migration # Only starts when requested via command

volumes:
  pgdata:
  mongodata:
```

---

## 🚀 Step 3: Run the deployment

1. Build and boot the stack:
   ```bash
   sudo docker compose up -d db web
   ```
2. Wait a few seconds, then initialize the database tables inside the web container:
   ```bash
   sudo docker compose exec web npx prisma db push
   sudo docker compose exec web node prisma/seed-options.js
   ```

At this stage, the web portal is running cleanly on **`http://<your-proxmox-ip>:3000`** with a fresh database!

---

## 🔄 Step 4: MongoDB Relational Data Migration

Depending on your source environment, choose **Option A** or **Option B**:

### Option A: Migrating from a MongoDB Dump File (Recommended)
If you have a database backup folder (e.g. `lifiometro` dump containing BSON/JSON files from your old server):

1. **Upload the Dump Folder**:
   Copy the `dump` folder containing your backup collections to the `/opt/memorias/dump` directory on the Ubuntu Server.
   
2. **Start the Temporary MongoDB Container**:
   Launch the pre-configured MongoDB container using the `migration` profile:
   ```bash
   sudo docker compose --profile migration up -d mongodb-temp
   ```

3. **Restore the Dump into the Temporary Database**:
   Import the files into the MongoDB instance inside the container:
   ```bash
   sudo docker compose exec mongodb-temp mongorestore --db lifiometro /migration-dump/lifiometro
   ```
   *(Verify that the dump data loaded successfully by checking the logs).*

4. **Run the Migration Script**:
   Execute our relational translator script inside the Next.js app container. Note that we specify the temporary database link:
   ```bash
   sudo docker compose exec web npx tsx scripts/migrate.ts
   ```

5. **Mark Featured Items**:
   Mark three entities as featured programmatically:
   ```bash
   sudo docker compose exec web npx tsx scripts/feature-items.ts
   ```

6. **Cleanup Migration Container**:
   Tear down the temporary MongoDB instance to free system resources:
   ```bash
   sudo docker compose --profile migration stop mongodb-temp
   sudo docker compose --profile migration rm -f mongodb-temp
   ```

---

### Option B: Migrating directly from an Active MongoDB Server
If your old MongoDB server is active and reachable over the network:

1. **Temporarily Configure MongoDB URI**:
   Modify `scripts/migrate.ts` line 60 to point to your live remote MongoDB server:
   ```typescript
   const mongoUri = "mongodb://<remote-mongo-ip>:27017";
   ```
   *Note: Ensure the target server allows network connections on port 27017.*

2. **Execute the Migration Script**:
   Run the migration directly inside the container:
   ```bash
   sudo docker compose exec web npx tsx scripts/migrate.ts
   sudo docker compose exec web npx tsx scripts/feature-items.ts
   ```

---

## 🔒 Step 5: Post-Migration Revalidation

After running either option, log into the dashboard at `http://your-server-ip:3000` as an administrator. Your migrated data, connected authors, theses, projects, and the 9 clean featured records will load instantly!

---

## 🤖 Step 6: Deploying and Sharing the MCP Server (AI Interface)

Your Model Context Protocol (MCP) server connects AI agents directly to the PostgreSQL database. There are two recommended ways to deploy and share this server with your colleagues at **LIFIA**:

### Option A: Local Run with Remote DB Connection (Simplest & Recommended)
Each colleague runs the MCP server locally on their own laptop, but configures it to talk to the **production database** on your Proxmox server.

1. **Ensure Proxmox Postgres is accessible**:
   Ensure that the PostgreSQL container exposes port `5432` to the network, and that your firewall allows connections from your colleagues' IPs.
2. **Colleague Local Configuration**:
   Each colleague clones the repository, runs `npm install && npm run build` inside `memorias-mcp`, and edits their local `claude_desktop_config.json` pointing to their local folder but using the **production Postgres connection string**:
   ```json
   {
     "mcpServers": {
       "memorias-mcp-prod": {
         "command": "node",
         "args": [
           "/absolute/path/to/memorias-mcp/dist/index.js"
         ],
         "env": {
           "DATABASE_URL": "postgresql://postgres:postgres_secure_pwd@<your-proxmox-ip>:5432/memorias?schema=public",
           "LAB_NAME": "LIFIA"
         }
       }
     }
   }
   ```

---

### Option B: Highly Secure Deployment via Docker & SSH Tunneling (Advanced)
If you want to host the server centrally on Proxmox, you can compile it into a Docker image, and let your colleagues connect to it **over secure SSH**. This avoids exposing port 5432 or opening any ports to the public internet!

1. **Build the Docker Image on Proxmox**:
   Inside `/opt/memorias/memorias-mcp/`, build the production docker image:
   ```bash
   sudo docker build -t memorias-mcp .
   ```

2. **Colleague Local Configuration over SSH**:
   Since MCP communicates over standard input/output (stdio), your colleagues can run the container remotely on the server using **SSH interactive piping**!
   They simply configure their local `claude_desktop_config.json` like this:
   ```json
   {
     "mcpServers": {
       "memorias-mcp-ssh": {
         "command": "ssh",
         "args": [
           "-t",
           "user@<your-proxmox-ip>",
           "docker run -i --rm -e DATABASE_URL=postgresql://postgres:postgres_secure_pwd@db:5432/memorias?schema=public -e LAB_NAME=LIFIA memorias-mcp"
         ]
       }
     }
   }
   ```
   *Note: Ensure your colleagues have SSH keys configured on the Proxmox server for seamless passwordless authentication.*

This delivers a state-of-the-art, secure, and incredibly powerful conversational AI interface for your entire research group!

