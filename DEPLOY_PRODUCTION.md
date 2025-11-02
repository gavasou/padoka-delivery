# Padoka PWA - Deploy Profissional

## Visão Geral
Este documento descreve o processo completo de deploy profissional da aplicação Padoka PWA para ambiente de produção usando as melhores práticas de DevOps.

## Arquitetura de Produção

### Frontend
- **Plataforma**: Vercel (Recomendado) ou Netlify
- **Build**: Vite + React + TypeScript
- **PWA**: Service Workers + Manifest
- **CDN**: Vercel Edge Network Global

### Backend
- **Database**: Supabase PostgreSQL
- **API**: Supabase Edge Functions (Deno)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Real-time**: Supabase Realtime

### Integrações
- **Pagamentos**: Stripe (Production Mode)
- **Maps**: Google Maps API
- **Analytics**: Google Analytics (opcional)
- **Monitoring**: Vercel Analytics + Sentry

## Deploy Vercel - Instruções Completas

### 1. Preparação do Repositório

```bash
# 1. Inicializar Git (se não existir)
git init
git add .
git commit -m "feat: Padoka PWA inicial"

# 2. Criar repositório no GitHub
# - Acesse github.com
# - Criar novo repositório: padoka-delivery-pwa
# - Visibilidade: Private (recomendado)

# 3. Conectar repositório local ao GitHub
git remote add origin https://github.com/SEU_USERNAME/padoka-delivery-pwa.git
git branch -M main
git push -u origin main
```

### 2. Deploy no Vercel

#### Via Dashboard Vercel (Recomendado)

1. **Acessar Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Login com GitHub

2. **Importar Projeto**
   - Clique "New Project"
   - Selecione repositório `padoka-delivery-pwa`
   - Framework Preset: "Vite"
   - Root Directory: `./`

3. **Configurações de Build**
   ```
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Environment Variables**
   - Configure todas as variáveis do arquivo `.env.production`
   - Ambiente: Production
   - **IMPORTANTE**: Não commitar arquivo .env no Git

#### Via CLI Vercel

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Configurar domínio personalizado (opcional)
vercel domains add padoka.com.br
vercel alias padoka-delivery-pwa.vercel.app padoka.com.br
```

### 3. Configuração de Domínio Personalizado

#### DNS Configuration
```
# A Records
@     A     76.76.19.19
www   A     76.76.19.19

# CNAME (alternativo)
www   CNAME   cname.vercel-dns.com
```

#### SSL/HTTPS
- SSL automático via Vercel/Let's Encrypt
- HTTPS redirect configurado no vercel.json
- HSTS headers habilitados

### 4. Environment Variables (Produção)

**Variáveis Obrigatórias no Vercel:**

```env
# Supabase
VITE_SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=ywpazjaaqavjcdonlnzs

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyCO0kKndUNlmQi3B5mxy4dblg_8WYcuKuk

# Stripe (Production - SOLICITAR AO CLIENTE)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# App Config
VITE_APP_ENV=production
VITE_APP_URL=https://padoka.vercel.app
NODE_ENV=production
```

## Supabase Production Setup

### 1. Verificar Edge Functions
```bash
# Listar functions deployadas
supabase functions list

# Deploy todas as functions para produção
supabase functions deploy cron-stock-data
supabase functions deploy geocode-address
supabase functions deploy calculate-distance
```

### 2. Database Production Checklist
- [ ] Todas as tabelas criadas
- [ ] RLS Policies ativas e testadas
- [ ] Backup automático configurado (7 dias)
- [ ] Connection pooling otimizado
- [ ] Índices de performance criados

### 3. Security Configuration
```sql
-- Verificar RLS ativo em todas as tabelas
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verificar policies
SELECT * FROM pg_policies;
```

## Security Headers (Já configurado)

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' 
  https://cdn.tailwindcss.com 
  https://maps.googleapis.com 
  https://js.stripe.com;
connect-src 'self' 
  https://*.supabase.co 
  https://api.stripe.com 
  https://maps.googleapis.com;
```

### Security Headers Complete
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin

## Performance Optimization

### Vercel Configuration
- **Regions**: iad1 (US East), sfo1 (US West)
- **Edge Network**: Global CDN automático
- **Image Optimization**: Automático
- **Compression**: Brotli + Gzip

### Bundle Optimization
```javascript
// Já configurado em vite.config.ts
build: {
  target: 'esnext',
  minify: 'terser',
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        supabase: ['@supabase/supabase-js'],
        stripe: ['@stripe/stripe-js'],
        maps: ['@googlemaps/js-api-loader']
      }
    }
  }
}
```

## Monitoring e Analytics

### 1. Vercel Analytics
```bash
# Habilitar via dashboard Vercel
# Analytics > Enable
```

### 2. Error Tracking (Sentry - Opcional)
```bash
npm install @sentry/react @sentry/tracing

# Configurar em src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_DSN",
  environment: "production"
});
```

### 3. Performance Monitoring
- Core Web Vitals automático via Vercel
- Lighthouse CI integrado
- Real User Monitoring (RUM)

## CI/CD Pipeline

### GitHub Actions (Opcional)
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20
```

### Deploy Automático
- Push to main → Deploy production automático
- Pull Requests → Preview deployments
- Rollback instantâneo via dashboard

## Backup e Disaster Recovery

### Supabase Backup
- Backup automático diário (7 dias retenção)
- Point-in-time recovery disponível
- Export manual via dashboard

### Code Backup
- Repositório Git como source of truth
- Deploy automático via Git
- Vercel mantém histórico de deploys

## DNS e Domínio

### Configuração Recomendada
```
# Registrar domínio: padoka.com.br
# DNS Provider: Cloudflare (recomendado)

# Records necessários:
A     @        76.76.19.19
CNAME www      padoka-delivery-pwa.vercel.app
TXT   @        "vercel-site-verification=..."
```

### SSL Certificate
- Let's Encrypt automático via Vercel
- Wildcard certificate para subdomínios
- Auto-renewal configurado

## Checklist de Produção

### Pré-Deploy
- [ ] Variáveis de ambiente configuradas
- [ ] Supabase production database setup
- [ ] Edge functions deployadas
- [ ] Domínio DNS configurado
- [ ] SSL certificate ativo

### Pós-Deploy
- [ ] PWA functionality testada
- [ ] Service workers funcionando
- [ ] Offline mode testado
- [ ] Performance Lighthouse > 90
- [ ] Security headers validados
- [ ] Analytics configurado

### Performance Targets
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3.5s
- [ ] PWA Installable

## Comandos de Deploy

### Deploy Inicial
```bash
# 1. Build de produção
npm run build:production

# 2. Deploy via Vercel
vercel --prod

# 3. Verificar deploy
curl -I https://padoka.vercel.app
```

### Deploy Subsequentes
```bash
# Desenvolvimento iterativo
git add .
git commit -m "feat: nova funcionalidade"
git push origin main
# Deploy automático ativado
```

### Rollback
```bash
# Via CLI
vercel rollback

# Via Dashboard
# Vercel > Deployments > Previous > Promote
```

## Contatos e Support

### Plataformas
- **Vercel Support**: vercel.com/support
- **Supabase Support**: supabase.com/support
- **DNS/Cloudflare**: cloudflare.com/support

### Documentação
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [PWA Best Practices](https://web.dev/pwa/)

---

**🚀 Aplicação pronta para produção com alta disponibilidade, performance otimizada e segurança empresarial.**