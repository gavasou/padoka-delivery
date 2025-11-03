#!/bin/bash

echo "🎯 VERIFICAÇÃO FINAL E OTIMIZAÇÕES"
echo "=================================="

# Verificar se não há arquivos do pnpm
echo "🔍 Verificando arquivos do pnpm..."
if [ -f "pnpm-lock.yaml" ] || [ -f ".pnpmrc" ]; then
    echo "⚠️ Encontrados arquivos do pnpm, removendo..."
    rm -f pnpm-lock.yaml .pnpmrc yarn.lock
else
    echo "✅ Nenhum arquivo do pnpm encontrado"
fi

# Verificar se não há scripts problemáticos no package.json
echo ""
echo "📋 Verificando package.json..."
if grep -q "build:production" package.json; then
    echo "⚠️ Encontrado script build:production (problemático), removendo..."
    sed -i '/build:production/d' package.json
fi

# Verificar se tem NODE_ENV nos scripts
if grep -q "NODE_ENV" package.json; then
    echo "⚠️ Encontrado NODE_ENV nos scripts (pode ser problemático), removendo..."
    sed -i 's/NODE_ENV=production //g' package.json
fi

echo ""
echo "✅ Package.json limpo!"
echo ""
echo "📄 CONTEÚDO FINAL PARA COPIAR NO GITHUB:"
echo "=========================================="
echo ""
echo "=== PACKAGE.JSON ==="
cat package.json
echo ""
echo "=== VERCEL.JSON ==="
cat vercel_final_funcional.json
echo ""
echo "=========================================="
echo "✅ PRONTO PARA PUSH NO GITHUB!"
echo ""
echo "🔗 LINKS DIRETOS:"
echo "1. https://github.com/gavasou/padoka-delivery/edit/main/package.json"
echo "2. https://github.com/gavasou/padoka-delivery/edit/main/vercel.json"
echo ""
echo "📝 COMMITS RECOMENDADOS:"
echo "1. 'Fix: Remove pnpm references, optimize dependencies'"
echo "2. 'Fix: Update vercel.json to version 2'"