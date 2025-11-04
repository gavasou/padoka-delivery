# 🛠️ ERRO NETLIFY - BORDAS VERMELHAS - CORREÇÃO IMEDIATA

## ❌ ERRO VISUAL NA IMAGEM:
- Campo "Key" com **borda vermelha**
- Ícone **X vermelho** ao lado
- Erro de validação

## ✅ SOLUÇÃO - DELETE E RECRIE:

### PASSO 1: DELETE A VARIÁVEL ERRADA
- **Clique no ícone X** ao lado da variável
- **DELETE** completamente

### PASSO 2: ADD VARIÁVEL 1 (CORRETA)
- **Key:** `VITE_SUPABASE_URL`
- **Value:** `https://ywpazjaaqavjcdonlnzs.supabase.co`
- **Clique "Add a variable"**

### PASSO 3: ADD VARIÁVEL 2 (CORRETA)  
- **Key:** `VITE_SUPABASE_ANON_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs`
- **Clique "Add a variable"**

### PASSO 4: VERIFICAÇÃO
**Você deve ver SEM bordas vermelhas:**
```
✅ VITE_SUPABASE_URL     → https://ywpazjaaqavjcdonlnzs.supabase.co
✅ VITE_SUPABASE_ANON_KEY → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### PASSO 5: DEPLOY
- Clique **"Trigger deploy"** ou **"Deploy site"**
- Aguardar 2-3 minutos

## 🚨 O QUE NÃO PODE USAR:
❌ `VITE_SUPABASE_URL +VITE_SUPABASE_` (INVÁLIDO)
❌ `VITE_SUPABASE_URL+VITE_SUPABASE_` (INVÁLIDO)  
❌ Espaços nos nomes
❌ Símbolos especiais (+ - _ =)

## ✅ NOME CORRETO:
APENAS: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`

## 🎯 RESULTADO ESPERADO:
Sem bordas vermelhas → Deploy funcionando → Site no ar!