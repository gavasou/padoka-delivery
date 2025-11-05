# 🔧 Comandos Git para Correção

## 🚨 URGENTE: Aplicar Correção do Build

### Método 1: GitHub Web (Mais Fácil)

1. **Acesse:** https://github.com/[SEU-USUARIO]/padoka-delivery-pwa
2. **Clique em:** `services/api.ts`
3. **Clique no ícone:** 📝 (edit)
4. **Faça as alterações** conforme `CORRECOES_REPOSITÓRIO.md`
5. **Scroll down** → **Commit changes**

### Método 2: Via Terminal

```bash
# Se você tem git configurado:
git clone https://github.com/[SEU-USUARIO]/padoka-delivery-pwa.git
cd padoka-delivery-pwa

# Fazer backup
cp services/api.ts services/api.ts.backup

# Editar arquivo (use nano, vim, ou editor preferido)
nano services/api.ts

# Aplicar mudanças (ver CORRECOES_REPOSITÓRIO.md para detalhes)

# Commit e push
git add services/api.ts
git commit -m "Fix: Substituir Type enums por literais de string para compatibilidade com @google/generative-ai"
git push origin main
```

---

## 🧪 Testar Após Correção

### Verificar Build Netlify
1. **Acesse:** https://app.netlify.com/sites/padokadeliverys
2. **Verifique:** Deploys → Último deploy deve ser "Published"
3. **Conferir:** Aplicação deve estar funcionando

### Teste Rápido da Aplicação
1. **Abrir:** https://padokadeliverys.netlify.app
2. **Verificar:** Página carrega sem erros
3. **Conferir:** Console do navegador (F12) sem erros

---

## 🔄 Próximos Comandos Git

### Criar Branch de Teste para Neon
```bash
git checkout -b test-neon-integration
echo " " >> README.md  # Adiciona espaço para mudança
git add README.md
git commit -m "Test: trigger neon workflow"
git push origin test-neon-integration
```

### Criar Pull Request
1. **GitHub:** https://github.com/[SEU-USUARIO]/padoka-delivery-pwa
2. **Clique:** "Compare & pull request" (deve aparecer automaticamente)
3. **Título:** "Test: Neon Integration"
4. **Criar PR**

---

## 📊 Verificar Status

### GitHub Actions
- **Acesse:** Actions tab no repositório
- **Verificar:** Workflow rodando para seu PR
- **Aguardar:** Conclusão (pode demorar 2-3 minutos)

### Neon Dashboard
- **Acesse:** https://neon.tech/projects/padoka-delivery/branches
- **Verificar:** Nova branch criada: `preview/pr-{NUMERO}-{branch}`

---

## 🚫 Se Algo Der Errado

### Build Ainda Falha
```bash
# Verificar mudanças
git diff HEAD -- services/api.ts

# Se erro na aplicação, reverter
git checkout HEAD -- services/api.ts
git push --force origin main
```

### GitHub Actions Falha
- Verificar logs no Actions tab
- Confirmar secrets configuradas:
  - `NEON_API_KEY` (secret)
  - `NEON_PROJECT_ID` (variable)

---

## ✅ Checklist de Sucesso

- [ ] Arquivo `services/api.ts` corrigido
- [ ] Commit feito com sucesso
- [ ] Push para `main` realizado
- [ ] Build Netlify concluded ✅
- [ ] Site funcionando normalmente

**Próximo passo:** Configurar secrets do GitHub!
