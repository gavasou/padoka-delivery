#!/bin/bash

# Script de Configuração - Padoka Funcionalidades Avançadas
# Este script ajuda a configurar as variáveis de ambiente necessárias

echo "🚀 Configuração das Funcionalidades Avançadas - Padoka"
echo "=================================================="
echo ""

# Função para gerar chaves VAPID
generate_vapid_keys() {
    echo "📱 Gerando chaves VAPID para notificações push..."
    
    if command -v npx &> /dev/null; then
        echo "Executando: npx web-push generate-vapid-keys"
        npx web-push generate-vapid-keys
        echo ""
        echo "✅ Chaves VAPID geradas!"
        echo "Copie as chaves acima e adicione ao seu arquivo .env.local"
        echo ""
    else
        echo "❌ npx não encontrado. Instale Node.js e tente novamente."
        echo "Ou gere as chaves em: https://vapidkeys.com/"
        echo ""
    fi
}

# Função para criar arquivo .env.local
create_env_file() {
    echo "📝 Criando arquivo .env.local..."
    
    cat > .env.local << 'EOF'
# =================================================
# Padoka - Funcionalidades Avançadas
# =================================================

# Web Push Notifications
VITE_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@padoka.com"

# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_WEBHOOK_VERIFY_TOKEN=""

# Analytics e Monitoramento
VITE_GA_MEASUREMENT_ID=""
ALERT_EMAIL="admin@padoka.com"
ALERT_SLACK_WEBHOOK=""

# Configurações de Backup
BACKUP_SCHEDULE="0 2 * * *"
BACKUP_RETENTION_DAYS="30"

# =================================================
# Configurações Existentes (já configuradas)
# =================================================

# Supabase
VITE_SUPABASE_URL="https://ywpazjaaqavjcdonlnzs.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_VPZj37H2aeA_Exe27ZA4Rw_4RLRAQSZ"

# Google Maps
VITE_GOOGLE_MAPS_API_KEY="AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk"

# Stripe (configurar quando necessário)
VITE_STRIPE_PUBLISHABLE_KEY=""
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
EOF

    echo "✅ Arquivo .env.local criado!"
    echo ""
}

# Função para mostrar instruções do WhatsApp
whatsapp_instructions() {
    echo "📞 Como configurar WhatsApp Business API:"
    echo "----------------------------------------"
    echo "1. Acesse: https://developers.facebook.com/"
    echo "2. Crie uma aplicação Business"
    echo "3. Adicione o produto 'WhatsApp Business'"
    echo "4. Configure um número de telefone"
    echo "5. Obtenha as credenciais:"
    echo "   - Access Token"
    echo "   - Phone Number ID"
    echo "   - Business Account ID"
    echo "6. Configure webhook para receber status de mensagens"
    echo ""
    echo "📖 Documentação: https://developers.facebook.com/docs/whatsapp/cloud-api/"
    echo ""
}

# Função para mostrar instruções do Supabase
supabase_instructions() {
    echo "🗄️ Como configurar variáveis no Supabase:"
    echo "----------------------------------------"
    echo "1. Acesse: https://supabase.com/dashboard"
    echo "2. Selecione o projeto: ywpazjaaqavjcdonlnzs"
    echo "3. Vá em Settings > Environment Variables"
    echo "4. Adicione as seguintes variáveis:"
    echo "   - VAPID_PRIVATE_KEY"
    echo "   - VAPID_SUBJECT"
    echo "   - WHATSAPP_ACCESS_TOKEN"
    echo "   - WHATSAPP_PHONE_NUMBER_ID"
    echo "   - WHATSAPP_BUSINESS_ACCOUNT_ID"
    echo "   - ALERT_EMAIL"
    echo "5. Redeploy das Edge Functions após configurar"
    echo ""
}

# Função para testar configurações
test_configurations() {
    echo "🧪 Testando configurações..."
    echo "----------------------------"
    
    # URL base das Edge Functions
    BASE_URL="https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1"
    
    echo "Testando system-monitor..."
    curl -s "$BASE_URL/system-monitor" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" | head -n 5
    echo ""
    
    echo "Testando analytics-tracker..."
    curl -s -X POST "$BASE_URL/analytics-tracker" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" -H "Content-Type: application/json" -d '{"event":"test","properties":{}}' | head -n 5
    echo ""
    
    echo "Testando reviews-manager..."
    curl -s "$BASE_URL/reviews-manager" -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY" | head -n 5
    echo ""
    
    echo "✅ Testes básicos concluídos!"
    echo ""
}

# Menu principal
show_menu() {
    echo "Selecione uma opção:"
    echo "1. Gerar chaves VAPID para notificações push"
    echo "2. Criar arquivo .env.local"
    echo "3. Mostrar instruções WhatsApp Business API"
    echo "4. Mostrar instruções Supabase"
    echo "5. Testar configurações básicas"
    echo "6. Executar todas as opções (1-4)"
    echo "0. Sair"
    echo ""
    read -p "Digite sua escolha: " choice
    
    case $choice in
        1)
            generate_vapid_keys
            ;;
        2)
            create_env_file
            ;;
        3)
            whatsapp_instructions
            ;;
        4)
            supabase_instructions
            ;;
        5)
            test_configurations
            ;;
        6)
            generate_vapid_keys
            create_env_file
            whatsapp_instructions
            supabase_instructions
            ;;
        0)
            echo "Saindo..."
            exit 0
            ;;
        *)
            echo "Opção inválida!"
            ;;
    esac
}

# Loop principal
while true; do
    show_menu
    echo ""
    read -p "Pressione Enter para continuar..."
    clear
done