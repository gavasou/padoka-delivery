# ⚡ CORRIGIR ENVIRONMENT EM 1 MINUTO

## 🚨 PROBLEMA NA SUA IMAGEM:
Você criou **UMA VARIÁVEL** com:
- Key: `VITE_SUPABASE_URL + VITE_SUPABASE_` (INVÁLIDO)
- Value: `somevalue` (INVÁLIDO)

## ✅ SOLUÇÃO: DELETE E RECRIE

### PASSO 1: DELETE A VARIÁVEL ERRADA
- Clique no **X** (delete) da variável atual

### PASSO 2: CRIE 2 VARIÁVEIS NOVAS

**VARIÁVEL 1 - COPIE EXATAMENTE:**
```
Key: VITE_SUPABASE_URL
Value: https://ywpazjaaqavjcdonlnzs.supabase.co
```

**VARIÁVEL 2 - COPIE EXATAMENTE:**
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

### PASSO 3: DISPARA DEPLOY
- **"Trigger deploy"** ou refaça o deploy

## 🎯 O QUE TEM QUE FICAR ASSIM:
```
VITE_SUPABASE_URL     → https://ywpazjaaqavjcdonlnzs.supabase.co
VITE_SUPABASE_ANON_KEY → eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⏱️ TEMPO: 30 SEGUNDOS!