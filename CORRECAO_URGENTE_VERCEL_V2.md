# ⚠️ CORREÇÃO URGENTE - VERCEL.JSON V2

## Erro Identificado
O erro "Solicitação inválida: `version` deve ser <= 2" indica que o Vercel não aceita versão 3.

## INSTRUÇÕES CORRETAS:

### 1. Acesse o GitHub:
- Vá para: https://github.com/gavasou/padoka-delivery/edit/main/vercel.json

### 2. Selecione todo conteúdo (Ctrl+A) e substitua por este JSON:

```json
{"version": 2, "name": "padoka-delivery-pwa", "builds": [{"src": "package.json", "use": "@vercel/static-build", "config": {"distDir": "dist"}}], "routes": [{"src": "/sw.js", "headers": {"Service-Worker-Allowed": "/", "Cache-Control": "public, max-age=0, must-revalidate"}}, {"src": "/manifest.webmanifest", "headers": {"Content-Type": "application/manifest+json", "Cache-Control": "public, max-age=86400"}}, {"src": "/assets/(.*)", "headers": {"Cache-Control": "public, max-age=31536000, immutable"}}, {"src": "/(.*\\.(png|jpg|jpeg|gif|svg|webp|ico))", "headers": {"Cache-Control": "public, max-age=86400"}}, {"src": "/(.*)", "dest": "/index.html"}]}
```

### 3. Commit:
- Mensagem: "Fix vercel.json - Use version 2"
- Clique em "Commit changes"

### 4. Redeploy no Vercel:
- Vá ao dashboard do Vercel
- Clique em "Redeploy"

## ⚡ VERSÃO MAIS SIMPLES (Recomendada)
Se ainda der erro, use apenas:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## Arquivo Pronto
Arquivo já corrigido criado: `vercel_corrigido.json`