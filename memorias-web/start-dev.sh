#!/bin/bash

# Asegurar que se ejecuta en el directorio de memorias-web
cd "$(dirname "$0")"

echo "🚀 Iniciando base de datos local (Prisma Postgres Sandbox)..."
npx prisma dev --detach

echo "📡 Estado del sandbox:"
npx prisma dev ls

echo "💻 Iniciando servidor Next.js..."
npm run dev
