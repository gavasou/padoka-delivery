#!/bin/bash
# Script de verificação de build otimizado
# Uso: ./scripts/verify-build.sh

echo "🔍 Verificando build otimizado..."
echo "================================"

# Verificar se o build existe
if [ ! -d "dist" ]; then
    echo "❌ Build não encontrado. Execute: npm run build:production"
    exit 1
fi

echo "✅ Build encontrado"
echo ""

# Verificar tamanho total
TOTAL_SIZE=$(du -sh dist | cut -f1)
echo "📦 Tamanho total do build: $TOTAL_SIZE"

# Verificar assets
ASSETS_SIZE=$(du -sh dist/assets 2>/dev/null | cut -f1)
echo "📁 Tamanho dos assets: $ASSETS_SIZE"
echo ""

# Listar chunks principais
echo "📊 Principais chunks JavaScript:"
du -h dist/assets/*.js | sort -hr | head -10
echo ""

# Verificar compressão
echo "🗜️  Verificando compressão..."
if command -v gzip &> /dev/null; then
    echo "Gzip disponível: ✅"
else
    echo "Gzip disponível: ❌"
fi

# Verificar Workbox
if [ -f "dist/sw.js" ]; then
    SW_SIZE=$(du -h dist/sw.js | cut -f1)
    echo "Service Worker: ✅ ($SW_SIZE)"
else
    echo "Service Worker: ❌"
fi

# Verificar PWA manifest
if [ -f "dist/manifest.webmanifest" ]; then
    echo "PWA Manifest: ✅"
else
    echo "PWA Manifest: ❌"
fi

# Verificar configurações Vercel
if [ -f "vercel.json" ]; then
    echo "Configuração Vercel: ✅"
    if grep -q "gzip, br" vercel.json; then
        echo "  - Compressão Brotli/Gzip: ✅"
    fi
    if grep -q "max-age=31536000" vercel.json; then
        echo "  - Cache headers: ✅"
    fi
else
    echo "Configuração Vercel: ❌"
fi

echo ""
echo "🎯 Build verification complete!"
echo "Para fazer deploy: vercel --prod"
