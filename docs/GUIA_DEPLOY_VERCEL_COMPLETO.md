# 🚀 Guia Completo de Deploy no Vercel - Projeto Padoka Delivery

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Passo 1: Conectar Repositório GitHub](#passo-1-conectar-repositório-github)
4. [Passo 2: Configurar Variáveis de Ambiente](#passo-2-configurar-variáveis-de-ambiente)
5. [Passo 3: Configuração de Domínio Personalizado](#passo-3-configuração-de-domínio-personalizado)
6. [Passo 4: Configurar Webhooks do Stripe](#passo-4-configurar-webhooks-do-stripe)
7. [Passo 5: Deploy das Supabase Edge Functions](#passo-5-deploy-das-supabase-edge-functions)
8. [Passo 6: Verificações Pós-Deploy](#passo-6-verificações-pós-deploy)
9. [Passo 7: Testes de Funcionalidade em Produção](#passo-7-testes-de-funcionalidade-em-produção)
10. [Troubleshooting](#troubleshooting)
11. [Manutenção](#manutenção)

---

## 📖 Visão Geral

O **Padoka Delivery** é um PWA (Progressive Web App) completo para delivery de pães artesanais, desenvolvido com:

- **Frontend:** React 19.2.0 + TypeScript + Vite
- **Backend:** Supabase (Database + Auth + Storage + Edge Functions)
- **Integrações:** Stripe, Google Maps, PWA
- **Deploy:** Vercel (otimizado para performance)

### 🔗 URLs e Recursos Importantes

- **Repositório GitHub:** `https://github.com/padoka/delivery-pwa`
- **Supabase Dashboard:** `https://supabase.com/dashboard/project/ywpazjaaqavjcdonlnzs`
- **Vercel Dashboard:** `https://vercel.com/dashboard`
- **URL de Produção:** Será configurada durante o processo

---

## ✅ Pré-requisitos

### 1. Contas Necessárias

- [x] **GitHub** - Conta ativa
- [x] **Vercel** - Conta Pro recomendada (para domínio personalizado)
- [x] **Supabase** - Projeto já configurado
- [x] **Stripe** - Conta para pagamentos (opcional)

### 2. Credenciais Necessárias

**Supabase (já configurado):**
- ✅ URL: `https://ywpazjaaqavjcdonlnzs.supabase.co`
- ✅ Anon Key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ Service Role Key: `sb_secret_VPZj37H2aeA_Exe27ZA4Rw_4RLRAQSZ`

**Google Maps (já configurado):**
- ✅ API Key: `AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk`

**Stripe (opcional - para pagamentos):**
- 📋 Publishable Key: `pk_live_...` ou `pk_test_...`
- 📋 Secret Key: `sk_live_...` ou `sk_test_...`
- 📋 Webhook Secret: `whsec_...`

### 3. Ferramentas Locais

```bash
# Node.js 18+ e npm
node --version  # >= 18.0.0
npm --version   # >= 9.0.0

# Git
git --version

# Vercel CLI (opcional)
npm i -g vercel
```

---

## 🔗 Passo 1: Conectar Repositório GitHub

### 1.1 Preparar Repositório Local

```bash
# Clone o repositório (se ainda não fez)
git clone https://github.com/padoka/delivery-pwa.git
cd delivery-pwa

# Verificar se está na branch main
git branch

# Se não estiver, mude para main
git checkout main
git pull origin main
```

### 1.2 Verificar Configurações do Repositório

**Checar se os arquivos essenciais estão presentes:**

```bash
# Verificar estrutura principal
ls -la

# Deve conter:
# ✅ package.json
# ✅ vercel.json
# ✅ vite.config.ts
# ✅ index.html
# ✅ dist/ (pasta de build)
# ✅ supabase/functions/ (Edge Functions)
```

**Verificar configurações no package.json:**

```json
{
  "name": "padoka-delivery-pwa",
  "version": "1.0.0",
  "homepage": "https://padoka.vercel.app",
  "scripts": {
    "build": "vite build",
    "deploy": "npm run optimize:check && vercel --prod"
  }
}
```

### 1.3 Fazer Push para GitHub

```bash
# Adicionar todos os arquivos
git add .

# Commit das mudanças
git commit -m "Deploy Vercel: Configuração completa para produção"

# Push para GitHub
git push origin main
```

### 1.4 Conectar Vercel ao GitHub

1. **Acesse o Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Clique em "New Project":**

3. **Importar do GitHub:**
   - Selecione **"Import Git Repository"**
   - Autorize o acesso ao GitHub (se necessário)
   - Encontre o repositório `padoka/delivery-pwa`
   - Clique em **"Import"**

4. **Configurar Projeto:**

   | Campo | Valor |
   |-------|--------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `./` (raiz) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

5. **Configurações Avançadas:**
   ```bash
   # Variáveis de ambiente serão configuradas no próximo passo
   # Por enquanto, deixe em branco
   ```

6. **Clique em "Deploy"**

### 1.5 Configurar Deploy Automático

**No repositório GitHub:**

1. Vá em **Settings** > **Webhooks**
2. Clique em **"Add webhook"**
3. Configure:
   ```
   Payload URL: https://api.vercel.com/v1/hooks/[HOOK_ID]
   Content type: application/json
   Events: Push events
   ```

**No Vercel Dashboard:**

1. Vá em **Project Settings** > **Git**
2. Configure:
   ```
   Production Branch: main
   Deploy Hooks: Ativar
   Pull Request Previews: Ativar
   ```

---

## 🔐 Passo 2: Configurar Variáveis de Ambiente

### 2.1 Acessar Configurações do Projeto no Vercel

1. Vá para: **Vercel Dashboard** > **Seu Projeto**
2. Clique em **"Settings"** (aba)
3. Vá em **"Environment Variables"**

### 2.2 Configurar Variáveis Obrigatórias

**Adicione as seguintes variáveis uma por vez:**

#### Supabase (Obrigatório)

```
# Variável 1
Name: VITE_SUPABASE_URL
Value: https://ywpazjaaqavjcdonlnzs.supabase.co
Environment: Production, Preview, Development

# Variável 2
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.[sua_chave_anon_aqui]
Environment: Production, Preview, Development

# Variável 3 (apenas Produção)
Name: SUPABASE_SERVICE_ROLE_KEY
Value: sb_secret_VPZj37H2aeA_Exe27ZA4Rw_4RLRAQSZ
Environment: Production
```

#### Google Maps (Obrigatório)

```
Name: VITE_GOOGLE_MAPS_API_KEY
Value: AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk
Environment: Production, Preview, Development
```

#### Configurações da Aplicação (Obrigatório)

```
Name: VITE_APP_ENV
Value: production
Environment: Production

Name: VITE_APP_VERSION
Value: 1.0.0
Environment: Production, Preview, Development

Name: VITE_APP_NAME
Value: Padoka
Environment: Production, Preview, Development
```

### 2.3 Configurar Variáveis Opcionais (Stripe)

**Apenas se planeja usar sistema de pagamentos:**

```
Name: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_live_... (ou pk_test_...)
Environment: Production, Preview, Development

Name: STRIPE_SECRET_KEY
Value: sk_live_... (ou sk_test_...)
Environment: Production, Preview, Development

Name: STRIPE_WEBHOOK_SECRET
Value: whsec_...
Environment: Production, Preview, Development
```

### 2.4 Configurar Variáveis Avançadas (PWA)

**Para notificações push:**

```bash
# Gerar chaves VAPID
npx web-push generate-vapid-keys
```

```
Name: VITE_VAPID_PUBLIC_KEY
Value: [sua_chave_publica_vapid]
Environment: Production, Preview, Development

Name: VAPID_PRIVATE_KEY
Value: [sua_chave_privada_vapid]
Environment: Production

Name: VAPID_SUBJECT
Value: mailto:admin@padoka.com
Environment: Production, Preview, Development
```

### 2.5 Configurar Google Analytics (Opcional)

```
Name: VITE_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX
Environment: Production, Preview
```

### 2.6 Validar Configurações

**Após configurar todas as variáveis:**

1. Clique em **"Save"**
2. Vá para aba **"Deployments"**
3. Clique no último deployment
4. Verifique se não há erros relacionados às variáveis

### 2.7 Script para Configuração Rápida

**Se preferir configurar via CLI:**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Ir para o diretório do projeto
cd padoka-delivery

# Configurar variáveis
vercel env add VITE_SUPABASE_URL production
# Cole: https://ywpazjaaqavjcdonlnzs.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Cole: [sua_chave_anon]

# Repetir para todas as variáveis...

# Fazer deploy
vercel --prod
```

---

## 🌐 Passo 3: Configuração de Domínio Personalizado

### 3.1 Adicionar Domínio no Vercel

**Se você tem um domínio próprio:**

1. No Vercel Dashboard > **Settings** > **Domains**
2. Clique em **"Add Domain"**
3. Insira seu domínio: `seu-dominio.com`
4. Escolha se quer `www.seu-dominio.com` ou apenas `seu-dominio.com`

**Se não tem domínio:**
- Use o domínio padrão do Vercel: `padoka-delivery-pwa.vercel.app`
- Configure um subdomínio gratuito: `padoka.yourname.vercel.app`

### 3.2 Configurar DNS

**Para domínios próprios:**

1. **No seu provedor de DNS (GoDaddy, Registro.br, etc.):**

   ```
   # Tipo A
   Name: @
   Value: 76.76.19.61
   TTL: 3600

   # Tipo CNAME (para www)
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

2. **Verificar propagação:**
   ```bash
   nslookup seu-dominio.com
   dig seu-dominio.com
   ```

### 3.3 Configurar SSL/HTTPS

**Vercel faz isso automaticamente:**

1. Certificado SSL será emitido automaticamente
2. Verificar em: **Settings** > **Domains**
3. Status deve mostrar ✅ **Valid SSL Certificate**

### 3.4 Configurar Redirecionamentos

**No arquivo `vercel.json`, já temos:**

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

**Isso garante que:**
- ✅ URLs amigáveis funcionem
- ✅ SPA routing funcione
- ✅ PWA funcione corretamente

### 3.5 Configurar Domínio para Edge Functions

**Se suas Edge Functions precisam de domínio customizado:**

1. **No Supabase Dashboard:**
   - Settings > Edge Functions > Domains
   - Adicione seu domínio customizado

2. **Testar Edge Functions:**
   ```bash
   curl https://seu-dominio.com/functions/v1/push-notifications
   ```

---

## 💳 Passo 4: Configurar Webhooks do Stripe

### 4.1 Acessar Dashboard do Stripe

1. Vá para: **https://dashboard.stripe.com**
2. Faça login na sua conta
3. Vá em **Developers** > **Webhooks**

### 4.2 Criar Webhook

1. Clique em **"Add endpoint"**

2. **Configure o endpoint:**
   ```
   Endpoint URL: https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/stripe-webhook
   Description: Padoka Delivery Webhook
   ```

3. **Selecionar eventos:**
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`

4. Clique em **"Add endpoint"**

### 4.3 Obter Webhook Secret

1. **Na lista de webhooks, clique no webhook criado**
2. **Vá na seção "Signing secret"**
3. **Clique em "Reveal"**
4. **Copie a chave (começa com `whsec_`)**

### 4.4 Configurar Webhook Secret no Vercel

1. **Vercel Dashboard** > **Seu Projeto** > **Settings** > **Environment Variables**
2. **Adicione:**
   ```
   Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_[a_chave_que_você_copiou]
   Environment: Production, Preview
   ```

### 4.5 Configurar Webhook Secret no Supabase

1. **Supabase Dashboard** > **Seu Projeto** > **Settings** > **Environment Variables**
2. **Adicione:**
   ```
   Name: STRIPE_WEBHOOK_SECRET
   Value: whsec_[a_chave_que_você_copiou]
   ```

### 4.6 Testar Webhook

**Via Stripe Dashboard:**

1. Vá em **Webhooks** > **Seu Webhook**
2. Clique em **"Send test webhook"**
3. Selecione um evento (ex: `invoice.payment_succeeded`)
4. Clique em **"Send test webhook"**

**Via curl:**

```bash
curl -X POST https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "invoice.payment_succeeded",
    "data": {
      "object": {
        "id": "in_test_123",
        "customer": "cus_test_123"
      }
    }
  }'
```

### 4.7 Monitorar Webhooks

**No Stripe Dashboard:**
- Vá em **Webhooks** > **Seu Webhook**
- Veja a lista de eventos enviados
- Status deve ser: ✅ **Delivered** (não ❌ Failed)

**No Supabase Dashboard:**
- Settings > Edge Functions > stripe-webhook > Logs
- Verifique se há erros

---

## ⚡ Passo 5: Deploy das Supabase Edge Functions

### 5.1 Preparar Ambiente Supabase

1. **Acesse o Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/ywpazjaaqavjcdonlnzs
   ```

2. **Instalar Supabase CLI (se não tiver):**
   ```bash
   npm install -g supabase
   ```

3. **Login no Supabase:**
   ```bash
   supabase login
   ```

### 5.2 Configurar Variáveis de Ambiente no Supabase

1. **Vá em:** Settings > Environment Variables
2. **Adicione as seguintes variáveis:**

```bash
# Supabase Core (obrigatório)
SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_VPZj37H2aeA_Exe27ZA4Rw_4RLRAQSZ

# Stripe (se usando pagamentos)
STRIPE_SECRET_KEY=sk_live_... (ou sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_...

# WhatsApp Business (se usando)
WHATSAPP_ACCESS_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=...
WHATSAPP_BUSINESS_ACCOUNT_ID=...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=...

# VAPID Keys (para notificações push)
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:admin@padoka.com

# Alertas
ALERT_EMAIL=admin@padoka.com
ALERT_SLACK_WEBHOOK=...
```

### 5.3 Deploy de Todas as Edge Functions

**Usando Supabase CLI:**

```bash
# Navegar para o diretório do projeto
cd padoka-delivery

# Deploy de todas as functions
supabase functions deploy

# Ou deploy individual:
supabase functions deploy stripe-webhook
supabase functions deploy push-notifications
supabase functions deploy pix-qr-generator
supabase functions deploy coupon-manager
supabase functions deploy daily-sales-processor
```

**Via Dashboard:**

1. **Vá em:** Edge Functions
2. **Para cada function:**
   - Clique em **"Create Function"**
   - Copie o código do arquivo `supabase/functions/[nome]/index.ts`
   - Cole no editor
   - Clique em **"Deploy"**

### 5.4 Edge Functions Principais

**Deploye na seguinte ordem:**

1. **stripe-webhook**
   ```bash
   supabase functions deploy stripe-webhook
   ```
   - Processa eventos do Stripe
   - Atualiza status de pagamentos

2. **push-notifications**
   ```bash
   supabase functions deploy push-notifications
   ```
   - Envia notificações PWA
   - Requer VAPID keys

3. **pix-qr-generator**
   ```bash
   supabase functions deploy pix-qr-generator
   ```
   - Gera QR codes PIX
   - Integração com sistema bancário

4. **coupon-manager**
   ```bash
   supabase functions deploy coupon-manager
   ```
   - Gerencia cupons de desconto
   - Valida código de cupons

5. **daily-sales-processor**
   ```bash
   supabase functions deploy daily-sales-processor
   ```
   - Processa divisão de vendas
   - Executa diariamente às 17:30

6. **whatsapp-sender**
   ```bash
   supabase functions deploy whatsapp-sender
   ```
   - Envia mensagens WhatsApp
   - Requer API do WhatsApp Business

### 5.5 Configurar Cron Jobs

**Para funções que executam automaticamente:**

1. **Supabase Dashboard** > **Database** > **Extensions**
2. **Ativar** `pg_cron` (se não estiver ativo)

3. **Executar SQL no Editor:**
   ```sql
   -- Cron job para divisão de vendas diárias
   SELECT cron.schedule(
     'daily-sales-processor',
     '30 17 * * *', -- Todo dia às 17:30
     $$
     SELECT net.http_post(
       url := 'https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/daily-sales-processor',
       headers := '{}'::jsonb
     );
     $$
   );
   ```

### 5.6 Verificar Deploy das Functions

**Listar Functions Deployadas:**

```bash
supabase functions list
```

**Verificar Status:**

1. **Dashboard:** Supabase > Edge Functions
2. **Todas as functions devem mostrar:** ✅ **Active**

**Testar Functions:**

```bash
# Testar stripe-webhook
curl -X POST https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/stripe-webhook \
  -H "Authorization: Bearer [SUPABASE_ANON_KEY]" \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'

# Testar system-monitor
curl -X GET https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/system-monitor \
  -H "Authorization: Bearer [SUPABASE_ANON_KEY]"
```

### 5.7 Configurar Storage Buckets

**Criar buckets necessários:**

1. **Dashboard** > **Storage** > **Create Bucket**

2. **Buckets obrigatórios:**
   - `avatars` - Fotos de perfil
   - `bakery-images` - Imagens das padarias
   - `product-images` - Fotos dos produtos

3. **Configurações:**
   - Public bucket: ✅ Ativar
   - File size limit: 5MB
   - Allowed MIME types: `image/*`

---

## ✅ Passo 6: Verificações Pós-Deploy

### 6.1 Verificar Deploy no Vercel

1. **Acesse o Deploy:**
   ```
   https://vercel.com/dashboard
   ```

2. **Clique no seu projeto:**
   - Deve mostrar: ✅ **Ready**
   - Status: **Production**

3. **Verificar Logs:**
   - Clique em **"Functions"** tab
   - Verifique se não há erros no build

### 6.2 Verificar Variáveis de Ambiente

1. **Settings** > **Environment Variables**
2. **Verificar se todas estão marcadas:**
   - ✅ VITE_SUPABASE_URL
   - ✅ VITE_SUPABASE_ANON_KEY
   - ✅ VITE_GOOGLE_MAPS_API_KEY
   - ✅ VITE_APP_ENV = production

3. **Se alguma estiver faltando:**
   - Adicione a variável
   - Faça um novo deploy

### 6.3 Verificar Build

1. **Na página do deploy, vá em "Functions"**
2. **Verificar logs do build:**
   ```bash
   # Deve mostrar algo como:
   ✅ Production: Build completed in 45s
   ✅ Deployed to production
   ✅ Functions: 1
   ```

3. **Se houver erros:**
   - Clique nos logs para ver detalhes
   - Corrija os erros
   - Faça push para o GitHub (trigger automático)

### 6.4 Verificar Performance

**Teste Lighthouse:**

1. **Acesse:** https://lighthouse.beausk众人的删除.com/
2. **Insira a URL do seu site**
3. **Verifique scores:**
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90
   - PWA: > 90

**Teste PWA:**

1. **Abra no Chrome**
2. **Pressione F12**
3. **Vá em "Application"**
4. **Verifique:**
   - ✅ Service Worker registrado
   - ✅ Manifest carregado
   - ✅ Install Prompt funcionando

### 6.5 Verificar Edge Functions

**Dashboard Supabase:**

1. **Edge Functions** > **Verificar status**
2. **Todas devem mostrar:** ✅ **Active**

**Teste manual:**

```bash
# Teste health check
curl https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/system-monitor

# Deve retornar:
{
  "status": "healthy",
  "timestamp": "2025-11-03T13:09:20Z",
  "version": "1.0.0"
}
```

### 6.6 Verificar Banco de Dados

**Dashboard Supabase:**

1. **Table Editor** > **Verificar tabelas principais:**
   - ✅ users
   - ✅ bakeries
   - ✅ products
   - ✅ payments
   - ✅ daily_sales_division

2. **Executar query de teste:**
   ```sql
   SELECT COUNT(*) FROM users;
   -- Deve retornar um número > 0
   ```

### 6.7 Verificar Storage

**Dashboard Supabase:**

1. **Storage** > **Verificar buckets:**
   - ✅ avatars
   - ✅ bakery-images
   - ✅ product-images

2. **Testar upload:**
   - Tente fazer upload de uma imagem
   - Deve funcionar sem erros

---

## 🧪 Passo 7: Testes de Funcionalidade em Produção

### 7.1 Testes de Autenticação

**Testar Login:**

1. **Acesse:** https://seu-dominio.vercel.app
2. **Tente fazer login com:**
   ```
   Email: admin@padoka.com
   Senha: Padoka2025!
   ```
3. **Verificar:**
   - ✅ Redireciona para dashboard
   - ✅ Mostra dados do usuário
   - ✅ Menu lateral funciona

**Testar Registro:**

1. **Clique em "Criar conta"**
2. **Preencha:**
   ```
   Nome: Teste Usuario
   Email: teste@teste.com
   Senha: 123456
   ```
3. **Verificar:**
   - ✅ Conta criada com sucesso
   - ✅ Login funciona
   - ✅ Dados salvos no Supabase

### 7.2 Testes de PWA

**Instalação:**

1. **No Chrome, acesse o site**
2. **Verifique:**
   - ✅ Ícone de instalação aparece na barra de endereço
   - ✅ Menu "Instalar app" disponível
   - ✅ Instalação funciona

**Offline:**

1. **Instale o app**
2. **Desative internet**
3. **Abra o app**
4. **Verificar:**
   - ✅ Tela de offline aparece
   - ✅ Mensagem "Sem conexão" exibida

**Notificações:**

1. **Permitir notificações**
2. **Testar notificação push:**
   ```javascript
   // No console do navegador
   Notification.requestPermission().then(permission => {
     if (permission === 'granted') {
       new Notification('Teste Padoka', {
         body: 'Notificação funcionando!',
         icon: '/pwa-192x192.png'
       });
     }
   });
   ```

### 7.3 Testes de Mapa

**Localização:**

1. **Vá para seção "Localizar"**
2. **Permita acesso à localização**
3. **Verificar:**
   - ✅ Mapa carrega
   - ✅ Mostra localização atual
   - ✅ Mostra padarias próximas

**Busca de Endereço:**

1. **Digite um endereço:** "Rua das Flores, 123, São Paulo"
2. **Verificar:**
   - ✅ Auto-complete funciona
   - ✅ Localização é marcada no mapa
   - ✅ Mostra distância das padarias

### 7.4 Testes de Pagamentos (Stripe)

**Se Stripe estiver configurado:**

1. **Vá para página de pagamento**
2. **Preencha dados de teste:**
   ```
   Número: 4242 4242 4242 4242
   Validade: 12/34
   CVC: 123
   Nome: Test User
   ```
3. **Verificar:**
   - ✅ Formulário Stripe carrega
   - ✅ Validação funciona
   - ✅ Pagamento é processado
   - ✅ Webhook recebe evento

### 7.5 Testes de PIX

**Gerar QR Code:**

1. **Vá para página de pagamento**
2. **Selecione "PIX"**
3. **Clique em "Gerar PIX"**
4. **Verificar:**
   - ✅ QR Code é gerado
   - ✅ Código PIX é exibido
   - ✅ Valor está correto

### 7.6 Testes de Cupons

**Aplicar Cupom:**

1. **No carrinho, clique em "Cupom"**
2. **Digite:** TESTE10
3. **Verificar:**
   - ✅ Cupom é aceito
   - ✅ Desconto é calculado
   - ✅ Valor total é atualizado

**Cupom Inválido:**

1. **Digite:** CUPOM_INEXISTENTE
2. **Verificar:**
   - ❌ Mensagem de erro aparece
   - ✅ Desconto não é aplicado

### 7.7 Testes de Administrador

**Acesso Admin:**

1. **Login como admin:**
   ```
   Email: admin@padoka.com
   Senha: Padoka2025!
   ```

2. **Navegar para Admin Panel**
3. **Testar funcionalidades:**
   - ✅ Listar usuários
   - ✅ Ver vendas do dia
   - ✅ Gerenciar cupons
   - ✅ Ver analytics

### 7.8 Testes de Performance

**Lighthouse:**

1. **Execute Lighthouse audit**
2. **Verificar scores:**
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 90

**Bundle Size:**

```bash
# No projeto local
npm run build
du -sh dist/

# Deve ser < 10MB
```

**Carregamento:**

1. **Abra o site**
2. **Pressione F12 > Network**
3. **Recarregue a página**
4. **Verificar:**
   - ✅ Primeira carga: < 3s
   - ✅ Loads subsequentes: < 1s
   - ✅ Imagens otimizadas

### 7.9 Testes de Compatibilidade

**Navegadores:**

- ✅ Chrome (desktop e mobile)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

**Dispositivos:**

- ✅ Desktop (1920x1080)
- ✅ Tablet (768px)
- ✅ Mobile (375px)

### 7.10 Testes de Integração Completa

**Cenário completo:**

1. **Usuário faz login**
2. **Navega pelo catálogo**
3. **Adiciona produtos ao carrinho**
4. **Aplica cupom de desconto**
5. **Calcula frete/entrega**
6. **Escolhe pagamento PIX**
7. **Finaliza pedido**
8. **Recebe confirmação**

**Validações:**
- ✅ Dados salvos no banco
- ✅ Divisão de vendas registrada
- ✅ Notificação enviada
- ✅ Email de confirmação enviado

---

## 🔧 Troubleshooting

### Problemas Comuns

#### 1. Build Fails

**Erro:** `Build failed with 1 error`

**Solução:**
```bash
# Verificar erros de TypeScript
npm run type-check

# Verificar erros de ESLint
npm run lint

# Limpar cache e rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 2. Variáveis de Ambiente Não Funcionam

**Erro:** `VITE_SUPABASE_URL is not defined`

**Solução:**
1. Verificar se variáveis estão configuradas no Vercel
2. Verificar se nomes estão corretos (começam com `VITE_`)
3. Fazer novo deploy após adicionar variáveis
4. Verificar logs do build

#### 3. Edge Functions Não Respondem

**Erro:** `Function timeout` ou `502 Bad Gateway`

**Solução:**
```bash
# Verificar status da function
supabase functions list

# Redeploy da function
supabase functions deploy [nome-function]

# Verificar logs
supabase functions logs [nome-function]
```

#### 4. Supabase Connection Error

**Erro:** `Failed to connect to Supabase`

**Solução:**
1. Verificar se URL está correta
2. Verificar se ANON KEY está correta
3. Verificar se IP não está bloqueado no Supabase
4. Verificar se RLS policies estão ativas

#### 5. Stripe Webhook Falha

**Erro:** `Webhook signature verification failed`

**Solução:**
1. Verificar se WEBHOOK_SECRET está correto
2. Verificar se URL do webhook está correta
3. Testar webhook no Stripe Dashboard
4. Verificar logs no Supabase

#### 6. PWA Não Instala

**Erro:** Botão "Instalar" não aparece

**Solução:**
1. Verificar se manifest.webmanifest existe
2. Verificar se Service Worker está registrado
3. Verificar se served via HTTPS
4. Verificar se manifest tem ícones corretos

#### 7. Imagens Não Carregam

**Erro:** Imagens quebradas ou não aparecem

**Solução:**
1. Verificar se buckets estão públicos no Supabase
2. Verificar se URLs estão corretas
3. Verificar se RLS permite SELECT nas tabelas de imagens
4. Verificar CORS settings no Supabase

### Logs e Debug

#### Verificar Logs do Vercel

```bash
# Via CLI
vercel logs [project-url]

# Via Dashboard
# Vercel Dashboard > Seu Projeto > Functions > View Function Logs
```

#### Verificar Logs do Supabase

```bash
# Via CLI
supabase functions logs [nome-function]

# Via Dashboard
# Supabase Dashboard > Edge Functions > [Function] > Logs
```

#### Debug JavaScript

```javascript
// No navegador (F12 > Console)
console.log('Teste');

// Verificar variáveis de ambiente
console.log(import.meta.env.VITE_SUPABASE_URL);

// Verificar Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW Registrations:', registrations);
});
```

---

## 🔄 Manutenção

### Atualizações Automáticas

**GitHub + Vercel:**
- Cada push para `main` triggera deploy automático
- Preview deployments para PRs
- Rollback fácil via Dashboard

### Monitoramento

#### Health Checks

```bash
# Endpoint de saúde
curl https://seu-dominio.vercel.app/health

# Deve retornar:
{
  "status": "ok",
  "timestamp": "2025-11-03T13:09:20Z",
  "version": "1.0.0"
}
```

#### Alertas

**Configurar alertas no Vercel:**

1. **Settings** > **Alerts**
2. **Ativar:**
   - Build Errors
   - Function Errors
   - Performance Regressions
   - Domain Expiration

**Configurar alertas no Supabase:**

1. **Settings** > **Alerts**
2. **Ativar:**
   - Database Performance
   - Edge Function Errors
   - Storage Usage

### Backup

#### Banco de Dados

```bash
# Backup manual via CLI
supabase db dump --file backup-$(date +%Y%m%d).sql

# Restore
supabase db reset --file backup-20251103.sql
```

#### Arquivos (Storage)

**Buckets do Supabase já têm backup automático**

### Otimização Contínua

#### Performance

```bash
# Analisar bundle
npm run build:analyze

# Verificar Lighthouse
npm run lighthouse

# Otimizar imagens
# Usar WebP quando possível
# Comprimir imagens antes do upload
```

#### SEO

- Verificar sitemap.xml
- Atualizar robots.txt
- Adicionar meta tags dinâmicas
- Implementar structured data

### Versionamento

#### Git Tags

```bash
# Criar tag para release
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Listar tags
git tag

# Checkout para tag
git checkout v1.0.0
```

#### Changelog

**Manter CHANGELOG.md atualizado:**

```markdown
## [1.0.0] - 2025-11-03

### Adicionado
- Sistema completo PWA
- Integração Supabase
- Sistema PIX
- Cupons de desconto
- Painel admin

### Corrigido
- Bug na divisão de pagamentos
- Erro de validação de CPF

### Modificado
- Atualizado para React 19.2.0
- Otimizado bundle size
```

---

## 🎯 Checklist Final

### ✅ Pré-Deploy
- [ ] Repositório GitHub atualizado
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Build local funcionando: `npm run build`
- [ ] TypeScript sem erros: `npm run type-check`
- [ ] PWA manifest validado

### ✅ Deploy
- [ ] Projeto conectado ao Vercel
- [ ] Deploy inicial bem-sucedido
- [ ] Variáveis de ambiente adicionadas
- [ ] Domínio configurado
- [ ] SSL funcionando

### ✅ Backend
- [ ] Todas as Edge Functions deployadas
- [ ] Webhooks do Stripe configurados
- [ ] Cron jobs configurados
- [ ] Buckets de storage criados
- [ ] RLS policies ativas

### ✅ Testes
- [ ] Autenticação funcionando
- [ ] PWA instalável
- [ ] Notificações push ativas
- [ ] Mapa funcionando
- [ ] PIX gerando QR codes
- [ ] Cupons funcionando
- [ ] Admin panel acessível

### ✅ Performance
- [ ] Lighthouse score > 90
- [ ] Bundle size < 10MB
- [ ] First load < 3s
- [ ] Imagens otimizadas
- [ ] Service Worker ativo

### ✅ Segurança
- [ ] HTTPS obrigatório
- [ ] Environment variables seguras
- [ ] RLS ativado no Supabase
- [ ] CORS configurado
- [ ] CSP headers configurados

### ✅ Monitoramento
- [ ] Alertas configurados
- [ ] Health checks ativos
- [ ] Logs sendo coletados
- [ ] Backup automatizado
- [ ] SSL expiration monitorado

---

## 📞 Suporte

### Recursos

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **React Docs:** https://react.dev
- **PWA Guide:** https://web.dev/progressive-web-apps

### Contatos

- **Email:** admin@padoka.com
- **GitHub Issues:** https://github.com/padoka/delivery-pwa/issues
- **Discord:** https://discord.gg/padoka

### Logs Importantes

**Para debug, sempre incluir:**

1. **URL do site**
2. **Versão do navegador**
3. **Logs do console**
4. **Logs do Vercel**
5. **Logs do Supabase**
6. **Capturas de tela**

---

**🎉 Parabéns! Seu projeto Padoka Delivery está pronto para produção!**

*Guia gerado em: 2025-11-03 13:09:20*