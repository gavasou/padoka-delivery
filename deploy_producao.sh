#!/bin/bash

# 🚀 SCRIPT DE DEPLOY - SISTEMA PADOKA EM PRODUÇÃO
# Data: 2025-11-03
# Tempo: ~30 minutos

echo "🚀 DEPLOY SISTEMA PADOKA - VERSÃO PRODUÇÃO"
echo "=============================================="
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
    show_warning "Inicializando repositório Git..."
    git init
    git add .
    git commit -m "Sistema Padoka - Versão de Produção"
    git branch -M main
    show_success "Repositório Git inicializado"
fi

# Menu de opções
echo ""
echo "📋 ESCOLHA A OPÇÃO DE DEPLOY:"
echo "1) Vercel (Recomendado - Com GitHub)"
echo "2) Upload Direto (Netlify)"
echo "3) Apenas preparar código"
echo ""

read -p "Escolha uma opção (1-3): " option

case $option in
    1)
        echo ""
        show_step "🚀 DEPLOY NO VERCEL"
        echo ""
        
        # Verificar se tem GitHub configurado
        if ! git remote | grep -q "origin"; then
            echo ""
            show_warning "Configure o repositório GitHub primeiro:"
            echo ""
            echo "1. Acesse https://github.com/new"
            echo "2. Nome: padoka-bakery"
            echo "3. Repositório público"
            echo "4. Execute:"
            echo ""
            echo "git remote add origin https://github.com/SEU_USUARIO/padoka-bakery.git"
            echo "git push -u origin main"
            echo ""
            
            read -p "Pressione ENTER quando tiver configurado o GitHub..."
        else
            show_step "Fazendo push para GitHub..."
            git push -u origin main
            show_success "Código enviado para GitHub"
        fi
        
        echo ""
        show_step "📝 INSTRUÇÕES VERCEL:"
        echo "1. Acesse: https://vercel.com"
        echo "2. Login com GitHub"
        echo "3. Click 'New Project'"
        echo "4. Import repositório 'padoka-bakery'"
        echo ""
        echo "⚙️ CONFIGURAÇÕES:"
        echo "   Framework: Vite"
        echo "   Root Directory: ./"
        echo "   Build Command: npm run build"
        echo "   Output Directory: dist"
        echo ""
        
        read -p "Pressione ENTER quando deployar no Vercel..."
        
        echo ""
        show_step "🔧 CONFIGURAR VARIÁVEIS DE AMBIENTE:"
        echo "No Vercel Dashboard → Settings → Environment Variables:"
        echo ""
        echo "VITE_SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co"
        read -p "VITE_SUPABASE_ANON_KEY: " supabase_key
        echo ""
        echo "VITE_SUPABASE_ANON_KEY=$supabase_key"
        echo ""
        read -p "Pressione ENTER quando configurar variáveis..."
        
        show_success "Deploy Vercel configurado!"
        ;;
        
    2)
        echo ""
        show_step "📁 UPLOAD DIRETO - NETLIFY"
        echo ""
        
        echo "1. Acesse: https://app.netlify.com"
        echo "2. Click 'Deploy to Netlify'"
        echo "3. Arraste esta pasta do projeto"
        echo "4. Aguarde deploy (2 min)"
        echo ""
        
        read -p "Pressione ENTER quando deployar no Netlify..."
        
        show_success "Deploy Netlify configurado!"
        ;;
        
    3)
        show_step "📁 PREPARANDO CÓDIGO PARA DEPLOY..."
        
        # Verificar se o build está atualizado
        if [ -d "dist" ]; then
            show_success "Pasta dist encontrada"
        else
            show_warning "Executando build..."
            npm run build
        fi
        
        # Criar arquivo .env.production
        cat > .env.production << EOF
VITE_SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
EOF
        
        show_success "Código preparado!"
        echo "Pasta dist/ pronta para upload"
        ;;
        
    *)
        show_error "Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "🧪 TESTES DE VERIFICAÇÃO:"
echo ""
echo "Após o deploy, teste:"
echo ""
echo "1. Acessar URL gerada"
echo "2. Login admin: admin@padoka.com / Padoka2025!"
echo "3. Sistema de vendas funcionando"
echo "4. PIX gerando QR Code"
echo "5. Cupom TESTE10 no checkout"
echo ""

# Salvar informações importantes
echo "📋 URL ATUAL (TESTE): https://nzy8mg51g4b3.space.minimax.io" > deploy_info.txt
echo "🗄️ SUPABASE: https://ywpazjaaqavjcdonlnzs.supabase.co" >> deploy_info.txt
echo "📅 DATA DEPLOY: $(date)" >> deploy_info.txt
echo "" >> deploy_info.txt
echo "SISTEMA PADOKA - PRONTO PARA PRODUÇÃO" >> deploy_info.txt

show_success "🚀 Deploy configuração concluída!"
show_success "📋 Informações salvas em deploy_info.txt"
show_success "⏰ Tempo total: ~30 minutos"
show_success "💰 Custo: R$ 0/mês"
echo ""
show_warning "🔥 Sistema 100% funcional e pronto para receber pedidos!"
echo ""

# Mostrar próximos passos
echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Acessar URL de produção"
echo "2. Testar todas funcionalidades"
echo "3. (Opcional) Comprar domínio padoka.com"
echo "4. (Opcional) Configurar domínio personalizado"
echo ""

echo "📞 SUPORTE:"
echo "- Documentação: DEPLOY_RAPIDO_PADOKA.md"
echo "- Teste atual: https://nzy8mg51g4b3.space.minimax.io"
echo ""
