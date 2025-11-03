#!/bin/bash
echo "🧹 LIMPEZA RADICAL DO CACHE VERCEL + NPM"
echo "=========================================="

echo "🔍 Verificando arquivos que podem causar conflito..."

# Verificar se existe .npmrc
if [ -f ".npmrc" ]; then
    echo "⚠️ Encontrado .npmrc - removendo..."
    rm -f .npmrc
fi

# Verificar se existe package-lock.json
if [ -f "package-lock.json" ]; then
    echo "⚠️ Encontrado package-lock.json - removendo..."
    rm -f package-lock.json
fi

# Verificar se existe pnpm-lock.yaml
if [ -f "pnpm-lock.yaml" ]; then
    echo "⚠️ Encontrado pnpm-lock.yaml - removendo..."
    rm -f pnpm-lock.yaml
fi

# Verificar node_modules
if [ -d "node_modules" ]; then
    echo "⚠️ Encontrado node_modules - removendo..."
    rm -rf node_modules
fi

echo "🗑️ Limpando cache npm..."
npm cache clean --force 2>/dev/null || echo "Cache npm já limpo"

echo "📁 Criando estrutura ultra-minimal..."

# Criar package.json ultra-minimal
cat > package.json << 'EOF'
{
  "name": "padoka-delivery-pwa",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "vite": "^4.5.5"
  }
}
EOF

# Criar vercel.json ultra-minimal
cat > vercel.json << 'EOF'
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ]
}
EOF

echo "🎯 Configuração ultra-minimal criada!"
echo "📄 package.json: Apenas React + Vite (sem plugin-react)"
echo "📄 vercel.json: Build padrão apenas"
echo ""
echo "✅ PRÓXIMOS PASSOS:"
echo "1. Commit: ULTRA FIX - Limpeza cache completa"
echo "2. Commit: ULTRA FIX - Config minimal radical"
echo "3. Redeploy no Vercel"
echo ""
echo "🚨 AVISO: Esta configuração remove TODO plugin-react!"
echo "⚡ Se precisar de JSX, adicione @vitejs/plugin-react manualmente após o deploy funcionar!"