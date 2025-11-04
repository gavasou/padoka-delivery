#!/bin/bash

# 🚨 SCRIPT DE CORREÇÃO VERCEL - Executar manualmente

echo "🔧 Iniciando correção do deployment Vercel..."

# Etapa 1: Configurar Git
echo "⚙️  Configurando Git..."
git config --global --add safe.directory /workspace
git config --global user.email "suporte@padoka.app" 
git config --global user.name "Padoka Deploy"

# Etapa 2: Verificar status atual
echo "📋 Status atual do repositório:"
git status

# Etapa 3: Configurar remote com token
echo "🔗 Configurando conexão com GitHub..."
git remote remove origin 2>/dev/null || true
git remote add origin https://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@github.com/gavasou/padoka-delivery.git

# Etapa 4: Adicionar mudanças e commitar
echo "💾 Commitando correções..."
git add .
git commit -m "Fix: Move @vitejs/plugin-react to dependencies for Vercel build" || echo "Nada para commitar"

# Etapa 5: Push forçado
echo "📤 Enviando para GitHub..."
git push -f origin master

# Etapa 6: Confirmação
echo ""
echo "✅ CORREÇÃO APLICADA!"
echo "🌐 Verifique:"
echo "   - GitHub: https://github.com/gavasou/padoka-delivery"
echo "   - Vercel: https://vercel.com/dashboard" 
echo ""
echo "⏱️  Aguarde 2-5 minutos para o redeploy automático do Vercel"

# Etapa 7: Teste local (opcional)
echo ""
echo "🧪 Para testar localmente (opcional):"
echo "   npm install"
echo "   npm run build"