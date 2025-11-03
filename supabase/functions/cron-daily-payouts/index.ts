Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Configuracao do Supabase ausente');
    }

    // Buscar divisões pendentes do dia
    const today = new Date().toISOString().split('T')[0];
    
    const divisionsResponse = await fetch(
      `${supabaseUrl}/rest/v1/daily_sales_division?date=eq.${today}&status=eq.PENDING`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    if (!divisionsResponse.ok) {
      throw new Error('Erro ao buscar divisoes pendentes');
    }

    const divisions = await divisionsResponse.json();

    if (divisions.length === 0) {
      return new Response(JSON.stringify({
        data: {
          message: 'Nenhuma divisao pendente encontrada',
          processedCount: 0
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Agrupar por beneficiário para consolidar pagamentos
    const paymentsByRecipient = consolidatePayments(divisions);

    const generatedTransfers = [];
    const errors = [];

    // Gerar transferências PIX para cada beneficiário
    for (const payment of paymentsByRecipient) {
      try {
        const transfer = await generatePixTransfer(
          supabaseUrl,
          serviceRoleKey,
          payment
        );
        generatedTransfers.push(transfer);
      } catch (error) {
        errors.push({
          recipient: payment.recipientId,
          error: error.message
        });
      }
    }

    // Atualizar status das divisões processadas
    for (const division of divisions) {
      await fetch(
        `${supabaseUrl}/rest/v1/daily_sales_division?id=eq.${division.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'COMPLETED',
            processed_at: new Date().toISOString()
          })
        }
      );
    }

    return new Response(JSON.stringify({
      data: {
        message: 'Repasses processados com sucesso',
        processedCount: divisions.length,
        transfersGenerated: generatedTransfers.length,
        errors: errors.length > 0 ? errors : undefined
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao processar repasses diarios:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'DAILY_PAYOUTS_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Consolida pagamentos por beneficiário
function consolidatePayments(divisions: any[]) {
  const consolidated = new Map();

  for (const division of divisions) {
    // Padaria
    if (division.bakery_amount > 0) {
      const key = `BAKERY_${division.bakery_id}`;
      if (!consolidated.has(key)) {
        consolidated.set(key, {
          recipientType: 'BAKERY',
          recipientId: division.bakery_id,
          amount: 0,
          divisionIds: []
        });
      }
      const entry = consolidated.get(key);
      entry.amount += parseFloat(division.bakery_amount);
      entry.divisionIds.push(division.id);
    }

    // Entregador
    if (division.delivery_id && division.delivery_amount > 0) {
      const key = `DELIVERY_${division.delivery_id}`;
      if (!consolidated.has(key)) {
        consolidated.set(key, {
          recipientType: 'DELIVERY',
          recipientId: division.delivery_id,
          amount: 0,
          divisionIds: []
        });
      }
      const entry = consolidated.get(key);
      entry.amount += parseFloat(division.delivery_amount);
      entry.divisionIds.push(division.id);
    }
  }

  return Array.from(consolidated.values());
}

// Gera transferência PIX
async function generatePixTransfer(
  supabaseUrl: string,
  serviceRoleKey: string,
  payment: any
) {
  // Buscar dados bancários do beneficiário
  const tableName = payment.recipientType === 'BAKERY' 
    ? 'bakery_banking_data' 
    : 'delivery_banking_data';
  
  const idField = payment.recipientType === 'BAKERY' 
    ? 'bakery_id' 
    : 'delivery_id';

  const bankingResponse = await fetch(
    `${supabaseUrl}/rest/v1/${tableName}?${idField}=eq.${payment.recipientId}&is_active=eq.true`,
    {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    }
  );

  if (!bankingResponse.ok) {
    throw new Error(`Erro ao buscar dados bancarios do beneficiario`);
  }

  const bankingData = await bankingResponse.json();

  if (bankingData.length === 0) {
    throw new Error(`Dados bancarios nao encontrados para ${payment.recipientType} ${payment.recipientId}`);
  }

  const banking = bankingData[0];

  // Gerar QR Code PIX via edge function
  const pixResponse = await fetch(`${supabaseUrl}/functions/v1/pix-qr-generator`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      pixKey: banking.pix_key,
      pixKeyType: banking.pix_key_type,
      amount: payment.amount,
      recipientName: banking.account_holder_name,
      txid: `PAD${Date.now()}`
    })
  });

  if (!pixResponse.ok) {
    throw new Error('Erro ao gerar QR Code PIX');
  }

  const pixData = await pixResponse.json();
  const pix = pixData.data;

  // Criar registro de transferência
  const transferData = {
    daily_sales_division_id: payment.divisionIds[0], // Primeira divisão do grupo
    recipient_type: payment.recipientType,
    recipient_id: payment.recipientId,
    recipient_name: banking.account_holder_name,
    bank_name: banking.bank_name,
    bank_code: banking.bank_code,
    pix_key_type: banking.pix_key_type,
    pix_key: banking.pix_key,
    amount: payment.amount,
    pix_qr_code: pix.pixQrCodeUrl,
    pix_qr_code_text: pix.pixQrCodeText,
    pix_transaction_id: pix.txid,
    status: 'GENERATED',
    generated_at: new Date().toISOString(),
    expires_at: pix.expiresAt,
    metadata: {
      divisionIds: payment.divisionIds,
      consolidatedAmount: payment.amount
    }
  };

  const transferResponse = await fetch(`${supabaseUrl}/rest/v1/payment_transfers`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(transferData)
  });

  if (!transferResponse.ok) {
    const errorText = await transferResponse.text();
    throw new Error(`Erro ao criar transferencia: ${errorText}`);
  }

  const transfer = await transferResponse.json();
  return transfer[0];
}
