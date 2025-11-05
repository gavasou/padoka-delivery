# 🔧 Correções Necessárias no Repositório

## ❌ Problema Atual
O Netlify está falhando no build por causa do erro:
```
"Type" is not exported by "node_modules/@google/generative-ai/dist/index.mjs"
```

## ✅ Solução Rápida

### Passo 1: Editar services/api.ts

1. **Acesse seu repositório no GitHub**
2. **Navegue até:** `services/api.ts`
3. **Clique no ícone de edição** (lápis)

### Passo 2: Fazer as Correções

**🔸 Linha 2:** MUDAR de:
```typescript
import { GoogleGenerativeAI, Type } from "@google/generative-ai";
```
**Para:**
```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";
```

**🔸 Linhas 335-345:** MUDAR:
```typescript
type: Type.ARRAY,           → type: "array",
type: Type.OBJECT,          → type: "object", 
title: { type: Type.STRING },        → title: { type: "string" },
description: { type: Type.STRING },  → description: { type: "string" },
productName: { type: Type.STRING },  → productName: { type: "string" },
```

### Passo 3: Salvar

4. **Rolar para baixo** e clicar em "Commit changes"
5. **Mensagem de commit:**
```
Fix: Substituir Type enums por literais de string para compatibilidade com @google/generative-ai
```

### Passo 4: Verificar

6. **Verificar o arquivo** para confirmar as mudanças
7. **Aguardar** o Netlify fazer novo build automaticamente

## 🎯 Resultado Esperado

✅ Build do Netlify funcionará  
✅ Aplicação vai online normalmente  
✅ Neon extensão configurada  

## 📋 Após a Correção

Quando essas mudanças estiverem no seu repositório:

1. **GitHub Secrets:** Vou te ajudar a configurar
2. **Teste do Workflow:** Vamos validar a integração
3. **Migração de Dados:** Vamos transferir os dados do Supabase

---

**🔍 Qualquer dúvida sobre as correções?** Me avise imediatamente!
