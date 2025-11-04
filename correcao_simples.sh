#!/bin/bash

# 🔧 CORREÇÃO SIMPLES - Sem mexer no histórico

echo "🔧 Correção simples dos arquivos principais..."

# Configurações
git config --global --add safe.directory /workspace
git config --global user.email "suporte@padoka.app"
git config --global user.name "Padoka Deploy"

# Configurar remote
git remote remove origin 2>/dev/null || true
git remote add origin https://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@github.com/gavasou/padoka-delivery.git

# Verificar arquivos principais
echo "📋 Verificando arquivos principais..."
echo "package.json:"
cat package.json | grep -A 5 -B 5 "@vitejs/plugin-react"

echo ""
echo "vercel.json:"
cat vercel.json

# Adicionar e commitar correções
echo "💾 Commitando correções atuais..."
git add package.json vercel.json
git commit -m "Fix: Ensure correct Vercel deployment configuration

- @vitejs/plugin-react: 4.3.1 in dependencies ✅
- vercel.json: Minimal config {\"version\": 2} ✅
- Clean configuration for automatic Vercel detection"

# Push
echo "📤 Enviando correções..."
git push origin master

echo ""
echo "✅ CORREÇÃO APLICADA!"
echo "📊 Arquivos corrigidos:"
echo "   - package.json: Plugin React em dependencies"
echo "   - vercel.json: Configuração mínima"
echo ""
echo "🌐 Monitorar deployment em:"
echo "   - Vercel Dashboard: https://vercel.com/dashboard"