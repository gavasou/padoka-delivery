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
    const {
      paymentId,
      subscriptionId,
      totalAmount,
      itemsTotal,
      deliveryTotal,
      bakeryId,
      deliveryId,
      customerId
    } = await req.json();

    if (!totalAmount || !bakeryId) {
      throw new Error('Parametros obrigatorios: totalAmount, bakeryId');
    }

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');

    if (!serviceRoleKey || !supabaseUrl) {
      throw new Error('Configuracao do Supabase ausente');
    }

    // LÓGICA CORRETA: Plataforma recebe APENAS as taxas (16% total)
    // Se não houver separação, assume 80% itens e 20% entrega
    const amount = parseFloat(totalAmount);
    const itemsAmount = itemsTotal ? parseFloat(itemsTotal) : amount * 0.80;
    const deliveryAmount = deliveryTotal ? parseFloat(deliveryTotal) : amount * 0.20;

    // Taxas da plataforma (16% total)
    const platformFeeFromItems = itemsAmount * 0.10;     // 10% dos itens
    const platformFeeFromDelivery = deliveryAmount * 0.03; // 3% da entrega
    const platformFeeFromCustomer = amount * 0.03;       // 3% para crédito do cliente
    const platformAmount = platformFeeFromItems + platformFeeFromDelivery + platformFeeFromCustomer;

    // Valores para beneficiários (84% total)
    const bakeryAmount = itemsAmount - platformFeeFromItems;  // 90% dos itens
    const deliveryPersonAmount = deliveryId ? (deliveryAmount - platformFeeFromDelivery) : 0; // 97% da entrega
    const customerCreditAmount = customerId ? platformFeeFromCustomer : 0; // 3% de crédito

    // Inserir registro de divisão diária
    const divisionData = {
      date: new Date().toISOString().split('T')[0],
      bakery_id: bakeryId,
      delivery_id: deliveryId || null,
      customer_id: customerId || null,
      total_sale_amount: amount,
      bakery_amount: bakeryAmount,
      delivery_amount: deliveryPersonAmount,
      customer_credit_amount: customerCreditAmount,
      platform_amount: platformAmount,
      payment_id: paymentId || null,
      subscription_id: subscriptionId || null,
      status: 'PENDING'
    };

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/daily_sales_division`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(divisionData)
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();
      throw new Error(`Erro ao inserir divisao: ${errorText}`);
    }

    const divisionResult = await insertResponse.json();
    const division = divisionResult[0];

    // Atualizar créditos do cliente se houver
    if (customerId && customerCreditAmount > 0) {
      await updateCustomerCredits(
        supabaseUrl,
        serviceRoleKey,
        customerId,
        customerCreditAmount
      );
    }

    return new Response(JSON.stringify({
      data: {
        division,
        breakdown: {
          total: amount.toFixed(2),
          platform: platformAmount.toFixed(2) + ' (16% taxas)',
          bakery: bakeryAmount.toFixed(2) + ' (90% itens)',
          delivery: deliveryPersonAmount.toFixed(2) + ' (97% entrega)',
          customerCredit: customerCreditAmount.toFixed(2) + ' (3% credito)'
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro ao processar divisao de vendas:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'SALES_DIVISION_FAILED',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Atualiza créditos do cliente
async function updateCustomerCredits(
  supabaseUrl: string,
  serviceRoleKey: string,
  customerId: string,
  creditAmount: number
) {
  // Buscar dados atuais do cliente
  const selectResponse = await fetch(
    `${supabaseUrl}/rest/v1/customer_cpf_data?customer_id=eq.${customerId}`,
    {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    }
  );

  if (!selectResponse.ok) {
    throw new Error('Erro ao buscar dados do cliente');
  }

  const customerData = await selectResponse.json();
  
  if (customerData.length === 0) {
    return; // Cliente não tem CPF cadastrado
  }

  const customer = customerData[0];
  const newBalance = (parseFloat(customer.credits_balance) || 0) + creditAmount;
  const newTotalEarned = (parseFloat(customer.total_credits_earned) || 0) + creditAmount;

  // Atualizar saldo
  const updateResponse = await fetch(
    `${supabaseUrl}/rest/v1/customer_cpf_data?customer_id=eq.${customerId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        credits_balance: newBalance,
        total_credits_earned: newTotalEarned,
        updated_at: new Date().toISOString()
      })
    }
  );

  if (!updateResponse.ok) {
    throw new Error('Erro ao atualizar creditos do cliente');
  }
}
