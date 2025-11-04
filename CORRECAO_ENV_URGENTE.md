# 🔧 CORREÇÃO URGENTE - Variáveis de Ambiente

## 🚨 **PROBLEMA IDENTIFICADO**
O Vercel está interpretando as variáveis como comando:
```
Running "install" command: `VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY`
```

**Significa que as variáveis estão configuradas INCORRETAMENTE.**

## 🛠️ **SOLUÇÃO IMEDIATA**

### PASSO 1: Acessar Vercel
- Vá em: https://vercel.com/dashboard
- Clique em **padoka-delivery**
- Vá em **Settings** → **Environment Variables**

### PASSO 2: DELETAR TODAS AS VARIÁVEIS
1. **DELETE** todas as variáveis existentes (não apenas desabilite)
2. **REMOVE** completamente as variáveis:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY

### PASSO 3: RECRIAR CADA VARIÁVEL SEPARADAMENTE

#### Variable 1:
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://ywpazjaaqavjcdonlnzs.supabase.co`
- **Environment:** Production, Preview, Development
- **Click: "Save"**

#### Variable 2:
- **Name:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs`
- **Environment:** Production, Preview, Development
- **Click: "Save"**

### PASSO 4: RETRY DEPLOY
1. Vá em **Deployments**
2. Clique nos **3 pontinhos (...)** do último deploy
3. Selecione **"Retry"**

## ⚠️ **IMPORTANTE**
- **DELETE** completamente as variáveis antes de recriar
- **UMA VARIÁVEL POR VEZ**
- **Mantenha os nomes exatos:** `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`
- **Copie os valores EXATOS** fornecidos acima

## 🎯 **Esperado**
Após a correção, o build deve mostrar:
```
Installing dependencies...
npm install
```
Ao invés de executar as variáveis como comandos.

---
**🚨 EXECUTE ESTES PASSOS AGORA E ME CONFIRME!**