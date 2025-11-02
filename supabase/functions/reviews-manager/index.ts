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
    const { action, userId, reviewData } = requestData;

    if (action === 'create_review') {
      const { bakeryId, productId, rating, comment } = reviewData;

      // Validações
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating deve estar entre 1 e 5');
      }

      if (!bakeryId) {
        throw new Error('bakeryId é obrigatório');
      }

      // Verificar se o usuário já avaliou esta padaria/produto
      let existingQuery = supabase
        .from('reviews')
        .select('id')
        .eq('user_id', userId)
        .eq('bakery_id', bakeryId);

      if (productId) {
        existingQuery = existingQuery.eq('product_id', productId);
      } else {
        existingQuery = existingQuery.is('product_id', null);
      }

      const { data: existing } = await existingQuery.single();

      if (existing) {
        throw new Error('Você já avaliou este item');
      }

      // Criar review
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          user_id: userId,
          bakery_id: bakeryId,
          product_id: productId || null,
          rating: rating,
          comment: comment || null
        })
        .select(`
          *,
          bakeries(name),
          users_profile(full_name)
        `)
        .single();

      if (error) {
        throw new Error(`Erro ao criar avaliação: ${error.message}`);
      }

      // Registrar evento de analytics
      await supabase
        .from('analytics_events')
        .insert({
          user_id: userId,
          event_name: 'review_created',
          event_data: {
            bakeryId,
            productId,
            rating,
            hasComment: !!comment
          }
        });

      // Criar notificação para a padaria
      await supabase
        .from('notifications')
        .insert({
          user_id: bakeryId, // Assumindo que bakeryId é o user_id da padaria
          title: 'Nova avaliação recebida',
          message: `Você recebeu uma nova avaliação de ${rating} estrelas`,
          type: 'review_received',
          data: { reviewId: data.id, rating }
        });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Avaliação criada com sucesso',
        review: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_reviews') {
      const { bakeryId, productId, limit = 20, offset = 0 } = reviewData;

      let query = supabase
        .from('reviews')
        .select(`
          *,
          users_profile(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (bakeryId) {
        query = query.eq('bakery_id', bakeryId);
      }

      if (productId) {
        query = query.eq('product_id', productId);
      }

      const { data: reviews, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar avaliações: ${error.message}`);
      }

      // Calcular estatísticas
      const stats = {
        totalReviews: reviews.length,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        stats.averageRating = Number((totalRating / reviews.length).toFixed(1));

        reviews.forEach(review => {
          stats.ratingDistribution[review.rating]++;
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        reviews,
        stats,
        pagination: {
          limit,
          offset,
          hasMore: reviews.length === limit
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'get_bakery_stats') {
      const { bakeryId } = reviewData;

      if (!bakeryId) {
        throw new Error('bakeryId é obrigatório');
      }

      // Buscar todas as reviews da padaria
      const { data: allReviews, error } = await supabase
        .from('reviews')
        .select('rating, created_at')
        .eq('bakery_id', bakeryId);

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const stats = {
        totalReviews: allReviews.length,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reviewsByMonth: {},
        recentTrend: 'stable' // up, down, stable
      };

      if (allReviews.length > 0) {
        // Calcular média
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        stats.averageRating = Number((totalRating / allReviews.length).toFixed(1));

        // Distribuição de ratings
        allReviews.forEach(review => {
          stats.ratingDistribution[review.rating]++;
          
          // Agrupar por mês
          const month = new Date(review.created_at).toISOString().slice(0, 7); // YYYY-MM
          stats.reviewsByMonth[month] = (stats.reviewsByMonth[month] || 0) + 1;
        });

        // Calcular tendência (últimos 30 dias vs 30 dias anteriores)
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

        const recentReviews = allReviews.filter(r => new Date(r.created_at) >= thirtyDaysAgo);
        const previousReviews = allReviews.filter(r => {
          const date = new Date(r.created_at);
          return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });

        const recentAvg = recentReviews.length > 0 ? 
          recentReviews.reduce((sum, r) => sum + r.rating, 0) / recentReviews.length : 0;
        const previousAvg = previousReviews.length > 0 ? 
          previousReviews.reduce((sum, r) => sum + r.rating, 0) / previousReviews.length : 0;

        if (recentAvg > previousAvg + 0.2) {
          stats.recentTrend = 'up';
        } else if (recentAvg < previousAvg - 0.2) {
          stats.recentTrend = 'down';
        }
      }

      return new Response(JSON.stringify({ 
        success: true, 
        stats,
        bakeryId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'update_review') {
      const { reviewId, rating, comment } = reviewData;

      if (!reviewId) {
        throw new Error('reviewId é obrigatório');
      }

      const updateData = {};
      if (rating !== undefined) {
        if (rating < 1 || rating > 5) {
          throw new Error('Rating deve estar entre 1 e 5');
        }
        updateData.rating = rating;
      }
      if (comment !== undefined) {
        updateData.comment = comment;
      }
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('reviews')
        .update(updateData)
        .eq('id', reviewId)
        .eq('user_id', userId) // Só pode atualizar própria review
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar avaliação: ${error.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Avaliação atualizada com sucesso',
        review: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'delete_review') {
      const { reviewId } = reviewData;

      if (!reviewId) {
        throw new Error('reviewId é obrigatório');
      }

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId); // Só pode deletar própria review

      if (error) {
        throw new Error(`Erro ao deletar avaliação: ${error.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Avaliação deletada com sucesso'
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
    console.error('Erro na edge function reviews-manager:', error);
    
    const errorResponse = {
      error: {
        code: 'REVIEWS_MANAGER_ERROR',
        message: error.message
      }
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});