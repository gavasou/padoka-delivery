#!/bin/bash

# 🚨 CORREÇÃO URGENTE: Erro GitHub vercel.json

echo "🔧 Corrigindo erro no GitHub - vercel.json..."

# Configurar git
git config --global --add safe.directory /workspace
git config --global user.email "suporte@padoka.app"
git config --global user.name "Padoka Deploy"

# Remover e adicionar remote com token
git remote remove origin 2>/dev/null || true
git remote add origin https://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@github.com/gavasou/padoka-delivery.git

# Adicionar mudanças
echo "💾 Adicionando correções..."
git add vercel.json
git add package.json

# Commit das correções
echo "📝 Commitando correções..."
git commit -m "Fix: Correct vercel.json config and @vitejs/plugin-react dependencies

- Fix vercel.json: Use minimal config for automatic detection
- Ensure @vitejs/plugin-react is in dependencies (not devDependencies)
- Resolve GitHub deployment error marked with red X"

# Push das mudanças
echo "📤 Enviando correções para GitHub..."
git push -f origin master

echo ""
echo "✅ CORREÇÕES ENVIADAS!"
echo "🔍 Verificações:"
echo "   - vercel.json: Configuração mínima funcional"
echo "   - package.json: @vitejs/plugin-react em dependencies"
echo ""
echo "🌐 Monitorar:"
echo "   - GitHub: https://github.com/gavasou/padoka-delivery"
echo "   - Vercel: https://vercel.com/dashboard"
echo ""
echo "⏱️  Aguarde 2-3 minutos para redeploy automático"