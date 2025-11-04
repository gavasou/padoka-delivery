# 🚨 CORRIGIR VARIÁVEIS DE AMBIENTE NO VERCEL

## ❌ ERRO IDENTIFICADO:
```
15:37:26.989 sh: line 1: VITE_SUPABASE_URL: command not found
15:37:26.995 Error: Command "VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY" exited with 127
```

**PROBLEMA:** As variáveis de ambiente estão sendo interpretadas como comandos.

## ✅ CREDENCIAIS DISPONÍVEIS:
- **SUPABASE_URL**: https://ywpazjaaqavjcdonlnzs.supabase.co
- **SUPABASE_ANON_KEY**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs

## ⚡ SOLUÇÃO IMEDIATA - VERCEL DASHBOARD:

### PASSO 1: ACESSAR VARIÁVEIS
1. **Acesse**: https://vercel.com/dashboard
2. **Clique**: Projeto padoka-delivery
3. **Vá**: Settings → Environment Variables

### PASSO 2: VERIFICAR/LIMPAR VARIÁVEIS
**EXCLUIR estas variáveis (se existirem):**
- ❌ `VITE_SUPABASE_URL`
- ❌ `VITE_SUPABASE_ANON_KEY`
- ❌ Qualquer comando como variável

### PASSO 3: ADICIONAR VARIÁVEIS CORRETAS

**Adicionar 1ª Variável:**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://ywpazjaaqavjcdonlnzs.supabase.co`
- **Environment**: Production, Preview, Development
- **Save**

**Adicionar 2ª Variável:**
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs`
- **Environment**: Production, Preview, Development
- **Save**

## 🔄 DEPLOY AUTOMÁTICO:
Após salvar as variáveis, o Vercel fará deploy automaticamente:
1. **Trigger**: Imediato
2. **Build**: 2-3 minutos
3. **Resultado**: Sucesso esperado

## ⚠️ IMPORTANTE:
- **NÃO** coloque comandos como variáveis
- **NÃO** deixe valores vazios
- **Use apenas valores** (não comandos ou scripts)

## 🎯 RESULTADO ESPERADO:
✅ Build success
✅ App funcionando
✅ Supabase conectado
✅ Variáveis carregadas corretamente