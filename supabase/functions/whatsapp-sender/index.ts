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
    const { userId, phoneNumber, templateName, messageData, messageType } = requestData;

    // WhatsApp Business API Configuration
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || '';
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || '';
    const whatsappApiUrl = `https://graph.facebook.com/v18.0/${whatsappPhoneId}/messages`;

    // Templates de mensagens predefinidos
    const messageTemplates = {
      order_confirmation: {
        template: 'order_confirmation_approved',
        language: 'pt_BR',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: messageData.customerName || 'Cliente' },
              { type: 'text', text: messageData.orderNumber || 'N/A' },
              { type: 'text', text: messageData.totalAmount || 'R$ 0,00' }
            ]
          }
        ]
      },
      delivery_update: {
        template: 'delivery_status_update',
        language: 'pt_BR',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: messageData.customerName || 'Cliente' },
              { type: 'text', text: messageData.status || 'Em andamento' },
              { type: 'text', text: messageData.estimatedTime || '30 minutos' }
            ]
          }
        ]
      },
      promotional: {
        template: 'promotion_announcement',
        language: 'pt_BR',
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: messageData.customerName || 'Cliente' },
              { type: 'text', text: messageData.promotionTitle || 'Promoção' },
              { type: 'text', text: messageData.discount || '10%' }
            ]
          }
        ]
      }
    };

    // Preparar payload da mensagem
    const template = messageTemplates[templateName];
    if (!template) {
      throw new Error(`Template ${templateName} não encontrado`);
    }

    const messagePayload = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: template.template,
        language: {
          code: template.language
        },
        components: template.components
      }
    };

    // Log da tentativa de envio
    const logEntry = {
      user_id: userId,
      phone_number: phoneNumber,
      template_name: templateName,
      message_content: JSON.stringify(messagePayload),
      status: 'pending'
    };

    const { data: logData, error: logError } = await supabase
      .from('whatsapp_messages')
      .insert(logEntry)
      .select()
      .single();

    if (logError) {
      throw new Error(`Erro ao criar log: ${logError.message}`);
    }

    let whatsappResponse;
    let finalStatus = 'sent';
    let errorMessage = null;

    try {
      // Enviar mensagem via WhatsApp Business API
      whatsappResponse = await fetch(whatsappApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      });

      const responseData = await whatsappResponse.json();

      if (!whatsappResponse.ok) {
        finalStatus = 'failed';
        errorMessage = responseData.error?.message || 'Erro desconhecido da API WhatsApp';
        throw new Error(errorMessage);
      }

      // Atualizar log com sucesso
      await supabase
        .from('whatsapp_messages')
        .update({
          status: finalStatus,
          sent_at: new Date().toISOString()
        })
        .eq('id', logData.id);

      // Criar notificação interna de sucesso
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Mensagem WhatsApp enviada',
          message: `Mensagem ${templateName} enviada para ${phoneNumber}`,
          type: 'whatsapp_success'
        });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Mensagem WhatsApp enviada com sucesso',
        messageId: responseData.messages?.[0]?.id,
        logId: logData.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (whatsappError) {
      // Atualizar log com erro
      await supabase
        .from('whatsapp_messages')
        .update({
          status: 'failed',
          error_message: whatsappError.message
        })
        .eq('id', logData.id);

      // Criar notificação interna de erro
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'Erro ao enviar WhatsApp',
          message: `Falha ao enviar ${templateName}: ${whatsappError.message}`,
          type: 'whatsapp_error'
        });

      throw whatsappError;
    }

  } catch (error) {
    console.error('Erro na edge function whatsapp-sender:', error);
    
    const errorResponse = {
      error: {
        code: 'WHATSAPP_SENDER_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});