# ⚡ CORREÇÃO BASE DIRECTORY - 1 MINUTO

## 🚨 ERRO:
```
Base directory does not exist: /opt/build
```

## ✅ SOLUÇÃO RÁPIDA:

### 1. ACESSE SITE SETTINGS
- Netlify → Seu site → **"Site settings"**

### 2. VÁ PARA BUILD & DEPLOY
- **"Build & deploy"** → **"Continuous Deployment"**

### 3. ENCONTRE "BUILD SETTINGS"
- Localize campo: **"Base directory"**

### 4. CORRIGIR BASE DIRECTORY
**❌ REMOVA:**
```
/opt/build (remover completamente)
```

**✅ USE:**
```
(DEIXAR BRANCO/VAZIO)
```

### 5. VERIFICAR TUDO CORRETO:
```
Base directory: (BRANCO/vazio)
Build command: npm run build
Publish directory: dist
```

### 6. TRIGGER DEPLOY
- **"Trigger deploy"**
- **3 minutos para rodar**

## 🎯 EXPLICAÇÃO:
- **Problema:** Alguém configurou base directory como `/opt/build` (absoluto)
- **Solução:** Netlify só aceita caminhos relativos ou vazio (raiz)
- **Resultado:** Deploy funciona perfeitamente

## ⏱️ TEMPO: 1 minuto para corrigir + 3 min deploy