#!/bin/bash

# Asegurar que se ejecuta en el directorio de memorias-web
cd "$(dirname "$0")"

echo "🚀 Iniciando contenedor Docker de PostgreSQL local..."
docker compose -f docker-compose-local-memorias-db.yml up -d

echo "💻 Iniciando servidor Next.js..."
npm run dev
