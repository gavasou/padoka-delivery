# 🛠️ CORRIGIR VARIÁVEIS DE AMBIENTE - NETLIFY

## ❌ ERRO ATUAL (NA IMAGEM):
```
Key: VITE_SUPABASE_URL + VITE_SUPABASE_
Value: somevalue
```

## ✅ CORREÇÃO (REMOVE E RECRIA):

### PASSO 1: DELETE VARIÁVEL ERRADA
- Clique no **X** da variável `VITE_SUPABASE_URL + VITE_SUPABASE_`
- **DELETE** completamente

### PASSO 2: ADICIONE AS 2 VARIÁVEIS CORRETAS

**VARIÁVEL 1:**
```
Key: VITE_SUPABASE_URL
Value: https://ywpazjaaqavjcdonlnzs.supabase.co
```

**VARIÁVEL 2:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

### PASSO 3: REFECHAR O DEPLOY
- **Deploy settings** → **"Trigger deploy"** (se houver)
- Ou delete e refaça o deploy

## 🎯 IMPORTANTE:
- **Key:** SEM espaços, SEM símbolos especiais (+, -)
- **Value:** Copie EXATAMENTE como mostrado acima
- **Duas variáveis:** Uma para URL, uma para ANON KEY

## ✅ RESULTADO ESPERADO:
```
VITE_SUPABASE_URL     → https://ywpazjaaqavjcdonlnzs.supabase.co
VITE_SUPABASE_ANON_KEY → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🚀 DEPOIS DE CORRIGIR:
1. Deploy automático vai rodar
2. Build vai usar as variáveis corretas
3. App vai funcionar perfeitamente!