#!/bin/bash

echo "🚀 CORREÇÃO COMPLETA - NPM INSTALL"
echo "=================================="

# Verificar versão atual
echo "📋 Versão atual:"
node --version
npm --version

echo ""
echo "⚡ PASSO 1: Remover instalação anterior"
# Remover se existe global
npm uninstall -g padoka-delivery-pwa 2>/dev/null || echo "Não estava instalado globalmente"

# Limpar cache
echo ""
echo "🧹 PASSO 2: Limpar cache"
npm cache clean --force

# Remover node_modules e lock
echo ""
echo "🗑️ PASSO 3: Limpar arquivos"
rm -rf node_modules 2>/dev/null || echo "node_modules não existia"
rm -f package-lock.json 2>/dev/null || echo "package-lock.json não existia"

echo ""
echo "📦 PASSO 4: Instalar dependências"
echo "Tentando com dependências compatíveis para Node.js 18..."

# Tentar instalar com versão compatível
if npm install; then
    echo "✅ SUCESSO! npm install funcionou!"
else
    echo ""
    echo "⚠️ Ainda dando erro. Tentando com yarn..."
    
    # Instalar yarn se não existe
    if ! command -v yarn &> /dev/null; then
        echo "🔧 Instalando yarn..."
        npm install -g yarn
    fi
    
    # Tentar com yarn
    if yarn install; then
        echo "✅ SUCESSO! yarn install funcionou!"
    else
        echo ""
        echo "🚨 TODAS AS TENTATIVAS FALHARAM"
        echo ""
        echo "📋 SOLUÇÕES MANUAIS:"
        echo "1. Use o package.json compatível: package_v18_compatible.json"
        echo "2. Ou atualize o Node.js para v20+"
        echo "3. Ou use Docker com Node.js 20"
        echo ""
        echo "💾 Conteúdo para substituir package.json:"
        cat package_v18_compatible.json
    fi
fi

echo ""
echo "📋 RESUMO DO QUE FOI FEITO:"
echo "- Limpeza de cache npm"
echo "- Remoção de node_modules e package-lock.json"
echo "- Tentativa de instalação"
echo "- Backup de informações do sistema"