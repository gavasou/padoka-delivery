# Testes Manuais - Sistema PIX e Repasses

## GUIA DE TESTES COMPLETOS

### Pre-requisitos:
- Acesso ao Supabase Dashboard
- Credenciais de teste do aplicativo
- Ferramenta de teste de API (curl, Postman, ou navegador)

---

## TESTE 1: Cadastro de Dados Bancarios

### Via Supabase Dashboard:

1. **Acesse**: https://ywpazjaaqavjcdonlnzs.supabase.co
2. **Va para**: Table Editor > bakery_banking_data
3. **Clique**: Insert Row
4. **Preencha**:
   ```
   bakery_id: [UUID da padaria de teste]
   bank_name: Banco do Brasil
   bank_code: 001
   agency: 1234-5
   account_number: 12345-6
   account_type: CORRENTE
   pix_key_type: CPF
   pix_key: 12345678900
   cpf_cnpj: 12345678900123
   account_holder_name: Padaria Teste Ltda
   is_active: true
   ```
5. **Salve**

Repita para `delivery_banking_data` (entregadores).

---

## TESTE 2: Cadastro de CPF do Cliente

### Via Supabase Dashboard:

1. **Va para**: Table Editor > customer_cpf_data
2. **Insert Row**:
   ```
   customer_id: [UUID do cliente de teste]
   cpf: 12345678900
   full_name: Cliente Teste
   credits_balance: 0.00
   total_credits_earned: 0.00
   total_credits_used: 0.00
   is_verified: true
   verified_at: [Data atual]
   ```
3. **Salve**

---

## TESTE 3: Processamento de Venda (Divisao Automatica)

### Via curl:

```bash
curl -X POST https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/daily-sales-processor \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SUPABASE_ANON_KEY]" \
  -d '{
    "paymentId": "TEST_PAY_001",
    "totalAmount": 100.00,
    "bakeryId": "[UUID da padaria]",
    "deliveryId": "[UUID do entregador]",
    "customerId": "[UUID do cliente]"
  }'
```

### Resultado Esperado:
```json
{
  "data": {
    "division": {
      "id": "...",
      "total_sale_amount": 100.00,
      "bakery_amount": 10.00,
      "delivery_amount": 3.00,
      "customer_credit_amount": 3.00,
      "platform_amount": 84.00
    },
    "breakdown": {
      "total": "100.00",
      "bakery": "10.00",
      "delivery": "3.00",
      "customerCredit": "3.00",
      "platform": "84.00"
    }
  }
}
```

### Verificacao:

1. **Supabase > daily_sales_division**
   - Confirme que registro foi criado
   - Valores divididos corretamente

2. **Supabase > customer_cpf_data**
   - Verifique que `credits_balance` aumentou 3.00
   - Verifique que `total_credits_earned` aumentou 3.00

---

## TESTE 4: Geracao de QR Code PIX

### Via curl:

```bash
curl -X POST https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/pix-qr-generator \
  -H "Content-Type: application/json" \
  -d '{
    "pixKey": "12345678900",
    "pixKeyType": "CPF",
    "amount": 50.00,
    "recipientName": "Padaria Teste",
    "city": "SAO PAULO"
  }'
```

### Resultado Esperado:
```json
{
  "data": {
    "pixQrCodeText": "00020126330014br.gov.bcb.pix...",
    "pixQrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=...",
    "txid": "...",
    "amount": "50.00",
    "recipientName": "Padaria Teste",
    "pixKey": "12345678900",
    "expiresAt": "..."
  }
}
```

### Verificacao:
- Copie `pixQrCodeUrl` e cole no navegador
- Deve exibir um QR code PIX valido
- Copie `pixQrCodeText` e teste em um app bancario

---

## TESTE 5: CRON Job de Repasses Diarios

### Execucao Manual:

```bash
curl -X POST https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/cron-daily-payouts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [SUPABASE_SERVICE_ROLE_KEY]"
```

### Resultado Esperado:
```json
{
  "data": {
    "message": "Repasses processados com sucesso",
    "processedCount": 1,
    "transfersGenerated": 2
  }
}
```

### Verificacao:

1. **Supabase > payment_transfers**
   - Verifique registros criados
   - Um para padaria (10%)
   - Um para entregador (3%)
   - Cada um com QR code PIX gerado

2. **Campos a verificar**:
   - `recipient_type`: "BAKERY" ou "DELIVERY"
   - `amount`: Valor correto (10% ou 3%)
   - `pix_qr_code`: URL da imagem QR code
   - `pix_qr_code_text`: Codigo copia e cola
   - `status`: "GENERATED"

3. **Supabase > daily_sales_division**
   - Status mudou para "COMPLETED"
   - `processed_at` preenchido

---

## TESTE 6: Fluxo Completo no Aplicativo

### Passo a Passo:

1. **Login como Cliente**
   - Email: cliente@padoka.com
   - Senha: Padoka2025!

2. **Navegar para Padaria**
   - Selecione uma padaria
   - Adicione produtos ao carrinho

3. **Realizar Pagamento**
   - Escolha metodo de pagamento
   - Complete o processo
   - **Sistema automaticamente processa divisao**

4. **Verificar no Backend**:
   - Supabase > daily_sales_division
   - Deve ter novo registro com divisao automatica

5. **Verificar Creditos (se CPF cadastrado)**:
   - Supabase > customer_cpf_data
   - Saldo deve ter aumentado 3%

---

## TESTE 7: Verificacao do CRON Automatico

### Aguardar Execucao as 17:30:

1. **Crie vendas durante o dia**
   - Realize varios testes de venda
   - Verifique que divisoes sao criadas

2. **As 17:30, verifique**:
   - Supabase > payment_transfers
   - Novos registros devem aparecer automaticamente
   - Um QR code para cada beneficiario

3. **Verificar Logs**:
   - Supabase Dashboard > Edge Functions
   - Selecione `cron-daily-payouts`
   - Veja logs de execucao

---

## TESTE 8: Interface Admin (Apos Rebuild)

### Quando frontend estiver deployado:

1. **Login como Admin**
   - Email: admin@padoka.com
   - Senha: Padoka2025!

2. **Navegar para "PIX e Repasses"**
   - Deve ver 3 sub-abas

3. **Dashboard Financeiro**:
   - Metricas de vendas
   - Graficos de divisao
   - Filtros de periodo

4. **Dados Bancarios**:
   - Formularios de cadastro
   - Listagem de dados

5. **Transferencias PIX**:
   - Listagem de transferencias
   - Visualizacao de QR codes
   - Filtros de status

---

## CHECKLIST DE VALIDACAO

### Backend:
- [ ] Tabelas criadas e acessiveis
- [ ] RLS policies funcionando
- [ ] Edge function pix-qr-generator testada
- [ ] Edge function daily-sales-processor testada
- [ ] Edge function cron-daily-payouts testada
- [ ] CRON job agendado corretamente

### Fluxo de Divisao:
- [ ] Venda cria registro em daily_sales_division
- [ ] Valores divididos corretamente (10% + 3% + 3% + resto)
- [ ] Creditos do cliente atualizados automaticamente
- [ ] Status da divisao atualizado corretamente

### Fluxo de Repasses:
- [ ] CRON executa as 17:30
- [ ] Transferencias criadas em payment_transfers
- [ ] QR codes PIX gerados corretamente
- [ ] Status das transferencias atualizados

### Integracao:
- [ ] PaymentScreen chama divisao automaticamente
- [ ] Nao bloqueia fluxo de pagamento
- [ ] Logs de erro disponiveis

---

## TROUBLESHOOTING

### Problema: Divisao nao foi criada
**Verificar**:
1. Logs da edge function daily-sales-processor
2. Parametros enviados (bakeryId, totalAmount)
3. RLS policies da tabela daily_sales_division

### Problema: CRON nao executou
**Verificar**:
1. Supabase > Database > Extensions > pg_cron habilitado
2. CRON job existe: `SELECT * FROM cron.job;`
3. Logs de execucao: Supabase > Edge Functions > Logs

### Problema: QR Code invalido
**Verificar**:
1. Formato da chave PIX correto
2. Valor em formato decimal (ex: 50.00)
3. Campos obrigatorios preenchidos

### Problema: Creditos nao atualizados
**Verificar**:
1. CPF cadastrado em customer_cpf_data
2. customerId correto na requisicao
3. Logs da funcao updateCustomerCredits

---

## LOGS E MONITORAMENTO

### Acessar Logs:
1. **Supabase Dashboard**
2. **Edge Functions**
3. **Selecione a funcao**
4. **Aba "Logs"**

### O que procurar:
- Erros de execucao
- Parametros recebidos
- Resultados retornados
- Tempo de execucao

---

## CONTATOS PARA SUPORTE

- Documentacao: /workspace/SISTEMA_PIX_USO.md
- Implementacao: /workspace/SISTEMA_PIX_IMPLEMENTACAO.md
- Codigo: /workspace/components/ e /workspace/supabase/
