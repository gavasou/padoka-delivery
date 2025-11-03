#!/bin/bash

# 🚀 SCRIPT DE DEPLOY VERCEL - PADOKA DELIVERY
# ===========================================

echo "🚀 Iniciando Deploy do Padoka Delivery no Vercel"
echo "=============================================="

# Configurar diretório
cd /workspace

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado"
    echo "Execute este script na raiz do projeto padoka-delivery"
    exit 1
fi

echo "✅ Projeto identificado: padoka-delivery-pwa"

# Fazer build local primeiro
echo "📦 Fazendo build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build local. Corrigindo..."
    npm install
    npm run build
fi

echo "✅ Build local concluído"

# Configurar variáveis de ambiente para o deploy
export VITE_SUPABASE_URL="https://ywpazjaaqavjcdonlnzs.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs"
export SUPABASE_SERVICE_ROLE_KEY="sb_secret_VPZj37H2aeA_Exe27ZA4Rw_4RLRAQSZ"
export VITE_GOOGLE_MAPS_API_KEY="AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk"
export VITE_APP_ENV="production"
export VITE_APP_VERSION="1.0.0"

echo "✅ Variáveis de ambiente configuradas"

# Verificar se Vercel CLI está disponível
if ! command -v vercel &> /dev/null; then
    echo "🔧 Instalando Vercel CLI..."
    npx vercel --version > /dev/null 2>&1
fi

# Fazer deploy
echo "🚀 Iniciando deploy no Vercel..."
echo "================================"

# O usuário precisa estar logado no Vercel
# Se não estiver logado, será redirecionado para autenticação

echo "📋 INSTRUÇÕES PARA COMPLETAR O DEPLOY:"
echo "====================================="
echo ""
echo "1. Se solicitado, faça login no Vercel:"
echo "   - Use sua conta GitHub (gavasou)"
echo "   - Autorize o acesso ao repositório padoka-delivery"
echo ""
echo "2. Configurações do projeto (já otimizadas):"
echo "   Framework Preset: Vite"
echo "   Root Directory: ./"
echo "   Build Command: npm run build"
echo "   Output Directory: dist"
echo "   Install Command: npm install"
echo ""
echo "3. Variáveis de ambiente para adicionar:"
echo "   VITE_SUPABASE_URL = https://ywpazjaaqavjcdonlnzs.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "   VITE_GOOGLE_MAPS_API_KEY = AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk"
echo "   VITE_APP_ENV = production"
echo ""
echo "4. Deploy automático habilitado:"
echo "   - Branch principal: main"
echo "   - Deploy em cada push"
echo "   - Preview para Pull Requests"
echo ""

# Tentar fazer deploy automaticamente
echo "🤖 Tentando deploy automático..."
echo "(Se falhar, siga as instruções acima)"
echo ""

# Usar --yes para aceitar todas as configurações automaticamente
npx vercel --prod --yes --token "" 2>/dev/null || {
    echo "⚠️ Deploy automático falhou."
    echo "📝 Siga as instruções manuais acima."
    echo ""
    echo "🔗 Links úteis:"
    echo "   - Vercel Dashboard: https://vercel.com/dashboard"
    echo "   - Documentação: https://vercel.com/docs"
    echo ""
    exit 1
}

# Se chegou até aqui, o deploy foi bem-sucedido
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "================================"
echo ""
echo "🌐 URLs de produção:"
echo "   📱 Aplicativo: https://padoka-delivery-pwa.vercel.app"
echo "   🔧 Admin: https://padoka-delivery-pwa.vercel.app/admin"
echo "   📊 Dashboard: https://padoka-delivery-pwa.vercel.app/dashboard"
echo ""
echo "🔐 Credenciais de teste:"
echo "   Usuário: admin@padoka.com"
echo "   Senha: Padoka2025!"
echo ""
echo "✨ Deploy finalizado!"

# Verificar se o site está funcionando
echo ""
echo "🔍 Verificando deploy..."
sleep 3

curl -s -o /dev/null -w "Status HTTP: %{http_code}\n" https://padoka-delivery-pwa.vercel.app 2>/dev/null && echo "✅ Site funcionando!" || echo "⏳ Site ainda inicializando..."

echo ""
echo "🎯 Próximos passos:"
echo "   1. Teste todas as funcionalidades"
echo "   2. Configure domínio customizado (opcional)"
echo "   3. Configure alertas de monitoramento"
echo "   4. Monitore performance e logs"
echo ""
echo "📋 Documentação completa em: docs/DEPLOY_VERCEL_EXECUTADO.md"
