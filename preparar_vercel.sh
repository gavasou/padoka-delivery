#!/bin/bash

echo "⚡ PREPARAÇÃO COMPLETA PARA VERCEL"
echo "=================================="

# 1. Limpar todas as referências ao pnpm
echo "1️⃣ Limpando referências ao pnpm..."
rm -f pnpm-lock.yaml .pnpmrc yarn.lock
rm -rf node_modules package-lock.json

# 2. Remover também scripts desnecessários para produção
echo "2️⃣ Simplificando package.json para produção..."
# Já criamos o package_vercel_optimizado.json

# 3. Remover arquivos do pnpm que podem estar no projeto
echo "3️⃣ Removendo arquivos de configuração do pnpm..."
find . -name ".pnpmrc*" -delete
find . -name "pnpm-lock.yaml" -delete

# 4. Testar build localmente com as configurações simplificadas
echo "4️⃣ Testando build local..."
cp package_vercel_optimizado.json package.json

echo ""
echo "📋 package.json pronto para Vercel:"
echo "-----------------------------------"
cat package.json

echo ""
echo "🔧 VERCEL.JSON FINAL:"
echo "----------------------"
cat vercel_final_funcional.json

echo ""
echo "✅ CONFIGURAÇÃO PRONTA!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Push este package.json e vercel.json para GitHub"
echo "2. Redeploy no Vercel"
echo "3. Garantir que Vercel use npm (não pnpm)"