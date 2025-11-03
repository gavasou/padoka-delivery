# Análise de Variáveis de Ambiente - Projeto Padoka

## Resumo Executivo

Este documento apresenta uma análise completa das variáveis de ambiente necessárias para o projeto Padoka - Delivery de Pães. O projeto utiliza uma arquitetura moderna baseada em React + Vite, Supabase como Backend-as-a-Service, e integrações com diversos serviços externos.

## Categorias de Variáveis de Ambiente

### 1. Configurações do Supabase (Frontend)

**Localização:** Aplicação React/Vite
**Formato:** `VITE_*`

```env
# URLs e Chaves Públicas do Supabase
VITE_SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=ywpazjaaqavjcdonlnzs
```

**Arquivos que utilizam:**
- `/lib/supabase.ts`
- `/services/supabase.ts`
- `/services/supabaseApi.ts`

---

### 2. APIs Externas (Frontend)

#### Google Maps API

```env
# Google Maps - Geocodificação, mapas e localizações
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk
```

**Arquivos que utilizam:**
- `/services/googleMapsService.ts`
- `/components/MapView.tsx`
- `/components/AddressSearch.tsx`
- Edge functions de geocodificação

#### Stripe (Pagamentos)

```env
# Stripe - Chave pública para frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51QRGvkHZlSuemtb...
```

**Arquivos que utilizam:**
- `/services/stripeService.ts`
- `/components/PaymentScreen.tsx`

---

### 3. Configurações da Aplicação

```env
# Configurações gerais da aplicação
VITE_APP_ENV=production
VITE_APP_NAME=Padoka - Delivery de Pães
VITE_APP_VERSION=1.0.0
VITE_APP_URL=https://padoka.vercel.app

# Feature Flags
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# PWA Settings
VITE_PWA_THEME_COLOR=#F9B400
VITE_PWA_BACKGROUND_COLOR=#FFF9EF
VITE_PWA_DISPLAY=standalone

# Rate Limiting
VITE_API_RATE_LIMIT=1000
VITE_API_BURST_LIMIT=50

# Notificações Web Push
VITE_VAPID_PUBLIC_KEY=BHxK...  # Chave pública VAPID
```

---

### 4. Configurações do Supabase (Edge Functions)

**Localização:** Dashboard do Supabase (Project Settings > Environment Variables)
**Formato:** Variáveis de sistema

```env
# Supabase Service Role Key (obrigatório para todas as functions)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_VPZj37H2aeA_Exe27ZA4Rw_4RLRAQSZ

# URLs do Supabase
SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co
```

**Utilizado por:** Todas as 17 Edge Functions

---

### 5. APIs Externas (Edge Functions)

#### Stripe (Backend)

```env
# Stripe - Chave secreta para server-side
STRIPE_SECRET_KEY=sk_test_51QRGvkHZlSuemtb...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Edge Functions que utilizam:**
- `create-payment`
- `create-subscription`
- `stripe-webhook`

#### Google Maps (Backend)

```env
# Google Maps API para Edge Functions
google_map_api_key=AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk
```

**Edge Functions que utilizam:**
- `geocode-address`
- `calculate-distance`

#### WhatsApp Business API

```env
# WhatsApp Business API (Meta)
WHATSAPP_ACCESS_TOKEN=seu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_WEBHOOK_VERIFY_TOKEN=token_verificacao_webhook
```

**Edge Function:** `whatsapp-sender`

---

### 6. Sistema de Notificações

```env
# Web Push Notifications
VAPID_PRIVATE_KEY=eWc...  # Chave privada VAPID
VAPID_SUBJECT=mailto:admin@padoka.com

# Push Notifications para PWA
# (configurado via service worker)
```

**Edge Function:** `push-notifications`

**Como gerar chaves VAPID:**
```bash
npx web-push generate-vapid-keys
```

---

### 7. Monitoramento e Analytics

```env
# Google Analytics (opcional)
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry para monitoramento de erros (opcional)
VITE_SENTRY_DSN=sua_dsn_sentry

# Hotjar para UX analytics (opcional)
VITE_HOTJAR_ID=seu_hotjar_id

# Sistema de alertas
ALERT_EMAIL=admin@padoka.com
ALERT_SLACK_WEBHOOK=https://hooks.slack.com/services/...
```

**Edge Function:** `system-monitor`

---

### 8. Configurações de Build

```env
# Configurações de build do Vite
NODE_ENV=production
BUILD_ENV=production

# Gemini AI (se usado)
GEMINI_API_KEY=PLACEHOLDER_API_KEY
```

**Arquivo:** `vite.config.ts` (usado no processo de build)

---

## Status de Configuração por Ambiente

### ✅ Já Configurado (Produção)

| Variável | Valor | Localização |
|----------|--------|-------------|
| `VITE_SUPABASE_URL` | ✅ | Frontend |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Frontend |
| `VITE_GOOGLE_MAPS_API_KEY` | ✅ | Frontend/Backend |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Edge Functions |
| `VITE_STRIPE_PUBLISHABLE_KEY` | ✅ | Frontend |

### ⚠️ Pendente de Configuração

| Variável | Descrição | Prioridade | Complexidade |
|----------|-----------|------------|--------------|
| `STRIPE_SECRET_KEY` | Pagamentos reais | Alta | Baixa |
| `STRIPE_WEBHOOK_SECRET` | Webhooks Stripe | Alta | Baixa |
| `VITE_VAPID_PUBLIC_KEY` | Notificações Push | Média | Baixa |
| `VAPID_PRIVATE_KEY` | Notificações Push | Média | Baixa |
| `WHATSAPP_ACCESS_TOKEN` | WhatsApp Business | Média | Alta |
| `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp Business | Média | Alta |
| `VITE_GA_MEASUREMENT_ID` | Analytics | Baixa | Baixa |
| `ALERT_EMAIL` | Monitoramento | Baixa | Baixa |

### 🔧 Como Configurar no Vercel

1. **Acesse o Dashboard do Vercel**
   - Vá para: https://vercel.com/dashboard
   - Selecione o projeto "padoka"

2. **Configurar Environment Variables**
   - Vá para: Settings > Environment Variables
   - Adicione as variáveis faltantes por ambiente:

```env
# Development
VITE_VAPID_PUBLIC_KEY=sua_chave_publica
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Production
VITE_VAPID_PUBLIC_KEY=sua_chave_publica_producao
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Preview (branch deployments)
# Mesmas do development
```

### 🔧 Como Configurar no Supabase

1. **Acesse o Dashboard do Supabase**
   - Vá para: https://supabase.com/dashboard
   - Selecione o projeto

2. **Configurar Edge Function Secrets**
   - Vá para: Project Settings > Environment Variables
   - Adicione:

```env
# Obrigatórias para todas as functions
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co

# Para funções específicas
STRIPE_SECRET_KEY=sk_...
google_map_api_key=AIzaSy...

# Para notificações
VAPID_PRIVATE_KEY=eWc...
VAPID_SUBJECT=mailto:admin@padoka.com

# Para WhatsApp
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
```

---

## Edge Functions e Suas Variáveis

### Funções com Dependências de API Externa

1. **create-payment**
   - `STRIPE_SECRET_KEY` (obrigatório)
   - `SUPABASE_SERVICE_ROLE_KEY` (obrigatório)
   - `SUPABASE_URL` (obrigatório)

2. **create-subscription**
   - `STRIPE_SECRET_KEY` (obrigatório)
   - `SUPABASE_SERVICE_ROLE_KEY` (obrigatório)
   - `SUPABASE_URL` (obrigatório)

3. **stripe-webhook**
   - `STRIPE_SECRET_KEY` (obrigatório)
   - `SUPABASE_SERVICE_ROLE_KEY` (obrigatório)
   - `SUPABASE_URL` (obrigatório)

4. **geocode-address**
   - `google_map_api_key` (obrigatório)
   - `SUPABASE_SERVICE_ROLE_KEY` (obrigatório)
   - `SUPABASE_URL` (obrigatório)

5. **calculate-distance**
   - `google_map_api_key` (obrigatório)
   - `SUPABASE_SERVICE_ROLE_KEY` (obrigatório)
   - `SUPABASE_URL` (obrigatório)

6. **push-notifications**
   - `VAPID_PRIVATE_KEY` (obrigatório)
   - `VAPID_SUBJECT` (obrigatório)
   - `SUPABASE_SERVICE_ROLE_KEY` (obrigatório)
   - `SUPABASE_URL` (obrigatório)

7. **whatsapp-sender**
   - `WHATSAPP_ACCESS_TOKEN` (obrigatório)
   - `WHATSAPP_PHONE_NUMBER_ID` (obrigatório)
   - `WHATSAPP_BUSINESS_ACCOUNT_ID` (opcional)
   - `SUPABASE_SERVICE_ROLE_KEY` (obrigatório)
   - `SUPABASE_URL` (obrigatório)

### Funções com Apenas Supabase (Configuradas)

8. **analytics-tracker**
9. **coupon-manager**
10. **create-bucket-*-temp**
11. **create-demo-users**
12. **create-user-profile**
13. **cron-daily-payouts**
14. **daily-sales-processor**
15. **influencer-credit-manager**
16. **init-mock-data**
17. **reviews-manager**
18. **system-monitor**

---

## Checklist de Configuração

### Antes do Deploy Produção

- [ ] Configurar `STRIPE_SECRET_KEY` para produção
- [ ] Configurar `STRIPE_WEBHOOK_SECRET`
- [ ] Gerar e configurar chaves VAPID
- [ ] Configurar WhatsApp Business API (se necessário)
- [ ] Testar todas as Edge Functions
- [ ] Verificar se todas as variáveis estão no Vercel
- [ ] Verificar se todos os secrets estão no Supabase

### Depois do Deploy

- [ ] Testar pagamentos em sandbox
- [ ] Testar notificações push
- [ ] Testar geolocalização
- [ ] Verificar logs do Supabase
- [ ] Monitorar performance

---

## Documentação Complementar

- **Deploy Guide:** `/GUIA_DEPLOY_VERCEL.md`
- **Configuração Supabase:** `/supabase/` (migrations e functions)
- **Environment Variables:** `/ENVIRONMENT_VARIABLES.md`

---

**Data da Análise:** 03/11/2025  
**Versão do Documento:** 1.0  
**Última Atualização:** Análise completa das variáveis de ambiente do projeto Padoka