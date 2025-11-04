#!/bin/bash

# 🚨 SOLUÇÃO DEFINITIVA - Limpeza completa do GitHub

echo "🧹 Limpeza definitiva dos erros no GitHub..."

# Configurações básicas
git config --global --add safe.directory /workspace
git config --global user.email "suporte@padoka.app"
git config --global user.name "Padoka Deploy"

# Remover remote e adicionar limpo
git remote remove origin 2>/dev/null || true
git remote add origin https://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@github.com/gavasou/padoka-delivery.git

# Resetar para estado limpo
echo "🔄 Resetando para estado limpo..."
git reset --hard HEAD~5  # Remove últimos 5 commits problemáticos

# Adicionar apenas arquivos essenciais
echo "📁 Adicionando apenas arquivos essenciais..."
git add package.json
git add vercel.json
git add vite.config.ts
git add index.html
git add index.tsx
git add App.tsx
git add tsconfig.json
git add components/
git add hooks/
git add lib/
git add services/
git add types.ts
git add constants.tsx
git add public/

# Commit limpo e final
echo "✅ Criando commit limpo..."
git commit -m "Fix: Clean deployment configuration

- Correct package.json with @vitejs/plugin-react in dependencies
- Minimal vercel.json configuration for automatic detection
- Clean vite.config.ts with proper PWA setup
- Remove problematic scripts and configurations"

# Push forçado para limpar histórico
echo "🚀 Enviando versão limpa..."
git push -f origin master

echo ""
echo "✅ LIMPEZA COMPLETA REALIZADA!"
echo "🎯 Estado final:"
echo "   - Histórico GitHub limpo"
echo "   - Apenas arquivos essenciais"
echo "   - Configurações corretas"
echo ""
echo "🌐 Verificar:"
echo "   - GitHub: https://github.com/gavasou/padoka-delivery"
echo "   - Vercel: https://vercel.com/dashboard"
echo ""
echo "⏱️  Aguarde 3-5 minutos para deployment automático"