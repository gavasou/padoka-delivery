# ⚡ RESOLVER ERRO RAILWAY EM 3 PASSOS

## 🚨 ERRO: 330667720335599 - 1762282339

### PASSO 1: DELETAR PROJETO ATUAL
1. **Dashboard Railway:** https://railway.app/dashboard
2. **Localize** o projeto "padoka-delivery"
3. **Clique nos 3 pontinhos** (⋮) ao lado do nome
4. **Clique "Delete"** → Confirme a exclusão

### PASSO 2: CRIAR NOVO PROJETO
1. **Clique "New Project"**
2. **Selecione "Deploy from GitHub repo"**
3. **Encontre "padoka-delivery"** na lista
4. **Clique "Deploy Now"**

### PASSO 3: CONFIGURAR (ANTES DO BUILD)
⚠️ **IMPORTANTE:** Configure ANTES do deploy terminar!

1. **Vá para Settings** (aba lateral)
2. **Role até "Build & Deploy Settings"**

**Configure EXATAMENTE:**
```
Build Command: npm install && npm run build
Start Command: npx serve -s dist -l 3000
Root Directory: (DEIXAR VAZIO)
```

3. **Environment Variables:**
```
Name: VITE_SUPABASE_URL
Value: https://ywpazjaaqavjcdonlnzs.supabase.co

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

4. **Deploy:** Aba Deploy → "Deploy Now"
5. **Aguardar:** 3-5 minutos

## ✅ SE FUNCIONAR:
Railway vai mostrar: **"Success"** + **URL pública**

## 🚨 SE DER ERRO NOVAMENTE:
- Aguarde 30 minutos
- Delete novamente
- Recrie o projeto
- Configure as variáveis ANTES do deploy

## 📋 CHECKLIST RÁPIDO:
- [ ] Deleted projeto atual
- [ ] Criado novo projeto do GitHub
- [ ] Configurado Build Command
- [ ] Configurado Start Command  
- [ ] Adicionado VITE_SUPABASE_URL
- [ ] Adicionado VITE_SUPABASE_ANON_KEY
- [ ] Deploy iniciado
- [ ] URL funcionando

**⏱️ Tempo total:** 5-7 minutos