#!/bin/bash
# 🎯 Script de Deploy Vercel - Padoka Bakery
# Execute este arquivo para deploy rápido

echo "🚀 Iniciando deploy Padoka Bakery no Vercel..."

# Verificar se Vercel está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Preparando projeto..."

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Se falhar, tentar com force
if [ $? -ne 0 ]; then
    echo "⚠️ Tentativa com --force..."
    npm install --force
fi

echo "🚀 Fazendo deploy no Vercel..."

# Deploy principal
vercel

echo "🌟 Deploy iniciado! Siga as instruções na tela."
echo "📝 Lembre-se de configurar as variáveis de ambiente:"
echo "   - VITE_SUPABASE_URL"
echo "   - VITE_SUPABASE_ANON_KEY"
echo "   - VITE_OPENAI_API_KEY (opcional)"
echo ""
echo "🎯 Para deploy de produção:"
echo "   vercel --prod"
echo ""
echo "✅ Deploy completo!"