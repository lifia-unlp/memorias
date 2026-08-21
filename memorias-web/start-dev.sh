#!/bin/bash

# Asegurar que se ejecuta en el directorio de memorias-web
cd "$(dirname "$0")"

echo "🚀 Iniciando base de datos local (Prisma Postgres Sandbox)..."
PRISMA_DEV_OUT=$(npx prisma dev --detach)
echo "$PRISMA_DEV_OUT"

DETECTED_URL=$(echo "$PRISMA_DEV_OUT" | grep -o 'postgres://[^ ]*' | head -n 1)

if [ -n "$DETECTED_URL" ]; then
  echo "✅ Base de datos sandbox activa en: $DETECTED_URL"
  export DATABASE_URL="$DETECTED_URL"
else
  echo "⚠️ No se detectó una URL dinámica de Prisma Sandbox, se utilizará la configuración de .env"
fi

echo "💻 Iniciando servidor Next.js..."
npm run dev

