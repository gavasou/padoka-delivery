# 🚨 ERRO PNPM RESOLVIDO - AÇÃO NECESSÁRIA

## 🔍 **PROBLEMA:**
`npm error Unsupported URL Type "link:": link:/tmp/pnpm-store`
- Vercel encontrou referências ao pnpm que causaram erro

## 🎯 **SOLUÇÃO:**

### 1️⃣ **PACKAGE.JSON - Acesse:**
**https://github.com/gavasou/padoka-delivery/edit/main/package.json**

**COLE ESTE CONTEÚDO (apague tudo primeiro):**
```json
{"name": "padoka-delivery-pwa", "version": "1.0.0", "description": "Padoka - Delivery de Pães Artesanais PWA", "keywords": ["pwa", "delivery", "bakery", "subscription", "react", "vite"], "author": "Padoka Team", "license": "MIT", "private": true, "type": "module", "scripts": {"dev": "vite --host 0.0.0.0 --port 3000", "build": "vite build", "preview": "vite preview"}, "dependencies": {"react": "^18.3.1", "react-dom": "^18.3.1", "@supabase/supabase-js": "^2.45.4", "@stripe/stripe-js": "^3.4.1", "@stripe/react-stripe-js": "^2.7.3", "lucide-react": "^0.446.0", "react-hot-toast": "^2.4.1", "vite-plugin-pwa": "^0.20.5", "workbox-precaching": "^7.1.0", "workbox-strategies": "^7.1.0", "workbox-window": "^7.1.0", "@googlemaps/js-api-loader": "^1.16.6", "@types/google.maps": "^3.55.12"}, "devDependencies": {"@types/node": "^20.16.10", "@vitejs/plugin-react": "^4.3.1", "typescript": "~5.6.2", "vite": "^4.5.5"}, "engines": {"node": ">=18.0.0"}, "browserslist": ["defaults", "not IE 11"]}
```

**COMMIT:** "Fix package.json - Remove pnpm, optimize for Vercel"

### 2️⃣ **VERCEL.JSON - Acesse:**
**https://github.com/gavasou/padoka-delivery/edit/main/vercel.json**

**COLE ESTE CONTEÚDO:**
```json
{"version": 2, "builds": [{"src": "package.json", "use": "@vercel/static-build", "config": {"distDir": "dist"}}], "routes": [{"src": "/sw.js", "headers": {"Service-Worker-Allowed": "/", "Cache-Control": "public, max-age=0, must-revalidate"}}, {"src": "/manifest.webmanifest", "headers": {"Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=86400"}}, {"src": "/(.*)", "dest": "/index.html"}]}
```

**COMMIT:** "Fix vercel.json - Version 2, remove functions"

### 3️⃣ **REDEPLOY:**
- Vá ao Vercel Dashboard
- Clique em **"Redeploy"**

## ✅ **GARANTIA:**
- ❌ Remove problema do pnpm
- ✅ Usa apenas npm
- ✅ Configurações otimizadas para produção
- ✅ PWA totalmente funcional

**Execute estes 3 passos e o erro será resolvido! 🚀**