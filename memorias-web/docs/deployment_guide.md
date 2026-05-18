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

## 🤖 Step 6: Exposing and Sharing the MCP Server over the Web (SSE Mode)

Your Model Context Protocol (MCP) server natively runs as a **Server-Sent Events (SSE)** web service. This means it listens on port `3001` as an HTTP server, allowing any authorized or public AI client (like a colleague's local Claude Desktop, a remote ChatGPT agent, or an open-data research bot) to converse with the **LIFIA** database securely over standard web protocols!

### 1. Build and Run the Docker Image on Proxmox
On your Ubuntu/Proxmox server, you can easily build and run the MCP web service as a Docker container:

```bash
# 1. Navigate to your MCP directory
cd /opt/memorias/memorias-mcp

# 2. Build the lightweight production Docker image
sudo docker build -t memorias-mcp .

# 3. Spin up the container, binding port 3001 and connecting to your Postgres container
sudo docker run -d \
  --name memorias-mcp-server \
  --network opt_memorias_default \
  -p 3001:3001 \
  -e DATABASE_URL=postgresql://postgres:postgres_secure_pwd@db:5432/memorias?schema=public \
  -e LAB_NAME=LIFIA \
  --restart always \
  memorias-mcp
```
*(Note: Replace `opt_memorias_default` with the name of the Docker Compose network created by your main `docker-compose.yml` so the MCP container can resolve the database hostname `@db` directly).*

---

### 2. Configure Nginx Reverse Proxy (Exposing to the Web)
To make the database securely queryable over the public web under SSL, add a reverse proxy block to your Nginx configuration on Proxmox:

```nginx
server {
    server_name mcp.lifia.info.unlp.edu.ar;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Connection '';
        proxy_http_version 1.1;
        chunked_transfer_encoding off;
        proxy_buffering off;
        proxy_cache off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```
*(Crucial Note: Server-Sent Events require keeping the connection open, so `proxy_set_header Connection '';` and turning off proxy buffering/caching are essential settings!)*

---

### 3. How Colleagues Connect to the Web MCP Server
Once exposed on the web under your URL, anyone can register your public LIFIA database inside their Claude Desktop client in a single second by pointing directly to the HTTP SSE endpoint!

They simply add this to their `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "lifia-public-mcp": {
      "url": "https://mcp.lifia.info.unlp.edu.ar/sse"
    }
  }
}
```

That's it! When they open Claude, it automatically connects to your public web server, streams your dynamic **LIFIA** tool schemas, and lets them converse with the live academic database in real-time with zero local setup!


