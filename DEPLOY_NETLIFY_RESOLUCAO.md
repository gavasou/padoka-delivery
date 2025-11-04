# 🚀 DEPLOY NETLIFY - SOLUÇÃO IMEDIATA

## ✅ POR QUE NETLIFY:
- Mais simples que Railway
- Funciona SEMPRE
- Deploy em 3 minutos
- SSL automático

## 📋 PASSO A PASSO (3 MINUTOS):

### 1. ACESSE NETLIFY
- Abra: https://netlify.com
- Clique: **"Login"** (canto superior)
- Clique: **"Login with GitHub"**
- Faça login com sua conta

### 2. NOVO SITE
- Clique: **"New site from Git"**
- Selecione: **"GitHub"**
- Encontre: **"padoka-delivery"**
- Clique: **"Deploy site"**

### 3. CONFIGURAÇÕES BUILD
Na tela "Deploy settings":

```
Build command: npm run build
Publish directory: dist
```

### 4. VARIÁVEIS AMBIENTE
- Role até: **"Environment variables"**
- Clique: **"Add a variable"**

**Variável 1:**
```
Key: VITE_SUPABASE_URL
Value: https://ywpazjaaqavjcdonlnzs.supabase.co
```

**Variável 2:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

### 5. DEPLOY AGORA
- Clique: **"Deploy site"** (botão azul)
- **AGUARDE** 2-3 minutos
- ✅ **Sucesso:** Site publicado com URL

## 🎯 RESULTADO:
Netlify vai mostrar: **"Published"** + **URL do seu site**

**Exemplo:** https://padoka-delivery-xxxx.netlify.app

## 📋 CHECKLIST:
- [ ] Login Netlify com GitHub ✓
- [ ] Novo site do GitHub ✓
- [ ] Build command: npm run build ✓
- [ ] Publish directory: dist ✓
- [ ] VITE_SUPABASE_URL adicionada ✓
- [ ] VITE_SUPABASE_ANON_KEY adicionada ✓
- [ ] Deploy iniciado ✓
- [ ] Site funcionando ✓

**⏱️ Tempo total:** 3-5 minutos