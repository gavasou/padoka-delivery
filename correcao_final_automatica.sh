#!/bin/bash

# 🚨 CORREÇÃO AUTOMÁTICA FINAL - PADOKA DELIVERY
# Este script vai tentar fazer tudo automaticamente

echo "🚨 CORREÇÃO AUTOMÁTICA VERCEL.PADOKA"
echo "====================================="

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Não está no diretório do projeto padoka-delivery"
    echo "Execute este script no diretório onde está o package.json"
    exit 1
fi

echo "✅ Diretório correto encontrado"

# Fazer backup do vercel.json atual
if [ -f "vercel.json" ]; then
    echo "📦 Fazendo backup do vercel.json atual..."
    cp vercel.json vercel.json.backup.$(date +%Y%m%d_%H%M%S)
fi

# Criar o vercel.json corrigido
echo "🔧 Criando vercel.json corrigido..."
cat > vercel.json << 'EOF'
{"version": 3, "name": "padoka-delivery-pwa", "alias": ["padoka", "padoka-app", "padoka-delivery"], "builds": [{"src": "package.json", "use": "@vercel/static-build", "config": {"distDir": "dist"}}], "routes": [{"src": "/sw.js", "headers": {"Service-Worker-Allowed": "/", "Cache-Control": "public, max-age=0, must-revalidate"}}, {"src": "/manifest.webmanifest", "headers": {"Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=86400"}}, {"src": "/assets/(.*)", "headers": {"Cache-Control": "public, max-age=31536000, immutable"}}, {"src": "/(.*\\.(png|jpg|jpeg|gif|svg|webp|ico))", "headers": {"Cache-Control": "public, max-age=86400"}}, {"src": "/(.*)", "dest": "/index.html"}], "headers": [{"source": "/(.*\\.(js|css))", "headers": [{"key": "Content-Encoding", "value": "gzip, br"}, {"key": "Vary", "value": "Accept-Encoding"}]}, {"source": "/(.*)", "headers": [{"key": "X-Content-Type-Options", "value": "nosniff"}, {"key": "X-Frame-Options", "value": "DENY"}, {"key": "X-XSS-Protection", "value": "1; mode=block"}, {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"}, {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(self), payment=(self)"}, {"key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload"}, {"key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://maps.googleapis.com https://js.stripe.com https://aistudiocdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://maps.googleapis.com https://places.googleapis.com; frame-src https://js.stripe.com https://checkout.stripe.com; object-src 'none'; base-uri 'self'; manifest-src 'self';"}]}], "regions": ["iad1", "sfo1"], "github": {"silent": true}}
EOF

# Verificar se não há functions no arquivo
if grep -q "functions" vercel.json; then
    echo "❌ ERRO: A palavra 'functions' ainda está no arquivo!"
    exit 1
else
    echo "✅ Confirmação: 'functions' removido com sucesso!"
fi

# Inicializar git se não existir
if [ ! -d ".git" ]; then
    echo "📦 Inicializando git..."
    git init
    git remote add origin https://github.com/gavasou/padoka-delivery.git
fi

# Adicionar e commitar
echo "💾 Commitando alterações..."
git add vercel.json
git commit -m "Fix: Remove conflicting 'functions' property from vercel.json

- Resolved Vercel v3 configuration conflict
- Removed unnecessary functions section
- Keeps only builds section for React/Vite frontend
- Compatible with Supabase Edge Functions deployment"

echo ""
echo "🎯 PRÓXIMOS PASSOS MANUALMENTE:"
echo "================================"
echo ""
echo "OPÇÃO A - Push via CLI (se tiver Git configurado):"
echo "git push origin main"
echo ""
echo "OPÇÃO B - GitHub Desktop:"
echo "1. Abrir GitHub Desktop"
echo "2. Selecionar repositório padoka-delivery"
echo "3. Clicar 'Push origin'"
echo ""
echo "OPÇÃO C - Navegador:"
echo "1. https://github.com/gavasou/padoka-delivery"
echo "2. Upload: Arrastar vercel.json corrigido"
echo "3. Commit changes"
echo ""
echo "DEPOIS - Vercel Redeploy:"
echo "1. https://vercel.com/dashboard"
echo "2. Projeto: padoka-delivery"
echo "3. Botão: 'Redeploy'"
echo ""
echo "✅ Arquivo vercel.json corrigido e commitado!"
echo "🌐 URL final: https://padoka-delivery-pwa.vercel.app"