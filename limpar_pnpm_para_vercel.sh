#!/bin/bash

echo "🚀 SOLUÇÃO VERCEL - REMOVER PREFERÊNCIAS PNPM"

# Remover qualquer referência ao pnpm
echo "🧹 Limpando referências ao pnpm..."
rm -f pnpm-lock.yaml .pnpmrc package-lock.json node_modules

# Instalar apenas com npm
echo "📦 Instalando dependências com npm puro..."
npm install --legacy-peer-deps --prefer-offline

echo ""
echo "✅ PNPM removido, npm puro configurado!"
echo "🔧 Próximo: Push para GitHub para Vercel"