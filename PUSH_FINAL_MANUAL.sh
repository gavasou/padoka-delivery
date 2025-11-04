#!/bin/bash

echo "🚀 EXECUTANDO PUSH FINAL - PADOKA DELIVERY"
echo "=========================================="
echo "⚠️  IMPORTANTE: As correções já estão commitadas localmente!"
echo "📊 Status: 7 commits à frente do GitHub"
echo ""

echo "📝 Verificando configuração..."
git config --global --add safe.directory /workspace
git config --global user.email "suporte@padoka.app"
git config --global user.name "Padoka Deploy"

echo "🔄 Enviando correções para GitHub..."
echo "Repositorio: https://github.com/gavasou/padoka-delivery"
echo ""

git push https://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@github.com/gavasou/padoka-delivery.git master

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ PUSH REALIZADO COM SUCESSO!"
    echo "🔄 Vercel vai fazer deploy automaticamente (2-3 minutos)"
    echo "🌐 Verifique o dashboard do Vercel"
else
    echo ""
    echo "❌ PUSH FALHOU"
    echo "🔧 Solução manual:"
    echo "git push origin master"
    echo "Ou force push:"
    echo "git push https://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@github.com/gavasou/padoka-delivery.git master --force"
fi