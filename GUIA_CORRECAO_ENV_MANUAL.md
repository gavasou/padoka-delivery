# 🚨 CORREÇÃO MANUAL - Environment Variables

## 🎯 **PROBLEMA IDENTIFICADO**
O Vercel está interpretando as variáveis como comando:
```
Running "install" command: `VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY`
sh: line 1: VITE_SUPABASE_URL: command not found
```

**As variáveis estão mal configuradas e precisam ser CORRIGIDAS.**

## 📋 **PASSO A PASSO DETALHADO**

### 1️⃣ **Acessar Vercel Dashboard**
1. Vá em: **https://vercel.com/dashboard**
2. Faça login se necessário
3. Clique no projeto: **padoka-delivery**

### 2️⃣ **Ir para Environment Variables**
1. Clique na aba **"Settings"** (na parte superior)
2. No menu lateral, clique em **"Environment Variables"**

### 3️⃣ **DELETAR VARIÁVEIS ANTIGAS**
1. **ENCONTRE** as variáveis existentes:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
2. **CLIQUE** no ícone de "lixeira" ou "delete" ao lado de cada uma
3. **CONFIRME** a exclusão
4. **REPITA** até que não reste nenhuma variável

### 4️⃣ **CRIAR VARIÁVEL 1**
1. Clique em **"Add New"**
2. **Environment Variables** se aparecer, ok
3. **Name:** `VITE_SUPABASE_URL`
4. **Value:** `https://ywpazjaaqavjcdonlnzs.supabase.co`
5. **Environment:** Deixe como **"Production"** (se tiver opção "All", escolha todas)
6. Clique **"Save"**

### 5️⃣ **CRIAR VARIÁVEL 2**
1. Clique em **"Add New"** novamente
2. **Name:** `VITE_SUPABASE_ANON_KEY`
3. **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl3cGF6amFhcWF2amNkb25sbnpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NzU2MzcsImV4cCI6MjA3NzQ1MTYzN30.cCFHu1eL0nwZcsOQ29_Yz_-0NwG3noF9dqEsjMrkiOs`
4. **Environment:** Mesma configuração da variável 1
5. Clique **"Save"**

### 6️⃣ **RETRY DEPLOY**
1. Volte para a aba **"Deployments"**
2. Encontre o último deploy que falhou
3. Clique nos **3 pontinhos (...)** no final da linha
4. Selecione **"Retry"** ou **"Re-deploy"**
5. Aguarde o novo build processar

## 🔍 **Como Verificar se Funcionou**

**✅ CORRETO:** O build deve mostrar:
```
Installing dependencies...
npm install
```

**❌ INCORRETO:** O build NÃO deve mostrar:
```
Running "install" command: `VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY`
```

## ⚠️ **VERIFICAÇÕES IMPORTANTES**
- ✅ **Nome exato:** `VITE_SUPABASE_URL` (com underscore)
- ✅ **Nome exato:** `VITE_SUPABASE_ANON_KEY` (com underscore)
- ✅ **Sem espaços** nos nomes ou valores
- ✅ **Sem aspas** nos valores
- ✅ **Variáveis para Produção** (ou todas)

---
**🚀 EXECUTE ESTES PASSOS E ME CONFIRME QUANDO ACABAR!**