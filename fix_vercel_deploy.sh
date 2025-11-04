#!/bin/bash

# Script para corrigir deployment Vercel - Fix do @vitejs/plugin-react

echo "🔧 Corrigindo deployment Vercel..."

# Configura git com token
git config --global user.email "suporte@padoka.app"
git config --global user.name "Padoka Deploy"

# Remove remote existente e adiciona com token
git remote remove origin 2>/dev/null || true
git remote add origin https://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@github.com/gavasou/padoka-delivery.git

# Força push das mudanças
echo "📤 Enviando correções para GitHub..."
git add .
git commit -m "Fix: Move @vitejs/plugin-react to dependencies for Vercel build" || true
git push -f origin master

echo "✅ Mudanças enviadas! Vercel irá fazer redeploy automaticamente."
echo "🌐 Aguarde alguns minutos e verifique: https://vercel.com/dashboard"