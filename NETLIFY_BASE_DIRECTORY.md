# 🛠️ ERRO NETLIFY - BASE DIRECTORY - CORREÇÃO IMEDIATA

## ❌ ERRO ATUAL:
```
Base directory does not exist: /opt/build
Failed during stage 'Reading and parsing configuration files'
```

## ✅ SOLUÇÃO - REFINIR CONFIGURAÇÃO:

### PASSO 1: ACESSAR SETTINGS
- Netlify Dashboard → Seu site → **"Site settings"**
- Clique em **"Build & deploy"**
- Clique em **"Continuous Deployment"**

### PASSO 2: CORRIGIR BASE DIRECTORY
Na seção **"Build settings"**:

**VERIFIQUE o campo "Base directory":**
- **NÃO DEVE ter:** `/opt/build`
- **DEVE estar:** VAZIO (em branco) ou o nome da pasta se houver

### PASSO 3: CONFIGURAÇÕES CORRETAS
**Se seu projeto está na raiz do repositório:**
```
Base directory: (deixe em BRANCO/vazio)
Build command: npm run build
Publish directory: dist
```

**Se seu projeto está em uma pasta específica:**
```
Base directory: client (ou nome da pasta)
Build command: npm run build  
Publish directory: client/dist
```

### PASSO 4: VERIFICAR Build Settings COMPLETA:
```
✅ Base directory: (BRANCO/vazio)
✅ Build command: npm run build
✅ Publish directory: dist
✅ Environment variables: (já configuradas corretas)
```

### PASSO 5: REFAZER DEPLOY
- Clique **"Trigger deploy"**
- Aguardar 3 minutos

## 🎯 CAUSA DO ERRO:
- Alguém (ou algum processo) configurou "Base directory" como `/opt/build`
- Netlify usa apenas caminhos RELATIVOS ao repositório
- Caminhos ABSOLUTOS (/opt/build) não existem e causam erro

## ✅ RESULTADO ESPERADO:
- Base directory em BRANCO/vazio
- Deploy funcionando
- Site no ar sem erro de configuração