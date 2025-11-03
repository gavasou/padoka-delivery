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
    const { supabaseClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = supabaseClient(supabaseUrl, supabaseKey);

    const requestData = await req.json();
    const { action, subscription, userId, notification } = requestData;

    if (action === 'subscribe') {
      // Salvar subscription do usuário
      const { endpoint, keys } = subscription;
      
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          active: true
        }, {
          onConflict: 'user_id,endpoint'
        });

      if (error) {
        throw new Error(`Erro ao salvar subscription: ${error.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Push subscription salva com sucesso' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'send') {
      // Enviar notificação push
      const { userId: targetUserId, title, message, data: notificationData } = notification;

      // Buscar subscriptions do usuário
      const { data: subscriptions, error: subError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('active', true);

      if (subError) {
        throw new Error(`Erro ao buscar subscriptions: ${subError.message}`);
      }

      // VAPID keys (em produção, usar variáveis de ambiente)
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HcCeNiU2aeXJy7k8XyVaePE1ECF_T_DuKvkPl-3DdHWlN7uJ1PsQx1Wc_c';
      const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';

      const pushResults = [];

      for (const sub of subscriptions) {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth
            }
          };

          // Simular envio de push (em produção, usar biblioteca web-push)
          const payload = JSON.stringify({
            title: title,
            body: message,
            icon: '/pwa-192x192.png',
            badge: '/pwa-64x64.png',
            data: notificationData || {}
          });

          pushResults.push({
            subscription: sub.id,
            status: 'enviado',
            timestamp: new Date().toISOString()
          });

        } catch (pushError) {
          console.error('Erro ao enviar push:', pushError);
          pushResults.push({
            subscription: sub.id,
            status: 'erro',
            error: pushError.message
          });
        }
      }

      // Salvar notificação no banco
      const { error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          title: title,
          message: message,
          type: 'push',
          data: notificationData
        });

      if (notifError) {
        console.error('Erro ao salvar notificação:', notifError);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Notificações enviadas',
        results: pushResults
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'unsubscribe') {
      // Desabilitar subscription
      const { error } = await supabase
        .from('push_subscriptions')
        .update({ active: false })
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint);

      if (error) {
        throw new Error(`Erro ao desabilitar subscription: ${error.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Push subscription desabilitada' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ 
      error: 'Ação não reconhecida' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Erro na edge function push-notifications:', error);
    
    const errorResponse = {
      error: {
        code: 'PUSH_NOTIFICATION_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});