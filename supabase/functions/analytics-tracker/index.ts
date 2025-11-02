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
    const { action, userId, eventData } = requestData;

    if (action === 'track') {
      // Extrair informações da requisição
      const clientIP = req.headers.get('cf-connecting-ip') || 
                      req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
      
      const userAgent = req.headers.get('user-agent') || '';
      
      const { eventName, properties, sessionId } = eventData;

      // Validar dados obrigatórios
      if (!eventName) {
        throw new Error('Nome do evento é obrigatório');
      }

      // Salvar evento no analytics
      const { data, error } = await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_name: eventName,
          event_data: properties || {},
          session_id: sessionId,
          ip_address: clientIP,
          user_agent: userAgent
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao salvar evento: ${error.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Evento registrado com sucesso',
        eventId: data.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_metrics') {
      const { timeRange, userId: filterUserId, eventNames } = eventData;

      // Calcular período de tempo
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '24h':
          startDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 7); // Default 7 dias
      }

      // Query base
      let query = supabase
        .from('analytics_events')
        .select('*')
        .gte('created_at', startDate.toISOString());

      // Filtros opcionais
      if (filterUserId) {
        query = query.eq('user_id', filterUserId);
      }

      if (eventNames && eventNames.length > 0) {
        query = query.in('event_name', eventNames);
      }

      const { data: events, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar métricas: ${error.message}`);
      }

      // Processar métricas
      const metrics = {
        totalEvents: events.length,
        uniqueUsers: new Set(events.map(e => e.user_id).filter(Boolean)).size,
        uniqueSessions: new Set(events.map(e => e.session_id).filter(Boolean)).size,
        topEvents: {},
        eventsByDay: {},
        userActivity: {}
      };

      // Contar eventos por tipo
      events.forEach(event => {
        const eventName = event.event_name;
        const eventDate = new Date(event.created_at).toDateString();
        const userId = event.user_id;

        // Top eventos
        metrics.topEvents[eventName] = (metrics.topEvents[eventName] || 0) + 1;

        // Eventos por dia
        metrics.eventsByDay[eventDate] = (metrics.eventsByDay[eventDate] || 0) + 1;

        // Atividade por usuário
        if (userId) {
          if (!metrics.userActivity[userId]) {
            metrics.userActivity[userId] = { events: 0, lastActivity: event.created_at };
          }
          metrics.userActivity[userId].events++;
          if (new Date(event.created_at) > new Date(metrics.userActivity[userId].lastActivity)) {
            metrics.userActivity[userId].lastActivity = event.created_at;
          }
        }
      });

      // Converter top events em array ordenado
      metrics.topEvents = Object.entries(metrics.topEvents)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ eventName: name, count }));

      return new Response(JSON.stringify({ 
        success: true, 
        metrics,
        timeRange,
        period: {
          start: startDate.toISOString(),
          end: now.toISOString()
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_user_journey') {
      const { userId: targetUserId, limit = 50 } = eventData;

      if (!targetUserId) {
        throw new Error('userId é obrigatório para buscar jornada do usuário');
      }

      const { data: userEvents, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        throw new Error(`Erro ao buscar jornada do usuário: ${error.message}`);
      }

      // Processar jornada do usuário
      const journey = {
        totalEvents: userEvents.length,
        firstActivity: userEvents[0]?.created_at,
        lastActivity: userEvents[userEvents.length - 1]?.created_at,
        sessions: {},
        eventFlow: userEvents.map(event => ({
          eventName: event.event_name,
          timestamp: event.created_at,
          sessionId: event.session_id,
          data: event.event_data
        }))
      };

      // Agrupar por sessão
      userEvents.forEach(event => {
        const sessionId = event.session_id || 'unknown';
        if (!journey.sessions[sessionId]) {
          journey.sessions[sessionId] = {
            events: [],
            startTime: event.created_at,
            endTime: event.created_at
          };
        }
        journey.sessions[sessionId].events.push(event);
        journey.sessions[sessionId].endTime = event.created_at;
      });

      return new Response(JSON.stringify({ 
        success: true, 
        journey,
        userId: targetUserId
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
    console.error('Erro na edge function analytics-tracker:', error);
    
    const errorResponse = {
      error: {
        code: 'ANALYTICS_TRACKER_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});