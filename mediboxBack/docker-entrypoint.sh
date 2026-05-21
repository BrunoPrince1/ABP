#!/bin/sh

echo "⏳ Aguardando PostgreSQL..."

# espera o banco responder
until nc -z postgres 5432; do
  sleep 1
done

echo "✅ PostgreSQL disponível!"

echo "🚀 Rodando migrations..."
npm run db:migrate

echo "🚀 Iniciando API..."
npm start