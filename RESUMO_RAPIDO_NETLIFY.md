# ⚡ RESUMO RÁPIDO: Configurar Netlify

## 🎯 **AÇÃO IMEDIATA (2 minutos)**

### **1. DESCONECTAR**
```
Netlify → Site settings → General → Link repository → Unlink this repository
```

### **2. RECONECTAR**
```
"Link repository" → "Connect an existing Git repository" → Buscar "gavasou/padoka-bakery" → Link
```

### **3. CONFIGURAR**
```
Base directory: (VAZIO)
Build command: npm run build
Publish directory: dist
```

### **4. VARIÁVEIS**
```
VITE_SUPABASE_URL = https://ywpazjaaqavjcdonlnzs.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

### **5. DEPLOY**
```
Deploys → Trigger deploy → 3 minutos
```

---

## 🎯 **CHECKLIST VISUAL**
- [ ] Repository: `gavasou/padoka-bakery` ✅
- [ ] Base directory: Vazio ✅
- [ ] Build command: `npm run build` ✅
- [ ] Publish directory: `dist` ✅
- [ ] Variables: 2 configuradas ✅
- [ ] Deploy: Triggered ✅

---

## 📋 **COMANDOS PARA COPIAR**

### **Build Command:**
```bash
npm run build
```

### **Publish Directory:**
```bash
dist
```

### **Environment Variables:**
```bash
VITE_SUPABASE_URL
https://ywpazjaaqavjcdonlnzs.supabase.co

VITE_SUPABASE_ANON_KEY
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

---

## 🚨 **SE DER ERRO**
Se ainda falhar, procure por:
- Repository conectado errado
- Build command incorreto
- Environment variables em branco
- Cache limpo não foi usado

**Execute GUIA_NETLIFY_COMPLETO.md para ajuda visual detalhada!**