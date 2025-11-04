#!/bin/bash

echo "🚀 CORREÇÃO AUTOMÁTICA - PADOKA DELIVERY"
echo "========================================="

# Configurar git
echo "📝 Configurando git..."
git config --global --add safe.directory /workspace
git config --global user.email "suporte@padoka.app"
git config --global user.name "Padoka Deploy"

# Verificar status
echo "📊 Verificando status atual..."
git status

# Adicionar arquivos corrigidos
echo "➕ Adicionando arquivos corrigidos..."
git add package.json vercel.json .gitignore

# Commit das correções
echo "💾 Fazendo commit das correções..."
git commit -m "Fix: Correct Vercel build configuration"

# Push para GitHub
echo "🔄 Enviando para GitHub..."
git push https://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@github.com/gavasou/padoka-delivery.git master

echo "✅ CORREÇÕES APLICADAS!"
echo "🔍 Aguarde 2-3 minutos para o deploy automático do Vercel"
echo "🌐 Verifique o dashboard do Vercel para confirmar sucesso"