# 🚨 CORREÇÃO CACHE NETLIFY

## PROBLEMA
- npm install executou em 556ms (muito rápido)
- Apenas 14 packages instalados (deveriam ser >20)
- `@vitejs/plugin-react` não encontrado
- Cache antigo pode estar interferindo

## SOLUÇÃO FORÇADA - 3 OPÇÕES

### **OPÇÃO 1: COMANDO COM FORCE**
1. **Build settings** → **Build command**
2. **Alterar para:**
   ```
   rm -rf node_modules package-lock.json && npm install --force && npm run build
   ```
3. **Trigger deploy**

### **OPÇÃO 2: LIMPAR CACHE INTERFACE**
1. **Deploys** → **Cache & deploy data**
2. **Click:** "Clear cache and retry deploy"
3. **Trigger deploy**

### **OPÇÃO 3: NPM CACHE FORCE**
1. **Build settings** → **Build command**
2. **Alterar para:**
   ```
   npm cache clean --force && npm install && npm run build
   ```
3. **Trigger deploy**

## RECOMENDAÇÃO
**Use a OPÇÃO 1** - é a mais completa e resolve cache e dependências de uma vez.

## TEMPO ESPERADO: 3-4 minutos (mais lento devido à limpeza)