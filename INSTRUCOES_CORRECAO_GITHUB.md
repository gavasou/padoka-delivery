# 🎯 INSTRUÇÕES PARA CORRIGIR NO GITHUB

## 🚨 ERRO IDENTIFICADO:
**"A propriedade 'functions' não pode ser usada em conjunto com a propriedade 'builds'"**

---

## ✅ SOLUÇÃO - PASSO A PASSO:

### **1. Acesse o GitHub**
```
URL: https://github.com/gavasou/padoka-delivery
```

### **2. Localize o arquivo vercel.json**
- Na lista de arquivos, procure por: **vercel.json**
- Clique no arquivo

### **3. Edite o arquivo**
- Clique no ícone **lápis** (Edit this file)

### **4. REMOVA estas linhas (estão aproximadamente nas linhas 94-98):**
```json
  ],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1", "sfo1"],
```

### **5. Deve ficar assim (sem as linhas functions):**
```json
  ],
  "regions": ["iad1", "sfo1"],
  "github": {
    "silent": true
  }
}
```

### **6. Commit das alterações**
- **Título do commit:** `Fix: Remove conflicting 'functions' property from vercel.json`
- Clique **"Commit changes"**

### **7. Voltar ao Vercel**
- Acesse: https://vercel.com/dashboard
- Clique **"Redeploy"** no projeto padoka-delivery
- ✅ **Deploy deve funcionar sem erros!**

---

## 🎯 RESULTADO ESPERADO:
- Deploy sem erro functions/builds
- URL: https://padoka-delivery-pwa.vercel.app
- PWA funcionando 100%

---

**⏱️ Tempo total: 3-5 minutos**

*Correção aplicada em: 03/11/2025 13:54:24*