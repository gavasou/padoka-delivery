# 🚀 CONFIGURAÇÃO RAILWAY - DEPLOY PADOKA DELIVERY

## PASSO A PASSO DETALHADO (2 MINUTOS)

### 1. ACESSAR RAILWAY
- Abra: https://railway.app
- Clique: **"Login"** (canto superior direito)
- Clique: **"Continue with GitHub"**
- Faça login com sua conta GitHub

### 2. CRIAR PROJETO
- Na dashboard, clique: **"New Project"**
- Selecione: **"Deploy from GitHub repo"**
- Encontre: **"padoka-delivery"**
- Clique: **"Deploy Now"**

### 3. CONFIGURAR BUILD (IMPORTANTE!)
**ANTES DO DEPLOY COMPLETAR, configure as opções:**

- No projeto criado, clique na aba: **"Settings"**
- Role até: **"Build & Deploy Settings"**

**Configure EXATAMENTE assim:**

```
Build Command:
npm install && npm run build

Start Command:
npx serve -s dist -l 3000

Root Directory:
(DEIXAR VAZIO)
```

### 4. VARIÁVEIS DE AMBIENTE
Na mesma tela "Settings", encontre: **"Environment Variables"

**ADICIONE ESTAS 2 VARIÁVEIS:**

**Variável 1:**
```
Name: VITE_SUPABASE_URL
Value: https://ywpazjaaqavjcdonlnzs.supabase.co
```

**Variável 2:**
```
Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

### 5. REFAZER DEPLOY
- Vá para aba: **"Deploy"**
- Clique: **"Deploy Now"** (botão azul)
- **AGUARDE** 3-5 minutos

### 6. ACESSAR APLICAÇÃO
- Quando deploy concluir, o Railway vai mostrar uma **URL**
- Exemplo: `https://padoka-delivery-production-xxxx.railway.app`
- **CLIQUE NA URL** para acessar sua aplicação!

## ✅ CHECKLIST RÁPIDO
- [ ] Login no Railway com GitHub ✓
- [ ] Criou projeto do GitHub repo ✓
- [ ] Configurou Build Command ✓
- [ ] Configurou Start Command ✓
- [ ] Adicionou VITE_SUPABASE_URL ✓
- [ ] Adicionou VITE_SUPABASE_ANON_KEY ✓
- [ ] Refez deploy ✓
- [ ] Acessou URL final ✓

## 🚨 IMPORTANTE
**Se der erro, copiem EXATAMENTE os comandos:**

**Build Command (copie e cole):**
```bash
npm install && npm run build
```

**Start Command (copie e cole):**
```bash
npx serve -s dist -l 3000
```

## 🎯 RESULTADO ESPERADO
Após 3-5 minutos, você terá sua aplicação rodando no Railway com URL pública funcionando!