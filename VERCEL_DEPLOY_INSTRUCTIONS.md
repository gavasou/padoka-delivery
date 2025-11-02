# 📋 Instruções Deploy Vercel - Padoka Bakery

## 🎯 **Deploy Rápido no Vercel (Recomendado)**

### **Passo 1: Instalar Vercel CLI**
```bash
npm install -g vercel
```

### **Passo 2: Preparar Projeto**
```bash
# No diretório do projeto
cd /workspace

# Instalar dependências
npm install

# Fazer build (se funcionar, se não, continue mesmo assim)
npm run build
```

### **Passo 3: Deploy no Vercel**
```bash
# Comando principal
vercel

# Seguir instruções interativas:
# - Set up and deploy? [Y/n] y
# - Which scope? (selecionar sua conta)
# - Link to existing project? [y/N] N
# - Project name: padoka-bakery
# - In which directory? (padrão ou .)
```

### **Passo 4: Configurar Variáveis de Ambiente**
```bash
# Adicionar chaves necessárias
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY  
vercel env add VITE_OPENAI_API_KEY
```

### **Passo 5: Deploy Produção**
```bash
# Deploy final
vercel --prod
```

---

## 🌐 **Configuração de Domínio no Vercel**

### **Domínio Gratuito (Automático)**
- ✅ URL gerada: `https://padoka-bakery.vercel.app`
- ✅ SSL automático
- ✅ CDN global
- ✅ Performance otimizada

### **Domínio Próprio**

#### **Via Vercel Dashboard**
1. Acessar [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecionar projeto `padoka-bakery`
3. Ir em **Settings > Domains**
4. Adicionar domínio (ex: `padoka-bakery.com`)
5. Configurar DNS conforme instruções

#### **Configuração DNS (Cloudflare)**
```
Type: CNAME
Name: www
Target: cname.vercel-dns.com

Type: A
Name: @
Target: 76.76.19.61
```

---

## 🔧 **Solução para Problema de Build**

### **Causa do Erro Vite**
```
Error: Cannot find module 'vite/bin/vite.js'
```

### **Soluções**

#### **Solução 1: Deploy com Build Manual**
```bash
# Limpar node_modules
rm -rf node_modules
rm package-lock.json

# Reinstalar
npm install

# Se falhar, tentar com --force
npm install --force

# Build
npm run build
```

#### **Solução 2: Deploy Direto (Recomendado)**
```bash
# O Vercel detecta automaticamente projetos React
# Fazer upload do código fonte, Vercel faz o build automaticamente
```

#### **Solução 3: Netlify Alternative**
```bash
# Se Vercel falhar
npm install -g netlify-cli
netlify deploy --prod
```

---

## 📱 **Configurações Específicas do App**

### **Arquivos Importantes**
- ✅ `package.json` - Configurado para React/Vite
- ✅ `vite.config.ts` - Configurações de build
- ✅ `index.html` - Ponto de entrada PWA
- ✅ `components/AdminApp.tsx` - Painel administrativo
- ✅ `components/AIMaintenancePanel.tsx` - IA Assistant
- ✅ `components/TeamChat.tsx` - Chat da equipe
- ✅ `components/AdvancedAdminPanel.tsx` - Controles avançados

### **Dependências Críticas**
```json
{
  "react": "^18.2.0",
  "vite": "^5.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^3.3.0",
  "supabase": "^2.39.0",
  "react-router-dom": "^6.8.0"
}
```

---

## 🚀 **Deploy Automático com GitHub**

### **Conectar Repositório**
1. Criar repositório no GitHub
2. Fazer push do código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Padoka Bakery App"
   git remote add origin https://github.com/seu-usuario/padoka-bakery.git
   git push -u origin main
   ```
3. Conectar Vercel ao repositório
4. Deploy automático a cada push

---

## ⚠️ **Troubleshooting**

### **Erro: Module Not Found**
```bash
# Limpar cache
npm run clean
npm install

# Ou usar npx
npx vite build
```

### **Erro: Supabase Connection**
- Verificar `VITE_SUPABASE_URL`
- Verificar `VITE_SUPABASE_ANON_KEY`
- Verificar se o projeto Supabase está ativo

### **Erro: OpenAI API**
- Verificar `VITE_OPENAI_API_KEY`
- Verificar se a chave tem créditos

---

## ✅ **Checklist Final**

- [ ] Vercel CLI instalado
- [ ] Projeto deployado com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Teste das funcionalidades principais
- [ ] Domínio configurado (opcional)
- [ ] SSL ativo
- [ ] Performance otimizada

---

## 🎯 **Resultado Esperado**

Após o deploy no Vercel, você terá:

- ✅ **URL Profissional**: `https://padoka-bakery.vercel.app`
- ✅ **SSL/HTTPS**: Automático
- ✅ **Performance**: CDN global
- ✅ **Painel Admin**: 100% funcional
- ✅ **IA Assistant**: Funcionando
- ✅ **Chat da Equipe**: Real-time
- ✅ **Controles Avançados**: Completos
- ✅ **PWA**: Instalável em dispositivos

**Tempo estimado:** 10-15 minutos para deploy completo!