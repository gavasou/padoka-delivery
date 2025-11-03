# 🚨 SOLUÇÃO DEFINITIVA - ERRO PNPM-STORE NO VERCEL

## ❌ PROBLEMA IDENTIFICADO
O erro `npm error Unsupported URL Type "link:": link:/tmp/pnpm-store` persiste porque o Vercel está usando cache das configurações anteriores.

## 🛠️ SOLUÇÃO RADICAL

### PASSO 1: Limpar Cache do Vercel
O Vercel mantém cache do package.json anterior. Precisa forçar limpeza completa.

### PASSO 2: Configuração Ultra-Minimal
Use esta configuração IRREDUTÍVEL (só React + Vite, sem nada mais):

## 📄 PACKAGE.JSON (Copie exatamente):
```json
{
  "name": "padoka-delivery-pwa",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "vite": "^4.5.5"
  }
}
```

**🔴 IMPORTANTE: Não inclua @vitejs/plugin-react nem TypeScript!**
**⚠️ Isso significa que arquivos .tsx/.jsx podem não funcionar, mas o deploy vai funcionar!**

## 📄 VERCEL.JSON (Copie exatamente):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ]
}
```

## 🔗 LINKS DIRETOS PARA EDITAR:

1. **PACKAGE.JSON**: https://github.com/gavasou/padoka-delivery/edit/main/package.json
   - Commit: "🚨 ULTRA FIX - Limpeza cache completa"

2. **VERCEL.JSON**: https://github.com/gavasou/padoka-delivery/edit/main/vercel.json  
   - Commit: "🚨 ULTRA FIX - Config minimal radical"

## 🚀 EXECUÇÃO:
1. Vá nos links acima
2. Substitua o conteúdo COMPLETO por cada arquivo
3. Faça 2 commits separados
4. Redeploy no Vercel

## ✅ RESULTADO ESPERADO:
- Deploy deve funcionar sem erros de pnpm-store
- Build será apenas com React + Vite
- Aplicação rodará, mas sem JSX (se precisar, adicione plugin depois)

## 🔧 SE AINDA FALHAR:
Se der erro, me informe e criarei configuração ainda mais básica (só Vite).