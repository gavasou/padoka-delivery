Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'false'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const origin = req.headers.get('origin') || req.headers.get('referer');
    const { planType, customerEmail, paymentMethod = 'pix', totalAmount } = await req.json();
    
    if (!planType || !customerEmail || !totalAmount) {
      throw new Error('Missing required params');
    }

    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    
    if (!stripeSecretKey || !serviceRoleKey || !supabaseUrl) {
      throw new Error('Missing env config');
    }

    // Obter userId
    let userId = null;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (token) {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { 'Authorization': `Bearer ${token}`, 'apikey': serviceRoleKey }
      });
      if (userRes.ok) userId = (await userRes.json()).id;
    }

    // Buscar ou criar customer no Stripe
    let customerId = null;
    const customerRes = await fetch(`https://api.stripe.com/v1/customers/search?query=metadata['user_id']:'${userId}'&limit=1`, {
      headers: { 'Authorization': `Bearer ${stripeSecretKey}` }
    });
    const customerData = await customerRes.json();
    
    if (customerData.data?.length) {
      customerId = customerData.data[0].id;
    } else {
      const params = new URLSearchParams({ 
        email: customerEmail, 
        'metadata[user_id]': userId || '', 
        'metadata[plan_type]': planType 
      });
      const createRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      customerId = (await createRes.json()).id;
    }

    // Configurar métodos de pagamento baseado no tipo
    const paymentMethodTypes = [];
    if (paymentMethod === 'pix') {
      paymentMethodTypes.push('pix');
    } else if (paymentMethod === 'boleto') {
      paymentMethodTypes.push('boleto');
    } else if (paymentMethod === 'card') {
      paymentMethodTypes.push('card');
    } else {
      // Padrão: todos os métodos brasileiros
      paymentMethodTypes.push('card', 'boleto', 'pix');
    }

    // Criar checkout session para pagamento único
    const checkoutParams = new URLSearchParams({
      customer: customerId,
      mode: 'payment',
      'line_items[0][price_data][currency]': 'brl',
      'line_items[0][price_data][product_data][name]': `Padoka - ${planType}`,
      'line_items[0][price_data][unit_amount]': Math.round(totalAmount * 100).toString(), // Converter para centavos
      'line_items[0][quantity]': '1',
      success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/payment?payment=cancelled`,
      'metadata[user_id]': userId || '',
      'metadata[plan_type]': planType,
      'metadata[payment_type]': 'one_time'
    });

    // Adicionar métodos de pagamento
    paymentMethodTypes.forEach((type, index) => {
      checkoutParams.append(`payment_method_types[${index}]`, type);
    });

    const checkoutRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${stripeSecretKey}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: checkoutParams.toString()
    });
    
    const checkoutSession = await checkoutRes.json();

    if (checkoutRes.ok) {
      return new Response(JSON.stringify({
        data: {
          checkoutSessionId: checkoutSession.id,
          checkoutUrl: checkoutSession.url,
          customerId,
          planType,
          paymentMethod,
          totalAmount
        }
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    } else {
      throw new Error(`Stripe checkout error: ${JSON.stringify(checkoutSession)}`);
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    return new Response(JSON.stringify({ 
      error: { 
        message: error.message,
        type: 'payment_creation_error'
      } 
    }), {
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});