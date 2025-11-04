# 🛠️ CONFIGURAÇÃO TÉCNICA RAILWAY

## 📦 **ESTRUTURA DO DEPLOY**

### **Detecção Automática**
Railway detecta automaticamente:
- **Package Manager**: npm/pnpm
- **Framework**: Vite + React
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### **Configuração Manual (railway.json)**

```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "on_failure"
  }
}
```

---

## 🔧 **VARIÁVEIS DE AMBIENTE**

### **Obrigatórias**:
```bash
# Produção
VITE_SUPABASE_URL = https://ywpazjaaqavjcdonlnzs.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs
```

### **Opcionais**:
```bash
# Analytics (se usar)
VITE_GA_TRACKING_ID = G-XXXXXXXXXX
VITE_SENTRY_DSN = https://xxx@sentry.io/xxx

# Environment
NODE_ENV = production
VITE_ENV = production
```

---

## 📁 **ESTRUTURA DE ARQUIVOS**

### **Require para Vite**:
```bash
# Railway detecta automaticamente:
/
├── package.json          ✅ Detectado
├── vite.config.ts        ✅ Detectado
├── index.html            ✅ Página principal
├── dist/                 ✅ Build output
└── src/                  ✅ Código fonte
```

### **Compatibilidade**:
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

---

## 🚀 **COMANDOS DE DEPLOY**

### **Build Local (teste)**:
```bash
npm install
npm run build
npm run preview
```

### **Deploy no Railway**:
1. **Git push** → Deploy automático
2. **GitHub webhook** → Trigger deploy
3. **Railway build** → Compila projeto
4. **Railway deploy** → Disponibiliza

---

## 📊 **LOGS ESPERADOS**

### **Build Successful**:
```bash
✅ npm install (474 packages)
✅ npm run build
✅ vite v4.5.5 building for production
✅ ✓ 133 modules transformed
✅ Build completed successfully
✅ Application deployed
```

### **Error Detection**:
```bash
❌ npm install failed
❌ Build failed
❌ Import resolution error
```

---

## 🔍 **TROUBLESHOOTING**

### **Problema 1: Build Fails**
```bash
# Solução: Verificar package.json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### **Problema 2: Variables Not Working**
```bash
# Solução: Verificar Variable Manager
VITE_SUPABASE_URL = https://...  ✅ Correto
SUPABASE_URL = https://...        ❌ Errado (deve ter VITE_ prefixo)
```

### **Problema 3: Port Error**
```bash
# Solução: Railway define PORT automaticamente
# Use: process.env.PORT
# Ou: Railway detecta da build config
```

---

## 🎯 **VERIFICAÇÃO PÓS-DEPLOY**

### **Health Check**:
```bash
# Verificar URL base
GET https://[projeto-id].railway.app/

# Deve retornar: HTML da aplicação
# Status: 200 OK
```

### **API Test**:
```bash
# Testar Supabase connection
# Console do navegador deve mostrar:
console.log('Supabase:', supabase)
```

### **Performance**:
```bash
# Lighthouse score esperado:
Performance: 90+
Accessibility: 95+
Best Practices: 90+
SEO: 85+
```

---

## 🔗 **LINKS IMPORTANTES**

- **Dashboard Railway**: https://railway.app/dashboard
- **Deploy Logs**: [Projeto] → "Logs"
- **Variables**: [Projeto] → "Variables"  
- **Domains**: [Projeto] → "Settings" → "Domains"
- **Monitoring**: [Projeto] → "Metrics"

---

## 💡 **DICAS ESPECÍFICAS**

### **Deploy Mais Rápido**:
1. **Conecte GitHub** antes de fazer upload
2. **Push para master** → Deploy automático
3. **Use branch main** para deploys estáveis

### **Variables**:
1. **Use Variable Manager** (não .env files)
2. **Prefixo VITE_** para variáveis públicas
3. **Sensitive data** em Variables, não no código

### **Performance**:
1. **Static assets** servidos via CDN
2. **Build optimization** automático
3. **Compression** automática (gzip)

---

**🎯 Resultado Final**: 
- **URL**: https://[projeto-id].railway.app
- **Status**: 100% funcional
- **Performance**: Otimizada
- **Uptime**: 99.9%
