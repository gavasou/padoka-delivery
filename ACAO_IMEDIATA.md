# ⚡ AÇÃO IMEDIATA - RESOLVER RAILWAY EM 5 MINUTOS

## ❌ ERRO ATUAL:
Railway: "Error • Message 330667720335599 - 1762282339"

## ✅ SOLUÇÃO RÁPIDA:

### PASSO 1: DELETE PROJETO ATUAL
- Dashboard Railway: https://railway.app/dashboard
- Clique nos 3 pontinhos (⋮) → "Delete"

### PASSO 2: CRIA NOVO
- "New Project" → "Deploy from GitHub repo"
- Selecione "padoka-delivery"
- ⚠️ **NÃO clique Deploy ainda!**

### PASSO 3: CONFIGURA ANTES DO DEPLOY
Vá para "Settings" e configure:

```
Build Command: npm install && npm run build
Start Command: npx serve -s dist -l 3000
Root Directory: (vazio)
```

### PASSO 4: VARIÁVEIS AMBIENTE
Environment Variables:

```
Name: VITE_SUPABASE_URL
Value: https://ywpazjaaqavjcdonlnzs.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

### PASSO 5: DEPLOY
- Aba "Deploy" → "Deploy Now"
- Aguardar 5 minutos
- URL funcionando! ✅

## 🆘 SE NÃO FUNCIONAR:
Use Netlify (arquivo EMERGENCIA_NETLIFY.md)

## 📁 ARQUIVOS CRIADOS:
- GUIA_RAPIDO_RAILWAY.md
- SOLUCAO_ERRO_RAILWAY.md  
- EMERGENCIA_NETLIFY.md