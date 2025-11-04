# 🚨 CONFIGURAÇÃO CORRETA - VARIÁVEIS DE AMBIENTE

## ❌ ERRO ATUAL:
```
Running "install" command: `VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY`...
sh: line 1: VITE_SUPABASE_URL: command not found
```

## ✅ SOLUÇÃO IMEDIATA:

### 🗂️ ACESSAR DASHBOARD:
1. **URL**: https://vercel.com/dashboard
2. **Projeto**: padoka-delivery  
3. **Settings** → **Environment Variables**

### 🗑️ LIMPANÇA OBRIGATÓRIA:
**DELETE TODAS as variáveis existentes, especialmente:**
- ❌ Qualquer variável com comando como valor
- ❌ Variáveis com valores vazios
- ❌ Variáveis mal configuradas

### ➕ ADICIONAR VARIÁVEIS CORRETAS:

#### VARIÁVEL 1:
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://ywpazjaaqavjcdonlnzs.supabase.co`
- **Environments**: Production ✓ | Preview ✓ | Development ✓
- **Click**: Save

#### VARIÁVEL 2:
- **Name**: `VITE_SUPABASE_ANON_KEY`  
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs`
- **Environments**: Production ✓ | Preview ✓ | Development ✓
- **Click**: Save

## 🔄 RESULTADO ESPERADO:
- **Deploy automático** disparado
- **Build success** (2-3 minutos)
- **App funcionando**

## ⚠️ IMPORTANTE:
- **Cada variável tem Name E Value**
- **NÃO** colocar comandos como valores
- **NÃO** deixar campos vazios
- **SAVE após cada variável**

**Execute esta configuração EXATAMENTE como descrita!**