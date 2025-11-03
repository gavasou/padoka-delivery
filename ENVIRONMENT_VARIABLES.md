# Variáveis de Ambiente Necessárias - Funcionalidades Avançadas

## Funcionalidades Implementadas

O projeto Padoka agora possui 5 funcionalidades avançadas que requerem configuração de variáveis de ambiente específicas:

1. **Sistema de Notificações Push**
2. **Integração WhatsApp Business API**
3. **Sistema de Avaliações e Feedback**
4. **Analytics e Métricas**
5. **Sistema de Backup e Monitoramento**

## Variáveis de Ambiente Obrigatórias

### 1. Web Push Notifications

Para o funcionamento das notificações push no navegador:

```env
# Chaves VAPID para Web Push
VITE_VAPID_PUBLIC_KEY="sua_chave_publica_vapid_aqui"
VAPID_PRIVATE_KEY="sua_chave_privada_vapid_aqui"
VAPID_SUBJECT="mailto:admin@padoka.com"
```

**Como obter as chaves VAPID:**
- Use uma ferramenta online como: https://vapidkeys.com/
- Ou execute no terminal: `npx web-push generate-vapid-keys`

### 2. WhatsApp Business API

Para integração com WhatsApp Business:

```env
# Meta Business API
WHATSAPP_ACCESS_TOKEN="sua_access_token_meta_business"
WHATSAPP_PHONE_NUMBER_ID="seu_phone_number_id"
WHATSAPP_BUSINESS_ACCOUNT_ID="seu_business_account_id"
WHATSAPP_WEBHOOK_VERIFY_TOKEN="token_verificacao_webhook"
```

**Como obter as credenciais WhatsApp:**
1. Acesse: https://developers.facebook.com/
2. Crie uma aplicação Business
3. Configure o WhatsApp Business API
4. Obtenha o Phone Number ID e Access Token
5. Configure webhooks para receber status de mensagens

### 3. Analytics e Monitoramento

Para coleta de métricas avançadas:

```env
# Google Analytics (opcional)
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"

# Configurações de backup
BACKUP_SCHEDULE="0 2 * * *"  # Todo dia às 2:00 AM
BACKUP_RETENTION_DAYS="30"

# Alertas de monitoramento
ALERT_EMAIL="admin@padoka.com"
ALERT_SLACK_WEBHOOK="https://hooks.slack.com/services/..."
```

### 4. Configurações Existentes (já configuradas)

```env
# Supabase (já configurado)
VITE_SUPABASE_URL="https://ywpazjaaqavjcdonlnzs.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="sb_secret_VPZj37H2aeA_Exe27ZA4Rw_4RLRAQSZ"

# Google Maps (já configurado)
VITE_GOOGLE_MAPS_API_KEY="AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk"

# Stripe (configurar quando necessário)
VITE_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## Arquivos de Configuração

### .env.local (desenvolvimento)
```env
# Web Push
VITE_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_SUBJECT="mailto:admin@padoka.com"

# WhatsApp Business
WHATSAPP_ACCESS_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""
WHATSAPP_BUSINESS_ACCOUNT_ID=""
WHATSAPP_WEBHOOK_VERIFY_TOKEN=""

# Analytics
VITE_GA_MEASUREMENT_ID=""
ALERT_EMAIL="admin@padoka.com"
```

### .env.production (produção)
```env
# Mesmas variáveis da .env.local
# Com valores de produção
```

## Configuração no Supabase

As seguintes variáveis precisam ser configuradas no dashboard do Supabase (Project Settings > Environment Variables):

```env
VAPID_PRIVATE_KEY="sua_chave_privada_vapid"
VAPID_SUBJECT="mailto:admin@padoka.com"
WHATSAPP_ACCESS_TOKEN="token_de_acesso_whatsapp"
WHATSAPP_PHONE_NUMBER_ID="id_numero_telefone"
WHATSAPP_BUSINESS_ACCOUNT_ID="id_conta_business"
```

## Edge Functions Secrets

Para as Edge Functions no Supabase, configure estes secrets:

1. **push-notifications function:**
   - VAPID_PRIVATE_KEY
   - VAPID_SUBJECT

2. **whatsapp-sender function:**
   - WHATSAPP_ACCESS_TOKEN
   - WHATSAPP_PHONE_NUMBER_ID
   - WHATSAPP_BUSINESS_ACCOUNT_ID

3. **system-monitor function:**
   - ALERT_EMAIL
   - ALERT_SLACK_WEBHOOK

## Instruções de Configuração

### 1. Configurar VAPID Keys
```bash
# Gerar chaves VAPID
npx web-push generate-vapid-keys

# Adicionar ao .env.local
echo "VITE_VAPID_PUBLIC_KEY=BHxK..." >> .env.local
echo "VAPID_PRIVATE_KEY=eWc..." >> .env.local
```

### 2. Configurar WhatsApp Business
1. Acesse Meta for Developers
2. Crie aplicação Business
3. Configure WhatsApp Business API
4. Adicione credenciais ao .env.local

### 3. Configurar no Supabase
1. Acesse projeto Supabase
2. Settings > Environment Variables
3. Adicione todas as variáveis necessárias
4. Redeploy das Edge Functions

### 4. Testar Configurações
```bash
# Testar notificações push
curl -X POST https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/push-notifications

# Testar WhatsApp
curl -X POST https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/whatsapp-sender

# Testar monitoramento
curl -X GET https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/system-monitor
```

## Status das Funcionalidades

| Funcionalidade | Backend | Frontend | Integração | Status |
|---|---|---|---|---|
| Web Push Notifications | ✅ | ✅ | ✅ | Configuração pendente |
| WhatsApp Business API | ✅ | ✅ | ✅ | Configuração pendente |
| Reviews & Feedback | ✅ | ✅ | ✅ | Funcional |
| Analytics & Metrics | ✅ | ✅ | ✅ | Funcional |
| System Monitoring | ✅ | ✅ | ✅ | Configuração pendente |

## Próximos Passos

1. **Configurar credenciais WhatsApp Business API**
2. **Gerar e configurar chaves VAPID**
3. **Testar todas as funcionalidades**
4. **Deploy da versão atualizada**
5. **Monitoramento em produção**

---

**Nota:** Todas as funcionalidades já estão implementadas no código. Apenas a configuração das variáveis de ambiente é necessária para ativá-las.