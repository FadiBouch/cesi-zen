#!/bin/sh

echo "📦 Génération Prisma client..."
npx prisma generate

echo "🌱 Exécution des migrations..."
npx prisma db push

echo "🌱 Lancement du seed..."
npx prisma db seed

echo "🚀 Lancement de l'API..."


exec "$@"