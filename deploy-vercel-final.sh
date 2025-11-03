#!/bin/bash

echo "🚀 Iniciando Deploy Automatizado do Padoka Delivery no Vercel"
echo "========================================================="

# Configurar variáveis de ambiente
export VITE_SUPABASE_URL="https://ywpazjaaqavjcdonlnzs.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs"
export SUPABASE_SERVICE_ROLE_KEY="sb_secret_VPZj37H2aeA_Exe27ZA4Rw_4RLRAQSZ"
export VITE_GOOGLE_MAPS_API_KEY="AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk"

echo "✅ Variáveis de ambiente configuradas"

# Fazer build local primeiro
echo "📦 Fazendo build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build local"
    exit 1
fi

echo "✅ Build local concluído com sucesso"

# Deploy no Vercel
echo "🚀 Fazendo deploy no Vercel..."
npx vercel --prod --yes

if [ $? -ne 0 ]; then
    echo "❌ Erro no deploy do Vercel"
    echo "Tente fazer login manualmente com: npx vercel login"
    exit 1
fi

echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🌐 URLs de produção:"
echo "==================="
echo "🌍 Site principal: https://padoka-delivery-pwa.vercel.app"
echo "🔧 Dashboard Admin: https://padoka-delivery-pwa.vercel.app/admin"
echo "📱 App PWA: https://padoka-delivery-pwa.vercel.app/dashboard"
echo ""
echo "🎯 Credenciais de Teste:"
echo "======================"
echo "Admin: admin@padoka.com / Padoka2025!"
echo ""
echo "✨ Deploy finalizado com sucesso!"
