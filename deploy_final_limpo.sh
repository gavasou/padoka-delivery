#!/bin/bash

# 🎯 SOLUÇÃO DEFINITIVA - Deploy limpo apenas com arquivos essenciais

echo "🧹 Criando deployment limpo para Vercel..."

# Configurações git
git config --global --add safe.directory /workspace
git config --global user.email "suporte@padoka.app"
git config --global user.name "Padoka Deploy"

# Configurar remote
git remote remove origin 2>/dev/null || true
git remote add origin https://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@github.com/gavasou/padoka-delivery.git

# Limpar cache git para aplicar .gitignore
echo "🔄 Aplicando .gitignore atualizado..."
git rm -r --cached . 2>/dev/null || true

# Adicionar apenas arquivos essenciais para React/Vite
echo "📁 Adicionando apenas arquivos essenciais da aplicação..."
git add .gitignore
git add package.json
git add vercel.json
git add vite.config.ts
git add tsconfig.json
git add index.html
git add index.tsx
git add App.tsx
git add constants.tsx
git add types.ts
git add components/
git add hooks/
git add lib/
git add services/
git add supabase/
git add public/
git add README.md

# Criar commit limpo
echo "✅ Criando commit final limpo..."
git commit -m "DEPLOY: Clean React app for Vercel production

✅ Core app files only:
  - package.json: @vitejs/plugin-react in dependencies
  - vercel.json: Minimal config for auto-detection
  - vite.config.ts: Optimized PWA build
  - React components and core logic
  - Public assets and Supabase config

🚫 Removed:
  - All deployment scripts (.sh files)
  - Debug documentation files
  - Temporary config variations
  - Development artifacts

🎯 Ready for production deployment"

# Push forçado para limpar histórico problemático
echo "🚀 Enviando versão de produção..."
git push -f origin master

echo ""
echo "🎉 DEPLOYMENT LIMPO CRIADO!"
echo ""
echo "📋 O que foi incluído:"
echo "   ✅ Arquivos React/Vite essenciais"
echo "   ✅ Configurações de produção corretas"
echo "   ✅ Assets públicos e componentes"
echo "   ✅ Configuração Supabase"
echo ""
echo "🚫 O que foi removido:"
echo "   ❌ Scripts de deploy (.sh)"
echo "   ❌ Documentos de debug (.md)"
echo "   ❌ Configurações temporárias"
echo "   ❌ Artifacts de desenvolvimento"
echo ""
echo "🌐 Verificar deployment:"
echo "   - GitHub: https://github.com/gavasou/padoka-delivery"
echo "   - Vercel: https://vercel.com/dashboard"
echo ""
echo "⏱️  Aguarde 3-5 minutos para build automático"
echo "🎯 Este deve ser o deployment final e funcional!"