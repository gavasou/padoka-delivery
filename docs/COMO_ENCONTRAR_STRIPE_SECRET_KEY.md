# Como Encontrar a STRIPE_SECRET_KEY

## Passos para encontrar a chave secreta:

### 1. Acesse o Dashboard do Stripe
- Vá para: https://dashboard.stripe.com
- Faça login na sua conta Stripe

### 2. Navegue até as APIs
- No menu lateral esquerdo, clique em **"Developers"**
- Em seguida, clique em **"API keys"**

### 3. Localize a Secret Key
- Você verá duas seções:
  - **Publishable key** (começa com `pk_`)
  - **Secret key** (começa com `sk_`)
- A **Secret key** é a que precisamos (STRIPE_SECRET_KEY)

### 4. Copie a chave
- Clique no botão **"Reveal"** ao lado do campo "Secret key"
- Copie toda a chave (começa com `sk_`)

## ⚠️ Importante:
- **NUNCA** compartilhe a Secret Key publicamente
- Ela só é visível uma vez - guarde-a em local seguro
- Se perder, precisará gerar uma nova chave

## Exemplos de formato:
```
STRIPE_SECRET_KEY=sk_live_51... (produção)
ou
STRIPE_SECRET_KEY=sk_test_51... (teste)
```

## Se não tem conta no Stripe:
1. Acesse: https://stripe.com
2. Clique em "Sign up" 
3. Complete o registro
4. Depois siga os passos acima para encontrar a chave

---
*Guia gerado pelo MiniMax Agent para deploy do Padoka Delivery*