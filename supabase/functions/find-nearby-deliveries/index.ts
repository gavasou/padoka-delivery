// Edge Function: Encontrar Entregas Próximas
// Busca entregas disponíveis próximas à rota atual do entregador

Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { 
            deliveryPersonId,
            currentLocation,
            currentRoute,
            maxRadius = 5 // km
        } = await req.json();

        // Validação
        if (!deliveryPersonId || !currentLocation) {
            return new Response(
                JSON.stringify({ 
                    error: 'delivery_person_id e current_location são obrigatórios' 
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        // Buscar entregas disponíveis no banco
        const deliveriesResponse = await fetch(
            `${supabaseUrl}/rest/v1/deliveries?select=*&status=eq.Pendente&delivery_person_id=is.null`,
            {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!deliveriesResponse.ok) {
            throw new Error('Falha ao buscar entregas disponíveis');
        }

        const availableDeliveries = await deliveriesResponse.json();

        // Filtrar entregas próximas
        const nearbyDeliveries = availableDeliveries
            .filter((delivery: any) => delivery.latitude && delivery.longitude)
            .map((delivery: any) => {
                const distance = calculateDistance(
                    currentLocation,
                    { latitude: delivery.latitude, longitude: delivery.longitude }
                );

                return {
                    ...delivery,
                    distance: Math.round(distance * 100) / 100,
                    additionalValue: delivery.delivery_value || 0,
                    estimatedTime: delivery.estimated_duration || 15
                };
            })
            .filter((delivery: any) => delivery.distance <= maxRadius)
            .filter((delivery: any) => isInValidTimeWindow())
            .sort((a: any, b: any) => a.distance - b.distance);

        // Calcular métricas de oportunidade
        const opportunities = nearbyDeliveries.map((delivery: any) => {
            const valuePerKm = delivery.distance > 0 ? 
                delivery.additionalValue / delivery.distance : 0;

            return {
                delivery,
                metrics: {
                    distance: delivery.distance,
                    additionalValue: delivery.additionalValue,
                    estimatedTime: delivery.estimatedTime,
                    valuePerKm: Math.round(valuePerKm * 100) / 100,
                    priority: delivery.priority_level || 3
                },
                justification: generateOpportunityJustification(delivery, valuePerKm)
            };
        });

        // Ordenar por melhor oportunidade (valor/km + prioridade)
        opportunities.sort((a, b) => {
            const scoreA = a.metrics.valuePerKm + (a.metrics.priority * 2);
            const scoreB = b.metrics.valuePerKm + (b.metrics.priority * 2);
            return scoreB - scoreA;
        });

        // Limitar a 10 melhores oportunidades
        const topOpportunities = opportunities.slice(0, 10);

        // Se houver boas oportunidades, criar notificação
        if (topOpportunities.length > 0 && topOpportunities[0].metrics.valuePerKm > 5) {
            await createRouteOpportunity(
                deliveryPersonId,
                topOpportunities,
                supabaseUrl,
                supabaseKey
            );
        }

        return new Response(
            JSON.stringify({ 
                data: {
                    opportunities: topOpportunities,
                    count: topOpportunities.length,
                    timestamp: new Date().toISOString()
                }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Erro ao buscar entregas próximas:', error);
        return new Response(
            JSON.stringify({ 
                error: {
                    code: 'NEARBY_SEARCH_ERROR',
                    message: error.message || 'Erro ao buscar entregas próximas'
                }
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

// Calcula distância Haversine
function calculateDistance(coord1: any, coord2: any): number {
    const R = 6371; // Raio da Terra em km
    const lat1 = coord1.latitude * Math.PI / 180;
    const lat2 = coord2.latitude * Math.PI / 180;
    const dLat = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const dLon = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Verifica se está em horário válido (6-10h ou 15-18h)
function isInValidTimeWindow(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return (hour >= 6 && hour < 10) || (hour >= 15 && hour < 18);
}

// Gera justificativa para oportunidade
function generateOpportunityJustification(delivery: any, valuePerKm: number): string {
    const justifications: string[] = [];

    if (delivery.distance < 2) {
        justifications.push('Muito proxima - desvio minimo!');
    } else if (delivery.distance < 5) {
        justifications.push('Proximidade razoavel');
    }

    if (valuePerKm > 10) {
        justifications.push('Excelente retorno financeiro!');
    } else if (valuePerKm > 5) {
        justifications.push('Bom valor por distancia');
    }

    if (delivery.priority_level >= 4) {
        justifications.push('Alta prioridade');
    }

    if (delivery.estimatedTime <= 10) {
        justifications.push('Entrega rapida');
    }

    return justifications.join(' | ') || 'Oportunidade disponivel';
}

// Cria registro de oportunidade no banco
async function createRouteOpportunity(
    deliveryPersonId: string,
    opportunities: any[],
    supabaseUrl: string,
    supabaseKey: string
) {
    try {
        const topDelivery = opportunities[0].delivery;
        const topMetrics = opportunities[0].metrics;

        const opportunityData = {
            delivery_person_id: deliveryPersonId,
            suggested_delivery_ids: [topDelivery.id],
            additional_distance: topMetrics.distance,
            additional_value: topMetrics.additionalValue,
            additional_time: topMetrics.estimatedTime,
            justification: opportunities[0].justification,
            status: 'pendente'
        };

        const response = await fetch(
            `${supabaseUrl}/rest/v1/route_opportunities`,
            {
                method: 'POST',
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(opportunityData)
            }
        );

        if (!response.ok) {
            console.error('Falha ao criar oportunidade:', await response.text());
        }

    } catch (error) {
        console.error('Erro ao criar oportunidade:', error);
    }
}
