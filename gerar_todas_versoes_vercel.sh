#!/bin/bash

echo "🚀 GERANDO VERCEL.JSON PARA TODAS AS SITUAÇÕES"

# Versão 1: Ultra simples
echo '{"version": 2, "builds": [{"src": "package.json", "use": "@vercel/static-build"}], "routes": [{"src": "/(.*)", "dest": "/index.html"}]}' > vercel_versao_1_ultra_simples.json

# Versão 2: Simples com configuração
echo '{"version": 2, "builds": [{"src": "package.json", "use": "@vercel/static-build", "config": {"distDir": "dist"}}], "routes": [{"src": "/(.*)", "dest": "/index.html"}]}' > vercel_versao_2_simples.json

# Versão 3: Sem routes (só builds)
echo '{"version": 2, "builds": [{"src": "package.json", "use": "@vercel/static-build"}]}' > vercel_versao_3_sem_routes.json

# Versão 4: Array vazio
echo '{"version": 2}' > vercel_versao_4_minimo.json

echo "✅ 4 versões criadas!"
echo ""
echo "📋 ORDEM DE TENTATIVA:"
echo "1º - vercel_versao_1_ultra_simples.json"
echo "2º - vercel_versao_2_simples.json" 
echo "3º - vercel_versao_3_sem_routes.json"
echo "4º - vercel_versao_4_minimo.json"
echo ""
echo "📄 Para copiar conteúdo:"
for file in vercel_versao_*.json; do
    echo ""
    echo "=== $file ==="
    cat "$file"
done