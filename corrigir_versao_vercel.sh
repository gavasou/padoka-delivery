#!/bin/bash

echo "🔧 CORRIGINDO VERCEL.JSON PARA VERSÃO 2..."

# Fazer backup
cp vercel.json vercel_backup_$(date +%Y%m%d_%H%M%S).json

# Corrigir versão para 2
sed -i 's/"version": 3/"version": 2/g' vercel.json

echo "✅ vercel.json corrigido para versão 2"
echo "📁 Backup criado como vercel_backup_$(date +%Y%m%d_%H%M%S).json"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Acesse: https://github.com/gavasou/padoka-delivery/edit/main/vercel.json"
echo "2. Selecione todo conteúdo (Ctrl+A)"
echo "3. Substitua pelo conteúdo do arquivo: vercel_corrigido.json"
echo "4. Commit com mensagem: 'Fix vercel.json - Use version 2'"
echo "5. Redeploy no Vercel dashboard"
echo ""
echo "📄 Conteúdo correto para copiar:"
cat vercel_corrigido.json