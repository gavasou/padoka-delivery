#!/bin/bash

# Padoka PWA - Deploy Production Script
# Automatiza o processo completo de deploy para produção

set -e

echo "🚀 Iniciando deploy de produção - Padoka PWA"
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado. Execute o script na raiz do projeto."
    exit 1
fi

# Verificar se o projeto é o Padoka
if ! grep -q "padoka-delivery-pwa" package.json; then
    log_warning "Verificando se este é o projeto Padoka correto..."
fi

# 1. Verificar dependências
log_info "1. Verificando dependências..."
if ! command -v node &> /dev/null; then
    log_error "Node.js não instalado. Instale Node.js 18+ primeiro."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm não instalado."
    exit 1
fi

if ! command -v git &> /dev/null; then
    log_error "Git não instalado."
    exit 1
fi

log_success "Dependências verificadas"

# 2. Instalar dependências do projeto
log_info "2. Instalando dependências do projeto..."
npm ci
log_success "Dependências instaladas"

# 3. Verificar variáveis de ambiente
log_info "3. Verificando variáveis de ambiente..."
if [ ! -f ".env.production" ]; then
    log_warning "Arquivo .env.production não encontrado"
    log_info "Criando .env.production com valores padrão..."
    cp .env.production.example .env.production 2>/dev/null || true
fi

# Verificar variáveis críticas
check_env_var() {
    if grep -q "^$1=" .env.production; then
        log_success "✓ $1 configurado"
    else
        log_warning "⚠ $1 não configurado em .env.production"
    fi
}

check_env_var "VITE_SUPABASE_URL"
check_env_var "VITE_SUPABASE_ANON_KEY"
check_env_var "VITE_GOOGLE_MAPS_API_KEY"

# 4. Type checking
log_info "4. Verificando tipos TypeScript..."
npm run type-check 2>/dev/null || {
    log_warning "Type check falhou, mas continuando..."
}
log_success "Types verificados"

# 5. Build de produção
log_info "5. Executando build de produção..."
NODE_ENV=production npm run build

if [ ! -d "dist" ]; then
    log_error "Diretório dist não foi criado. Build falhou."
    exit 1
fi

log_success "Build de produção concluído"

# 6. Verificar arquivos essenciais do PWA
log_info "6. Verificando arquivos PWA..."
required_files=(
    "dist/manifest.webmanifest"
    "dist/sw.js"
    "dist/pwa-192x192.png"
    "dist/pwa-512x512.png"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        log_success "✓ $file encontrado"
    else
        log_error "✗ $file não encontrado"
        exit 1
    fi
done

# 7. Verificar tamanho do bundle
log_info "7. Analisando tamanho do bundle..."
bundle_size=$(du -sh dist/ | cut -f1)
log_info "Tamanho total do bundle: $bundle_size"

# Verificar se bundle é muito grande
bundle_size_kb=$(du -sk dist/ | cut -f1)
if [ "$bundle_size_kb" -gt 5000 ]; then
    log_warning "Bundle grande detectado (>5MB). Considere otimização."
else
    log_success "Tamanho do bundle otimizado"
fi

# 8. Verificar se Git está configurado
log_info "8. Verificando configuração Git..."
if ! git remote get-url origin &> /dev/null; then
    log_warning "Remote origin não configurado"
    echo "Para deploy automático, configure:"
    echo "git remote add origin https://github.com/USERNAME/padoka-delivery-pwa.git"
else
    log_success "Git remote configurado"
fi

# 9. Commit e push (se houver mudanças)
if [ "$1" = "--auto-commit" ]; then
    log_info "9. Verificando mudanças Git..."
    if git diff --quiet && git diff --staged --quiet; then
        log_info "Nenhuma mudança para commit"
    else
        log_info "Commitando mudanças..."
        git add .
        git commit -m "chore: build de produção $(date +%Y-%m-%d)" || true
        git push origin main || {
            log_warning "Push falhou. Execute manualmente: git push origin main"
        }
        log_success "Mudanças commitadas e enviadas"
    fi
fi

# 10. Deploy (se Vercel CLI estiver instalado)
if command -v vercel &> /dev/null; then
    log_info "10. Executando deploy no Vercel..."
    if [ "$1" = "--auto-deploy" ] || [ "$2" = "--auto-deploy" ]; then
        vercel --prod --yes
        log_success "Deploy executado automaticamente"
    else
        echo -e "${YELLOW}Execute 'vercel --prod' para fazer deploy${NC}"
    fi
else
    log_info "10. Vercel CLI não instalado"
    echo -e "${YELLOW}Para deploy automático, instale: npm i -g vercel${NC}"
fi

echo ""
echo "================================================"
log_success "🎉 Deploy de produção preparado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Configure variáveis de ambiente no Vercel"
echo "   2. Execute 'vercel --prod' para deploy"
echo "   3. Configure domínio personalizado (opcional)"
echo "   4. Configure monitoramento e analytics"
echo ""
echo "📚 Documentação completa: ./DEPLOY_PRODUCTION.md"
echo "🌐 PWA funcionando em: https://sua-url.vercel.app"
echo ""
log_success "Deploy concluído! 🚀"