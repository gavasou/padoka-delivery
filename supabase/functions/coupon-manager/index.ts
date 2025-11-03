Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
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
      case 'create':
        result = await createCoupon(supabaseUrl, serviceRoleKey, params);
        break;
      case 'validate':
        result = await validateCoupon(supabaseUrl, serviceRoleKey, params);
        break;
      case 'apply':
        result = await applyCoupon(supabaseUrl, serviceRoleKey, params);
        break;
      case 'list':
        result = await listCoupons(supabaseUrl, serviceRoleKey, params);
        break;
      case 'update':
        result = await updateCoupon(supabaseUrl, serviceRoleKey, params);
        break;
      case 'usage_history':
        result = await getUsageHistory(supabaseUrl, serviceRoleKey, params);
        break;
      default:
        throw new Error('Acao nao suportada');
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro no coupon-manager:', error);
    
    return new Response(JSON.stringify({
      error: {
        code: 'COUPON_MANAGER_ERROR',
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Criar cupom
async function createCoupon(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const {
    name,
    code,
    type,
    value,
    minAmount,
    maxUses,
    validUntil,
    targetCpf,
    createdBy
  } = params;

  // Validacoes
  if (!name || !code || !type || !value || !validUntil) {
    throw new Error('Campos obrigatorios: name, code, type, value, validUntil');
  }

  if (!['fixed_value', 'percentage', 'influencer_credit'].includes(type)) {
    throw new Error('Tipo invalido. Use: fixed_value, percentage, influencer_credit');
  }

  if (type === 'percentage' && (value < 0 || value > 100)) {
    throw new Error('Percentual deve estar entre 0 e 100');
  }

  const couponData = {
    name,
    code: code.toUpperCase(),
    type,
    value: parseFloat(value),
    min_amount: minAmount ? parseFloat(minAmount) : 0,
    max_uses: maxUses || null,
    valid_until: validUntil,
    target_cpf: targetCpf || null,
    created_by: createdBy || null,
    is_active: true
  };

  const response = await fetch(`${supabaseUrl}/rest/v1/discount_coupons`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(couponData)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao criar cupom: ${errorText}`);
  }

  const result = await response.json();
  return result[0];
}

// Validar cupom
async function validateCoupon(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { code, customerCpf, orderAmount } = params;

  if (!code) {
    throw new Error('Codigo do cupom e obrigatorio');
  }

  // Buscar cupom
  const couponResponse = await fetch(
    `${supabaseUrl}/rest/v1/discount_coupons?code=eq.${code.toUpperCase()}&is_active=eq.true`,
    {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    }
  );

  if (!couponResponse.ok) {
    throw new Error('Erro ao buscar cupom');
  }

  const coupons = await couponResponse.json();

  if (coupons.length === 0) {
    return { valid: false, message: 'Cupom nao encontrado ou inativo' };
  }

  const coupon = coupons[0];

  // Verificar validade
  const now = new Date();
  const validUntil = new Date(coupon.valid_until);
  
  if (validUntil < now) {
    return { valid: false, message: 'Cupom expirado' };
  }

  // Verificar numero de usos
  if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
    return { valid: false, message: 'Cupom atingiu limite de uso' };
  }

  // Verificar CPF especifico
  if (coupon.target_cpf && coupon.target_cpf !== customerCpf) {
    return { valid: false, message: 'Cupom nao disponivel para este CPF' };
  }

  // Verificar valor minimo
  if (orderAmount && parseFloat(orderAmount) < parseFloat(coupon.min_amount)) {
    return { 
      valid: false, 
      message: `Valor minimo da compra: R$ ${parseFloat(coupon.min_amount).toFixed(2)}` 
    };
  }

  // Calcular desconto
  let discountAmount = 0;
  if (coupon.type === 'fixed_value') {
    discountAmount = parseFloat(coupon.value);
  } else if (coupon.type === 'percentage') {
    discountAmount = (parseFloat(orderAmount) * parseFloat(coupon.value)) / 100;
  } else if (coupon.type === 'influencer_credit') {
    // Para credito influencer, verificar saldo disponivel
    const creditResponse = await fetch(
      `${supabaseUrl}/rest/v1/influencer_credits?influencer_cpf=eq.${customerCpf}`,
      {
        headers: {
          'Authorization': `Bearer ${serviceRoleKey}`,
          'apikey': serviceRoleKey
        }
      }
    );

    if (creditResponse.ok) {
      const credits = await creditResponse.json();
      if (credits.length > 0) {
        const availableCredit = parseFloat(credits[0].available_credits);
        discountAmount = Math.min(parseFloat(coupon.value), availableCredit, parseFloat(orderAmount));
      }
    }
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      type: coupon.type,
      discountAmount: discountAmount.toFixed(2)
    },
    message: 'Cupom valido'
  };
}

// Aplicar cupom (registrar uso)
async function applyCoupon(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { couponId, customerCpf, orderId, discountAmount } = params;

  if (!couponId || !customerCpf || !discountAmount) {
    throw new Error('Parametros obrigatorios: couponId, customerCpf, discountAmount');
  }

  // Registrar uso
  const usageData = {
    coupon_id: couponId,
    customer_cpf: customerCpf,
    order_id: orderId || null,
    discount_amount: parseFloat(discountAmount)
  };

  const usageResponse = await fetch(`${supabaseUrl}/rest/v1/coupon_usage`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(usageData)
  });

  if (!usageResponse.ok) {
    throw new Error('Erro ao registrar uso do cupom');
  }

  // Incrementar contador de uso
  const updateResponse = await fetch(
    `${supabaseUrl}/rest/v1/discount_coupons?id=eq.${couponId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        current_uses: `current_uses + 1`
      })
    }
  );

  // Atualizar creditos do influencer se for tipo influencer_credit
  const couponResponse = await fetch(
    `${supabaseUrl}/rest/v1/discount_coupons?id=eq.${couponId}`,
    {
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey
      }
    }
  );

  if (couponResponse.ok) {
    const coupons = await couponResponse.json();
    if (coupons.length > 0 && coupons[0].type === 'influencer_credit') {
      await fetch(
        `${supabaseUrl}/rest/v1/influencer_credits?influencer_cpf=eq.${customerCpf}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            used_credits: `used_credits + ${parseFloat(discountAmount)}`,
            updated_at: new Date().toISOString()
          })
        }
      );
    }
  }

  const usage = await usageResponse.json();
  return usage[0];
}

// Listar cupons
async function listCoupons(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { type, isActive, limit } = params;

  let url = `${supabaseUrl}/rest/v1/discount_coupons?order=created_at.desc`;
  
  if (type) {
    url += `&type=eq.${type}`;
  }
  
  if (isActive !== undefined) {
    url += `&is_active=eq.${isActive}`;
  }

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
    throw new Error('Erro ao listar cupons');
  }

  return await response.json();
}

// Atualizar cupom
async function updateCoupon(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { couponId, ...updateData } = params;

  if (!couponId) {
    throw new Error('ID do cupom e obrigatorio');
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/discount_coupons?id=eq.${couponId}`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        ...updateData,
        updated_at: new Date().toISOString()
      })
    }
  );

  if (!response.ok) {
    throw new Error('Erro ao atualizar cupom');
  }

  const result = await response.json();
  return result[0];
}

// Historico de uso
async function getUsageHistory(supabaseUrl: string, serviceRoleKey: string, params: any) {
  const { couponId, customerCpf, limit } = params;

  let url = `${supabaseUrl}/rest/v1/coupon_usage?order=used_at.desc`;
  
  if (couponId) {
    url += `&coupon_id=eq.${couponId}`;
  }
  
  if (customerCpf) {
    url += `&customer_cpf=eq.${customerCpf}`;
  }

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
    throw new Error('Erro ao buscar historico de uso');
  }

  return await response.json();
}
