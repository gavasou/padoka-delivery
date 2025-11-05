# ✅ CHECKLIST: Configuração Netlify

## 🎯 **PASSO 1: DESCONECTAR REPOSITÓRIO**
- [ ] Site settings → General
- [ ] Link repository section
- [ ] Clicar "Unlink this repository"
- [ ] Confirmar "Unlink"

## 🎯 **PASSO 2: RECONECTAR REPOSITÓRIO CORRETO**
- [ ] Clicar "Link repository"
- [ ] Selecionar "Connect an existing Git repository"
- [ ] Buscar por: `gavasou/padoka-bakery`
- [ ] Selecionar `gavasou/padoka-bakery`
- [ ] Clicar "Link repository"

## 🎯 **PASSO 3: CONFIGURAR BUILD SETTINGS**
- [ ] Ir para Build & deploy → Continuous Deployment
- [ ] Base directory: **VAZIO** (não preencher nada)
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Clicar "Save settings"

## 🎯 **PASSO 4: CONFIGURAR ENVIRONMENT VARIABLES**
- [ ] Site settings → Environment variables
- [ ] Variable 1:
  - Key: `VITE_SUPABASE_URL`
  - Value: `https://ywpazjaaqavjcdonlnzs.supabase.co`
- [ ] Variable 2:
  - Key: `VITE_SUPABASE_ANON_KEY`
  - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs`
- [ ] Salvar cada variável

## 🎯 **PASSO 5: DEPLOY**
- [ ] Ir para aba "Deploys"
- [ ] Clicar "Trigger deploy"
- [ ] Aguardar 2-3 minutos
- [ ] Verificar log de sucesso

## 🎯 **VERIFICAÇÃO FINAL**
- [ ] Repository: `gavasou/padoka-bakery` ✅
- [ ] Deploy status: "Published" ✅
- [ ] URL: `padoka-bakery-xxx.netlify.app` ✅
- [ ] Site carrega: ✅

---

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **Erro: "Repository not found"**
- ✅ Verifique se você tem acesso ao repositório `gavasou/padoka-bakery`
- ✅ Tente desconectar e reconectar o GitHub

### **Erro: "Build failed"**
- ✅ Verifique se o Build command está exatamente: `npm run build`
- ✅ Verifique se Publish directory está exatamente: `dist`

### **Erro: Environment variables**
- ✅ Verifique se ambas as variáveis estão salvas
- ✅ Verifique se os valores estão copiados corretamente (sem espaços extras)

### **Site não carrega**
- ✅ Aguarde 1-2 minutos após o "Published"
- ✅ Tente recarregar a página (Ctrl+F5)

---

## 📞 **QUANDO TUDO ESTIVER CERTO**
Você verá no log:
```
✅ npm install (com 20+ packages)
✅ vite build
✅ Build completed successfully
🌐 Site published at: padoka-bakery-[xxx].netlify.app
```

**Copie a URL e teste o sistema completo!** 🎉