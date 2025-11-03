# 🔥 UPLOAD AUTOMÁTICO - SISTEMA PADOKA

## 🎯 FASE 1: Criar Personal Access Token

Siga o arquivo: `CRIAR_TOKEN_GITHUB.md`

**Resumo dos passos:**
1. Acesse: https://github.com
2. Settings → Developer settings → Personal access tokens
3. Generate new token (classic)
4. Note: "Upload Sistema Padoka - 2025-11-03"
5. Expiration: 90 days
6. Scopes: `repo` + `workflow`
7. Generate e **copie o token**

## 🎯 FASE 2: Upload Automático

Vou usar o script: `upload_com_token.sh`

### As informações que preciso:
1. **Seu usuário do GitHub** (ex: seunome123)
2. **Nome do repositório** (padrão: padoka-bakery)
3. **Token** (que começa com ghp_)

### O que o script faz:
✅ Inicializa Git localmente
✅ Adiciona todos os arquivos
✅ Faz commit com descrição completa
✅ Cria repositório no GitHub
✅ Faz upload automático
✅ Gera instruções para Vercel

### Tempo estimado:
- **Criar token:** 2-3 minutos
- **Upload automático:** 1-2 minutos
- **TOTAL:** ~5 minutos

## 🚀 PRÓXIMO PASSO

Após criar o token, me passe:
```
Usuário GitHub: _______________
Token: ghp_xxxxxxxxxxxxxxxxxxxxx
```

E eu farei o upload completo automaticamente!

## 📋 QUALQUER DÚVIDA?

Se tiver problema na criação do token, me diga qual passo está com dificuldade!

---

**🔥 Sistema 100% pronto para upload! 🚀**
