# 🚨 AINDA COM ERRO? VAMOS CORRIGIR AGORA!

## 🎯 PROBLEMA:
**"A propriedade 'functions' não pode ser usada em conjunto com a propriedade 'builds'"**

## 🔧 SOLUÇÃO DEFINITIVA:

### **PASSO 1: Verificar o arquivo atual no GitHub**
1. Acesse: https://github.com/gavasou/padoka-delivery/blob/main/vercel.json
2. Verifique se existem as palavras `"functions"` no arquivo

### **PASSO 2: Se encontrar "functions", remova:**
No arquivo vercel.json, encontre e remova estas linhas:
```json
  ],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  },
```

### **PASSO 3: Verificar o arquivo CORRETO**
O arquivo deve ter exatamente 97 linhas e NÃO deve conter a palavra "functions"

### **PASSO 4: Se ainda não funcionar, faça assim:**
1. Edite o arquivo diretamente:
   https://github.com/gavasou/padoka-delivery/edit/main/vercel.json

2. Clique em **"Edit this file"** (lápis)

3. **Substitua TODO o conteúdo** por este arquivo corrigido:

```json
{
  "version": 3,
  "name": "padoka-delivery-pwa",
  "alias": ["padoka", "padoka-app", "padoka-delivery"],
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/sw.js",
      "headers": {
        "Service-Worker-Allowed": "/",
        "Cache-Control": "public, max-age=0, must-revalidate"
      }
    },
    {
      "src": "/manifest.webmanifest",
      "headers": {
        "Content-Type": "application/manifest+json",
        "Cache-Control": "public, max-age=86400"
      }
    },
    {
      "src": "/assets/(.*)",
      "headers": {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*\\.(png|jpg|jpeg|gif|svg|webp|ico))",
      "headers": {
        "Cache-Control": "public, max-age=86400"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*\\.(js|css))",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip, br"
        },
        {
          "key": "Vary",
          "value": "Accept-Encoding"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(self), payment=(self)"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://maps.googleapis.com https://js.stripe.com https://aistudiocdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://maps.googleapis.com https://places.googleapis.com; frame-src https://js.stripe.com https://checkout.stripe.com; object-src 'none'; base-uri 'self'; manifest-src 'self';"
        }
      ]
    }
  ],
  "regions": ["iad1", "sfo1"],
  "github": {
    "silent": true
  }
}
```

4. Commit message: `Fix vercel.json - Remove functions property completely`

5. Clique **"Commit changes"**

## 🎯 PASSO 5: Redeploy no Vercel
1. https://vercel.com/dashboard
2. Projeto: padoka-delivery
3. Botão: **"Redeploy"**

---

## ⚠️ IMPORTANTE:
- O arquivo deve ter exatamente 97 linhas
- NÃO pode conter a palavra "functions" em nenhum lugar
- Deve começar com `{` e terminar com `}`

## 🚀 RESULTADO ESPERADO:
✅ Deploy sem erros  
✅ URL funcionando: https://padoka-delivery-pwa.vercel.app

---

*Aplicado em: 03/11/2025 14:03:56*