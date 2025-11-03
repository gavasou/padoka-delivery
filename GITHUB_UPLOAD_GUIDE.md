# 🚀 Guia para Subir o Sistema Padoka no GitHub

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ Criar Conta no GitHub
1. Acesse: https://github.com
2. Clique em "Sign up" 
3. Crie sua conta (usuário, email, senha)
4. Confirme seu email

### 2️⃣ Criar Repositório
1. Acesse: https://github.com/new
2. **Repository name**: `padoka-bakery`
3. **Description**: `Sistema completo de delivery de pães artesanais - PWA com PIX, cupons e división de pagamentos`
4. **Public**: Marque como público
5. **README**: NÃO marque (já temos um)
6. **Add .gitignore**: **NÃO** marque
7. **License**: **MIT License**
8. Clique em "Create repository"

### 3️⃣ Baixar e Configurar Git
**Opção A - GitHub Desktop (Recomendado)**
1. Acesse: https://desktop.github.com
2. Baixe e instale o GitHub Desktop
3. Abra e faça login com sua conta GitHub

**Opção B - Git via Terminal**
```bash
# Verificar se tem git instalado
git --version

# Se não tiver, instale:
# Windows: Baixe em https://git-scm.com/download/win
# Mac: brew install git
# Linux: sudo apt-get install git
```

### 4️⃣ Fazer Upload dos Arquivos

**COM GITHUB DESKTOP:**
1. Abra o GitHub Desktop
2. Clique em "Add an Existing Repository from your Hard Drive"
3. Navegue até a pasta `/workspace` onde estão os arquivos do Padoka
4. Clique em "Publish repository"
5. Aguarde o upload (~5-10 minutos)

**COM GIT VIA TERMINAL:**
```bash
# Navegar até a pasta do projeto
cd /workspace

# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Fazer primeiro commit
git commit -m "Sistema Padoka - versão produção completa"

# Conectar ao GitHub (substitua SEU_USUARIO pelo seu usuário do GitHub)
git remote add origin https://github.com/SEU_USUARIO/padoka-bakery.git

# Fazer push
git branch -M main
git push -u origin main
```

### 5️⃣ Verificar Upload
1. Acesse: https://github.com/SEU_USUARIO/padoka-bakery
2. Verifique se todos os arquivos estão lá:
   - ✅ package.json
   - ✅ components/ (todas as telas)
   - ✅ supabase/ (backend completo)
   - ✅ public/ (imagens e manifest)
   - ✅ README.md

## 🎯 ARQUIVOS PRINCIPAIS INCLUÍDOS

### 📁 Frontend (React + TypeScript)
- **package.json** - Dependências do projeto
- **components/** - Todas as telas (PaymentScreen, AdminApp, etc.)
- **public/** - PWA manifest, ícones, favicon
- **dist/** - Build de produção

### 📁 Backend (Supabase)
- **supabase/functions/** - Todas as Edge Functions
- **supabase/migrations/** - Schema do banco
- **supabase/tables/** - Estrutura das tabelas

### 📁 Documentação
- **README.md** - Documentação completa
- **DEPLOY_RAPIDO_PADOKA.md** - Guia de deploy
- **INFOS_DEPLOY_PADOKA.md** - Credenciais e URLs

## ⚡ PRÓXIMO PASSO: DEPLOY NO VERCEL

Após subir no GitHub:
1. Acesse: https://vercel.com
2. Login com GitHub
3. Clique "New Project"
4. Import repositório "padoka-bakery"
5. Deploy automático!

## 🔧 CONFIGURAÇÕES VERCEL

**Framework Preset:** Vite
**Build Command:** `npm run build`
**Output Directory:** `dist`
**Install Command:** `npm install`

## 🌐 VARIÁVEIS DE AMBIENTE VERCEL

Configure no Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://ywpazjaaqavjcdonlnzs.supabase.co
VITE_SUPABASE_ANON_KEY=[sua_chave_aqui]
```

## 💰 CUSTO FINAL

- **GitHub:** R$ 0/mês (repositório público)
- **Vercel:** R$ 0/mês (plan gratuito)
- **Supabase:** R$ 0/mês (plan gratuito)
- **TOTAL:** R$ 0/mês para operar!

## 🎉 RESULTADO

URL final: `https://padoka-bakery.vercel.app`

Sistema 100% funcional com:
- ✅ Login admin e cliente
- ✅ Sistema de vendas
- ✅ PIX com QR Code
- ✅ Divisão automática de pagamentos
- ✅ Sistema de cupons
- ✅ PWA (instalável no celular)

## 🆘 SUPORTE

Se tiver dúvidas:
1. Check o repositório no GitHub
2. Verifique se todos os arquivos foram enviados
3. Confirme as variáveis de ambiente no Vercel
4. Teste a URL final

---
**Tempo total:** ~30 minutos
**Custo:** R$ 0/mês
**Status:** Sistema pronto para produção! 🚀
