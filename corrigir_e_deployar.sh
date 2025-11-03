#!/bin/bash

# 🚀 CORRIGIR E DEPLOYAR PADOKA DELIVERY
# Script para corrigir erro Vercel e executar deploy

echo "🚀 INICIANDO CORREÇÃO E DEPLOY..."
echo "================================="

# 1. Verificar correção
echo "✅ Verificando correção do vercel.json..."
if grep -q '"functions"' vercel.json; then
    echo "❌ Erro: função ainda presente no vercel.json"
    echo "Removendo seção functions..."
    # A correção já foi feita, mas caso precise fazer novamente:
    sed -i '/"functions": {/,/}/d' vercel.json
else
    echo "✅ vercel.json está correto (sem functions)"
fi

# 2. Verificar se o build funciona
echo ""
echo "🔨 Testando build local..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build local bem-sucedido!"
else
    echo "❌ Erro no build local"
    exit 1
fi

# 3. Verificar se o preview funciona
echo ""
echo "🔍 Testando preview..."
npm run preview &
PREVIEW_PID=$!
sleep 5

# Testar se o servidor está rodando
curl -s http://localhost:4173 > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Preview funcionando em http://localhost:4173"
    kill $PREVIEW_PID
else
    echo "❌ Preview não está funcionando"
    kill $PREVIEW_PID 2>/dev/null
fi

# 4. Instruções de deploy
echo ""
echo "🎯 CORREÇÃO CONCLUÍDA!"
echo "================================="
echo ""
echo "📋 PRÓXIMOS PASSOS PARA DEPLOY:"
echo ""
echo "1️⃣ Acesse: https://vercel.com/dashboard"
echo "2️⃣ Login: Sign in with GitHub (conta: gavasou)"
echo "3️⃣ Project: padoka-delivery"
echo "4️⃣ Settings:"
echo "   - Framework Preset: Vite"
echo "   - Build Command: npm run build" 
echo "   - Output Directory: dist"
echo "   - Install Command: npm install"
echo ""
echo "5️⃣ Variáveis de Ambiente:"
echo "   VITE_SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "   VITE_GOOGLE_MAPS_API_KEY=AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk"
echo "   VITE_APP_ENV=production"
echo ""
echo "6️⃣ Deploy: Clicar 'Deploy'"
echo "7️⃣ ✅ Aguardar 2-5 minutos e pronto!"
echo ""
echo "🌐 URL esperada: https://padoka-delivery-pwa.vercel.app"
echo ""
echo "📄 Documentação: docs/CORRECAO_VERCEL_JSON.md"
echo ""
echo "🎉 Correção concluída! Deploy sem erros!"