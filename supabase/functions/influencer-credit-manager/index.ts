Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT',
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

    const { action, ...params } = await req.json();

    let result;

    switch (action) {
      case 'add_credits':
        result = await addCredits(supabaseUrl, serviceRoleKey, params);
        break;
      case 'get_balance':
        result = await getBalance(supabaseUrl, serviceRoleKey, params);
        break;
      case 'list_influencers':
        result = await listInfluencers(supabaseUrl, serviceRoleKey, params);
        break;
      case 'debit_credits':
        result = await debitCredits(supabaseUrl, serviceRoleKey, params);
        break;
      default:
        throw new Error('Acao nao suportada');
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro no influencer-credit-manager:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'INFLUENCER_CREDIT_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Adicionar creditos para influencer
async function addCredits(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { influencerCpf, influencerName, credits, createdBy } = params;

  if (!influencerCpf || !credits) {
    throw new Error('Parametros obrigatorios: influencerCpf, credits');
  }

  // Validar CPF formato basico
  const cpfClean = influencerCpf.replace(/\D/g, '');
  if (cpfClean.length !== 11) {
    throw new Error('CPF invalido');
  }

  const creditsAmount = parseFloat(credits);
  if (creditsAmount <= 0) {
    throw new Error('Valor de creditos deve ser positivo');
  }

  // Verificar se influencer ja existe
  const checkResponse = await fetch(
    `${supabaseUrl}/rest/v1/influencer_credits?influencer_cpf=eq.${cpfClean}`,
    {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    }
  );

  if (!checkResponse.ok) {
    throw new Error('Erro ao verificar influencer existente');
  }

  const existing = await checkResponse.json();

  if (existing.length > 0) {
    // Atualizar creditos existentes
    const current = existing[0];
    const newTotal = parseFloat(current.total_credits) + creditsAmount;
    const newAvailable = parseFloat(current.available_credits) + creditsAmount;

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/influencer_credits?influencer_cpf=eq.${cpfClean}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          total_credits: newTotal,
          available_credits: newAvailable,
          influencer_name: influencerName || current.influencer_name,
          updated_at: new Date().toISOString()
        })
      }
    );

    if (!updateResponse.ok) {
      throw new Error('Erro ao atualizar creditos');
    }

    const result = await updateResponse.json();
    return {
      ...result[0],
      message: `Creditos adicionados. Total: R$ ${newTotal.toFixed(2)}`
    };
  } else {
    // Criar novo influencer
    const createResponse = await fetch(`${supabaseUrl}/rest/v1/influencer_credits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        influencer_cpf: cpfClean,
        influencer_name: influencerName || 'Influencer',
        total_credits: creditsAmount,
        used_credits: 0,
        available_credits: creditsAmount,
        created_by: createdBy || null
      })
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      throw new Error(`Erro ao criar influencer: ${errorText}`);
    }

    const result = await createResponse.json();
    return {
      ...result[0],
      message: `Influencer criado com R$ ${creditsAmount.toFixed(2)} em creditos`
    };
  }
}

// Consultar saldo
async function getBalance(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { influencerCpf } = params;

  if (!influencerCpf) {
    throw new Error('CPF do influencer e obrigatorio');
  }

  const cpfClean = influencerCpf.replace(/\D/g, '');

  const response = await fetch(
    `${supabaseUrl}/rest/v1/influencer_credits?influencer_cpf=eq.${cpfClean}`,
    {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao consultar saldo');
  }

  const result = await response.json();

  if (result.length === 0) {
    return {
      found: false,
      message: 'Influencer nao encontrado'
    };
  }

  return {
    found: true,
    ...result[0]
  };
}

// Listar todos os influencers
async function listInfluencers(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { limit, orderBy } = params;

  let url = `${supabaseUrl}/rest/v1/influencer_credits?order=${orderBy || 'created_at'}.desc`;
  
  if (limit) {
    url += `&limit=${limit}`;
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey
    }
  });

  if (!response.ok) {
    throw new Error('Erro ao listar influencers');
  }

  return await response.json();
}

// Debitar creditos (usado automaticamente ao aplicar cupom)
async function debitCredits(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { influencerCpf, amount } = params;

  if (!influencerCpf || !amount) {
    throw new Error('Parametros obrigatorios: influencerCpf, amount');
  }

  const cpfClean = influencerCpf.replace(/\D/g, '');
  const debitAmount = parseFloat(amount);

  if (debitAmount <= 0) {
    throw new Error('Valor de debito deve ser positivo');
  }

  // Buscar saldo atual
  const balanceResponse = await fetch(
    `${supabaseUrl}/rest/v1/influencer_credits?influencer_cpf=eq.${cpfClean}`,
    {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    }
  );

  if (!balanceResponse.ok) {
    throw new Error('Erro ao consultar saldo');
  }

  const credits = await balanceResponse.json();

  if (credits.length === 0) {
    throw new Error('Influencer nao encontrado');
  }

  const current = credits[0];
  const available = parseFloat(current.available_credits);

  if (available < debitAmount) {
    throw new Error(`Saldo insuficiente. Disponivel: R$ ${available.toFixed(2)}`);
  }

  // Atualizar creditos
  const newUsed = parseFloat(current.used_credits) + debitAmount;
  const newAvailable = available - debitAmount;

  const updateResponse = await fetch(
    `${supabaseUrl}/rest/v1/influencer_credits?influencer_cpf=eq.${cpfClean}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        used_credits: newUsed,
        available_credits: newAvailable,
        updated_at: new Date().toISOString()
      })
    }
  );

  if (!updateResponse.ok) {
    throw new Error('Erro ao debitar creditos');
  }

  const result = await updateResponse.json();
  return {
    ...result[0],
    message: `R$ ${debitAmount.toFixed(2)} debitado. Saldo: R$ ${newAvailable.toFixed(2)}`
  };
}
