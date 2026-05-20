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

### 2. Docker Compose Configuration Files

To make the environment highly modular, the services are split into three independent Docker Compose files. They all securely communicate over a shared Docker network named `memorias-network`.

First, create the shared external network on your server:
```bash
sudo docker network create memorias-network
```

#### A. `docker-compose.app.yml` (Next.js Application)
This file builds and launches the modernized portal under the service and container name **`new-memorias`**. Save this inside `/opt/memorias/docker-compose.app.yml`:

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

#### B. `docker-compose.db.yml` (Optional PostgreSQL Database)
This file provisions the persistent relational PostgreSQL database. 
> [!NOTE]
> If you already have an active PostgreSQL database hosted elsewhere, you do not need this file. Simply update the `DATABASE_URL` in `docker-compose.app.yml` to point directly to your existing database.

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

#### C. `docker-compose.migration.yml` (Temporary MongoDB Migration Engine)
This file is only spun up temporarily during the ingestion phase and is stopped immediately after the data transfer is complete. Save this inside `/opt/memorias/docker-compose.migration.yml`:

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

---

## 🚀 Step 3: Run the deployment

1. **Boot your Database (if needed)**:
   ```bash
   sudo docker compose -f docker-compose.db.yml up -d
   ```
2. **Boot the web portal**:
   ```bash
   sudo docker compose -f docker-compose.app.yml up -d
   ```
3. **Initialize the database tables** inside the application container:
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx prisma db push
   sudo docker compose -f docker-compose.app.yml exec new-memorias node prisma/seed-options.js
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
   Launch the pre-configured MongoDB container:
   ```bash
   sudo docker compose -f docker-compose.migration.yml up -d
   ```

3. **Restore the Dump into the Temporary Database**:
   Import the files into the MongoDB instance inside the container:
   ```bash
   sudo docker compose -f docker-compose.migration.yml exec mongodb-temp mongorestore --db lifiometro /migration-dump/lifiometro
   ```
   *(Verify that the dump data loaded successfully by checking the logs).*

4. **Run the Migration Script**:
   Execute our relational translator script inside the Next.js app container. Note that we specify the temporary database link via environment variable overrides:
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx tsx scripts/migrate.ts
   ```

5. **Mark Featured Items**:
   Mark three entities as featured programmatically:
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx tsx scripts/feature-items.ts
   ```

6. **Cleanup Migration Container**:
   Tear down the temporary MongoDB instance and its volumes to free system resources:
   ```bash
   sudo docker compose -f docker-compose.migration.yml down -v
   ```

---

### Option B: Migrating directly from an Active MongoDB Server
If your old MongoDB server is active and reachable over the network:

1. **Temporarily Configure MongoDB URI**:
   Modify `MONGODB_URI` environment variable inside your `docker-compose.app.yml` file to point to your live remote MongoDB server:
   ```yaml
   - MONGODB_URI=mongodb://<remote-mongo-ip>:27017
   ```
   *Note: Ensure the target server allows network connections on port 27017.*

2. **Execute the Migration Script**:
   Run the migration directly inside the container:
   ```bash
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx tsx scripts/migrate.ts
   sudo docker compose -f docker-compose.app.yml exec new-memorias npx tsx scripts/feature-items.ts
   ```

---

## 🔒 Step 5: Post-Migration Revalidation

After running either option, log into the dashboard at `http://your-server-ip:3000` as an administrator. Your migrated data, connected authors, theses, projects, and the 9 clean featured records will load instantly!

---

## 🔑 Step 6: Configuring OAuth Identity Providers

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


