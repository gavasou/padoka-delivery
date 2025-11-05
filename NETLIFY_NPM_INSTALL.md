# 🚨 CORREÇÃO IMEDIATA: Netlify npm install

## PROBLEMA
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@vitejs/plugin-react'
```

## CAUSA
Netlify não está executando `npm install` antes do build

## SOLUÇÃO EM 30 SEGUNDOS

### 1. ACESSE
Netlify → Site settings → Build & deploy → Build command

### 2. ALTERE O COMANDO
**DE:**
```
npm run build
```

**PARA:**
```
npm install && npm run build
```

### 3. VERIFICAÇÃO COMPLETA
✅ **Build command:** `npm install && npm run build`
✅ **Publish directory:** `dist`
✅ **Environment variables:**
   - `VITE_SUPABASE_URL` = `https://ywpazjaaqavjcdonlnzs.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs`

### 4. DEPLOY
Clique em "Trigger deploy"

## TEMPO ESPERADO: 2-3 minutos