🚀 GUIA DEPLOY VERCEL - SISTEMA PADOKA

==============================================
📋 PASSO A PASSO COMPLETO
==============================================

✅ UPLOAD CONCLUÍDO!
Repository: https://github.com/gavasou/padoka-bakery
Files: 971 arquivos (8.48 MiB)

🎯 PRÓXIMO PASSO: DEPLOY NO VERCEL

==============================================
STEP 1: ACESSAR VERCEL
==============================================
1. Acesse: https://vercel.com
2. Clique em "Login"
3. Escolha "Sign in with GitHub"

==============================================
STEP 2: IMPORTAR PROJETO
==============================================
1. No dashboard do Vercel, clique "New Project"
2. Procure por "padoka-bakery"
3. Clique em "Import" no repositório

==============================================
STEP 3: CONFIGURAÇÕES DO DEPLOY
==============================================
🎯 Configure conforme abaixo:

✅ Project Name: padoka-bakery
✅ Framework Preset: Vite (já selecionado automaticamente)
✅ Root Directory: ./ (não mude)
✅ Build Command: npm run build
✅ Output Directory: dist
✅ Install Command: npm install

⚠️ IMPORTANTE: NÃO mude as configurações acima!

==============================================
STEP 4: VARIÁVEIS DE AMBIENTE
==============================================
Antes de fazer deploy, adicione as variáveis:

1. Clique em "Environment Variables" ou vá em Settings > Environment Variables
2. Adicione uma por vez:

VARIÁVEL 1:
Name: VITE_SUPABASE_URL
Value: https://ywpazjaaqavjcdonlnzs.supabase.co

VARIÁVEL 2:
Name: VITE_SUPABASE_ANON_KEY  
Value: [SUA_CHAVE_AQUI]

==============================================
STEP 5: FAZER DEPLOY
==============================================
1. Clique "Deploy" (botão verde)
2. Aguarde 2-5 minutos
3. Sucesso! URL será gerada

==============================================
🎯 RESULTADO FINAL
==============================================

URL gerada: https://padoka-bakery.vercel.app

🔧 TESTAR FUNCIONALIDADES:
1. Acesse a URL gerada
2. Login admin: admin@padoka.com / Padoka2025!
3. Teste sistema PIX
4. Teste cupom: TESTE10
5. Verifique divisão de pagamentos

==============================================
💰 CUSTO TOTAL: R$ 0/MÊS
⏰ TEMPO DE DEPLOY: 2-5 MINUTOS
🎉 STATUS: 100% FUNCIONAL

==============================================
