#!/bin/bash

# 🚀 SCRIPT DE CORREÇÃO AUTOMÁTICA PADOKA DELIVERY
# Este script vai corrigir o vercel.json e fazer o push automaticamente

echo "🚀 CORREÇÃO AUTOMÁTICA DO DEPLOY PADOKA"
echo "======================================"

# Verificar se estamos no diretório correto
if [ ! -f "vercel.json" ]; then
    echo "❌ Arquivo vercel.json não encontrado!"
    echo "Certifique-se de que está no diretório do projeto padoka-delivery"
    exit 1
fi

echo "✅ Diretório verificado"

# Verificar se o arquivo já está correto
if grep -q '"functions"' vercel.json; then
    echo "🔧 Removendo seção functions do vercel.json..."
    
    # Fazer backup do arquivo original
    cp vercel.json vercel.json.backup
    
    # Remover a seção functions
    sed -i '/"functions": {/,/^[[:space:]]*}/d' vercel.json
    
    # Verificar se a correção foi aplicada
    if grep -q '"functions"' vercel.json; then
        echo "❌ Falha na remoção da seção functions"
        echo "Restaurando backup..."
        mv vercel.json.backup vercel.json
        exit 1
    else
        echo "✅ Seção functions removida com sucesso"
        rm vercel.json.backup
    fi
else
    echo "✅ Arquivo vercel.json já está correto"
fi

# Verificar se é um repositório git
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositório git..."
    git init
    git remote add origin https://github.com/gavasou/padoka-delivery.git
    echo "✅ Repositório git inicializado"
else
    echo "✅ Repositório git encontrado"
fi

# Adicionar arquivo corrigido
echo "📁 Adicionando arquivo vercel.json..."
git add vercel.json

# Commit das alterações
echo "💾 Fazendo commit..."
git commit -m "Fix: Remove conflicting 'functions' property from vercel.json

- Resolved Vercel v3 configuration conflict
- Removed unnecessary functions section
- Keeps only builds section for React/Vite frontend
- Compatible with Supabase Edge Functions deployment"

echo "✅ Commit realizado com sucesso!"

# Instruir sobre o push
echo ""
echo "🎯 PRÓXIMO PASSO - Fazer push manualmente:"
echo "============================================="
echo ""
echo "Para fazer o push, execute este comando:"
echo "git push origin main"
echo ""
echo "Ou se tiver configurações de auth configuradas:"
echo "git push -u origin main"
echo ""
echo "📋 Alternativa - Configure credentials:"
echo "git config credential.helper store"
echo "git remote set-url origin https://github.com/gavasou/padoka-delivery.git"
echo ""
echo "📱 OU use o GitHub Desktop:"
echo "1. Abra o GitHub Desktop"
echo "2. Selecione o repositório padoka-delivery"
"3. Clique 'Push origin'"
echo ""
echo "🌐 OU use o navegador:"
echo "1. https://github.com/gavasou/padoka-delivery"
echo "2. Clique 'uploading an existing file'"
echo "3. Arraste o arquivo vercel.json corrigido"
echo "4. Commit changes"
echo ""
echo "✅ Arquivo vercel.json está pronto para commit!"
echo "🚀 Depois do push, volte ao Vercel e faça redeploy!"

# Mostrar o conteúdo do arquivo corrigido
echo ""
echo "📄 VERIFICANDO ARQUIVO CORRIGIDO:"
echo "================================="
echo ""
echo "Seção functions deve estar ausente:"
grep -A 5 -B 5 "functions" vercel.json || echo "✅ Confirmação: seção functions não existe!"

echo ""
echo "🎉 Script concluído! Agora faça o push!"