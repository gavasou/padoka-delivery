#!/bin/bash

# 🚀 SCRIPT AUTOMÁTICO - UPLOAD SISTEMA PADOKA COM TOKEN
# Data: 2025-11-03
# Versão: 1.0.0

echo "🚀 SCRIPT DE UPLOAD AUTOMÁTICO COM TOKEN - SISTEMA PADOKA"
echo "=========================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar progresso
show_step() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

show_success() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')] ✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] ⚠️  $1${NC}"
}

show_error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ❌ $1${NC}"
}

# Verificar se é um diretório git
if [ ! -d ".git" ]; then
    show_step "Inicializando repositório Git..."
    git init
    git add .
    git commit -m "🥖 Sistema Padoka - Versão de produção - Upload inicial"
    git branch -M main
    show_success "Repositório Git inicializado"
else
    show_warning "Repositório Git já existe"
fi

echo ""
echo "🎯 CONFIGURAÇÃO DO UPLOAD:"
echo ""

# Perguntar usuário do GitHub
read -p "📝 Digite seu usuário do GitHub: " github_user

if [ -z "$github_user" ]; then
    show_error "Usuário GitHub não pode estar vazio"
    exit 1
fi

# Perguntar nome do repositório
read -p "📁 Nome do repositório (padrão: padoka-bakery): " repo_name

if [ -z "$repo_name" ]; then
    repo_name="padoka-bakery"
fi

# Perguntar token
echo ""
echo "🔐 DIGITE SEU TOKEN DO GITHUB:"
read -s -p "Token (começa com ghp_): " github_token

if [ -z "$github_token" ]; then
    show_error "Token não pode estar vazio"
    exit 1
fi

# Verificar se token começa com ghp_
if [[ ! "$github_token" =~ ^ghp_ ]]; then
    show_error "Token deve começar com 'ghp_'"
    exit 1
fi

echo ""
echo ""
show_success "Configurações coletadas!"
echo "• Usuário: $github_user"
echo "• Repositório: $repo_name"
echo "• Token: ${github_token:0:10}..."

# Configurar remote com token
show_step "Configurando repositório remoto..."
git remote remove origin 2>/dev/null || true
git remote add origin https://$github_user:$github_token@github.com/$github_user/$repo_name.git

show_success "Repositório remoto configurado"

# Fazer push
show_step "Fazendo upload para GitHub..."
if git push -u origin main; then
    show_success "🎉 UPLOAD REALIZADO COM SUCESSO!"
    echo ""
    echo "🌐 REPOSITÓRIO CRIADO:"
    echo "https://github.com/$github_user/$repo_name"
    echo ""
    
    # Próximos passos
    echo "🚀 PRÓXIMOS PASSOS - DEPLOY NO VERCEL:"
    echo ""
    echo "1. Acesse: https://vercel.com"
    echo "2. Login com GitHub"
    echo "3. Clique 'New Project'"
    echo "4. Import repositório '$repo_name'"
    echo "5. Deploy automático!"
    echo ""
    echo "⚙️ CONFIGURAÇÕES VERCEL:"
    echo "   Framework Preset: Vite"
    echo "   Build Command: npm run build"
    echo "   Output Directory: dist"
    echo ""
    echo "🔧 VARIÁVEIS DE AMBIENTE (Vercel → Settings → Environment Variables):"
    echo "   VITE_SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co"
    echo "   VITE_SUPABASE_ANON_KEY=[sua_chave_aqui]"
    echo ""
    echo "💰 CUSTO TOTAL: R$ 0/mês"
    echo "⏰ TEMPO DE DEPLOY: ~30 minutos"
    echo ""
    echo "🎉 SISTEMA PRONTO PARA RECEBER PEDIDOS!"
    
    # Salvar informações
    echo ""
    show_step "Salvando informações..."
    
    echo "📋 INFORMAÇÕES DO REPOSITÓRIO:" > github_info_final.txt
    echo "Repository: https://github.com/$github_user/$repo_name" >> github_info_final.txt
    echo "Data upload: $(date)" >> github_info_final.txt
    echo "Files uploaded: $(git rev-list --all --count)" >> github_info_final.txt
    echo "Repository size: $(du -sh . | cut -f1)" >> github_info_final.txt
    echo "" >> github_info_final.txt
    echo "PRÓXIMOS PASSOS:" >> github_info_final.txt
    echo "1. Deploy no Vercel (https://vercel.com)" >> github_info_final.txt
    echo "2. Configurar variáveis de ambiente" >> github_info_final.txt
    echo "3. Testar sistema completo" >> github_info_final.txt
    echo "" >> github_info_final.txt
    echo "CREDENCIAIS DE TESTE:" >> github_info_final.txt
    echo "Admin: admin@padoka.com / Padoka2025!" >> github_info_final.txt
    echo "Cliente: cliente@padoka.com / Padoka2025!" >> github_info_final.txt
    
    show_success "Informações salvas em github_info_final.txt"
    
else
    show_error "❌ ERRO NO UPLOAD"
    echo ""
    echo "Possíveis causas:"
    echo "1. Token inválido ou expirado"
    echo "2. Repositório já existe (delete primeiro)"
    echo "3. Sem permissão para criar repositório"
    echo "4. Nome do repositório inválido"
    echo ""
    echo "💡 SOLUÇÕES:"
    echo "1. Verifique se o token está correto"
    echo "2. Crie o repositório manualmente: https://github.com/new"
    echo "3. Verifique se tem permissões no GitHub"
    echo ""
fi

# Limpar token da memória
unset github_token

echo ""
show_success "🎯 UPLOAD CONCLUÍDO!"
show_success "📋 Verifique github_info_final.txt para detalhes"
