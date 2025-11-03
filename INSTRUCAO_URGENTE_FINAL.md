# 🚨 INSTRUÇÃO URGENTE - CORREÇÃO EM 2 MINUTOS

## 🎯 PROBLEMA:
Ainda está aparecendo o erro de conflito `functions` + `builds`

## ⚡ SOLUÇÃO DEFINITIVA:

### **1. ACESSE ESTE LINK:**
```
https://github.com/gavasou/padoka-delivery/edit/main/vercel.json
```

### **2. SELECIONE TUDO (Ctrl+A) E SUBSTITUA POR:**
```json
{"version": 3, "name": "padoka-delivery-pwa", "alias": ["padoka", "padoka-app", "padoka-delivery"], "builds": [{"src": "package.json", "use": "@vercel/static-build", "config": {"distDir": "dist"}}], "routes": [{"src": "/sw.js", "headers": {"Service-Worker-Allowed": "/", "Cache-Control": "public, max-age=0, must-revalidate"}}, {"src": "/manifest.webmanifest", "headers": {"Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=86400"}}, {"src": "/assets/(.*)", "headers": {"Cache-Control": "public, max-age=31536000, immutable"}}, {"src": "/(.*\\.(png|jpg|jpeg|gif|svg|webp|ico))", "headers": {"Cache-Control": "public, max-age=86400"}}, {"src": "/(.*)", "dest": "/index.html"}], "headers": [{"source": "/(.*\\.(js|css))", "headers": [{"key": "Content-Encoding", "value": "gzip, br"}, {"key": "Vary", "value": "Accept-Encoding"}]}, {"source": "/(.*)", "headers": [{"key": "X-Content-Type-Options", "value": "nosniff"}, {"key": "X-Frame-Options", "value": "DENY"}, {"key": "X-XSS-Protection", "value": "1; mode=block"}, {"key": "Referrer-Policy", "value": "strict-origin-when-cross-origin"}, {"key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(self), payment=(self)"}, {"key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload"}, {"key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://maps.googleapis.com https://js.stripe.com https://aistudiocdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://maps.googleapis.com https://places.googleapis.com; frame-src https://js.stripe.com https://checkout.stripe.com; object-src 'none'; base-uri 'self'; manifest-src 'self';"}]}], "regions": ["iad1", "sfo1"], "github": {"silent": true}}
```

### **3. COMMIT:**
- Título: `Fix vercel.json - Remove functions property`
- Clique: **"Commit changes"**

### **4. DEPLOY NO VERCEL:**
1. https://vercel.com/dashboard
2. Projeto: padoka-delivery
3. Botão: **"Redeploy"**

---

## ✅ RESULTADO:
- ❌ Sem mais erro `functions` + `builds`
- ✅ Deploy funcionando
- 🌐 URL: https://padoka-delivery-pwa.vercel.app

## ⚠️ IMPORTANTE:
- O arquivo deve ter **EXATAMENTE 1 linha** (formato compactado)
- **NÃO deve conter** a palavra "functions" em lugar nenhum
- Começa com `{` e termina com `}`

---

⏱️ **Tempo total: 2 minutos máximo**

*Urgência aplicada: 03/11/2025 14:03:56*