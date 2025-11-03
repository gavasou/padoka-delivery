// Edge Function: Otimização de Rota de Entregas
// Calcula rota otimizada usando algoritmo Nearest Neighbor + otimização tempo/valor

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
            currentDelivery,
            availableDeliveries,
            deliveryPersonId,
            origin
        } = await req.json();

        // Validação de entrada
        if (!deliveryPersonId) {
            return new Response(
                JSON.stringify({ error: 'delivery_person_id é obrigatório' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Capacidade máxima de 8 entregas
        const MAX_CAPACITY = 8;
        const TIME_WEIGHT = 0.6;
        const VALUE_WEIGHT = 0.4;

        // Filtrar entregas válidas (com coordenadas e dentro dos horários permitidos)
        const validDeliveries = availableDeliveries.filter((delivery: any) => {
            return delivery.latitude && 
                   delivery.longitude && 
                   isValidTimeWindow(delivery);
        }).slice(0, MAX_CAPACITY);

        if (validDeliveries.length === 0) {
            return new Response(
                JSON.stringify({ 
                    data: {
                        route: [],
                        metrics: {
                            totalDistance: 0,
                            totalValue: 0,
                            totalTime: 0,
                            profitPerKm: 0,
                            efficiency: 0
                        },
                        justifications: ['Nenhuma entrega válida disponível']
                    }
                }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Ponto de origem (localização atual ou primeira entrega)
        const startPoint = origin || {
            latitude: currentDelivery?.latitude || validDeliveries[0].latitude,
            longitude: currentDelivery?.longitude || validDeliveries[0].longitude
        };

        // Aplicar algoritmo Nearest Neighbor
        const optimizedRoute = nearestNeighborAlgorithm(validDeliveries, startPoint);

        // Aplicar otimização por valor/tempo
        const finalRoute = optimizeByValueTime(optimizedRoute, TIME_WEIGHT, VALUE_WEIGHT);

        // Calcular métricas
        const metrics = calculateRouteMetrics(finalRoute, startPoint);

        // Gerar justificativas
        const justifications = generateJustifications(finalRoute, metrics);

        return new Response(
            JSON.stringify({ 
                data: {
                    route: finalRoute,
                    metrics,
                    justifications,
                    timestamp: new Date().toISOString()
                }
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Erro na otimização:', error);
        return new Response(
            JSON.stringify({ 
                error: {
                    code: 'OPTIMIZATION_ERROR',
                    message: error.message || 'Erro ao otimizar rota'
                }
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

// Verifica se horário está dentro das janelas válidas (6-10h, 15-18h)
function isValidTimeWindow(delivery: any): boolean {
    const now = new Date();
    const currentHour = now.getHours();
    
    // Janelas válidas: 6-10h e 15-18h
    const isInMorningWindow = currentHour >= 6 && currentHour < 10;
    const isInAfternoonWindow = currentHour >= 15 && currentHour < 18;
    
    return isInMorningWindow || isInAfternoonWindow;
}

// Calcula distância Haversine entre dois pontos
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

// Algoritmo Nearest Neighbor para ordenar entregas por proximidade
function nearestNeighborAlgorithm(deliveries: any[], origin: any): any[] {
    const unvisited = [...deliveries];
    const route: any[] = [];
    let currentPoint = origin;

    while (unvisited.length > 0) {
        let nearestIndex = 0;
        let nearestDistance = calculateDistance(currentPoint, unvisited[0]);

        for (let i = 1; i < unvisited.length; i++) {
            const distance = calculateDistance(currentPoint, unvisited[i]);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = i;
            }
        }

        const nearest = unvisited.splice(nearestIndex, 1)[0];
        route.push(nearest);
        currentPoint = nearest;
    }

    return route;
}

// Otimiza rota considerando valor e tempo
function optimizeByValueTime(route: any[], timeWeight: number, valueWeight: number): any[] {
    if (route.length <= 1) return route;

    const optimized = [...route];
    
    // Ordena por score combinado de tempo e valor
    optimized.sort((a, b) => {
        const timeScoreA = (1 / (a.estimated_duration || 15)) * timeWeight;
        const valueScoreA = (a.delivery_value || 0) * valueWeight;
        const totalScoreA = timeScoreA + valueScoreA;

        const timeScoreB = (1 / (b.estimated_duration || 15)) * timeWeight;
        const valueScoreB = (b.delivery_value || 0) * valueWeight;
        const totalScoreB = timeScoreB + valueScoreB;

        return totalScoreB - totalScoreA;
    });

    return optimized;
}

// Calcula métricas da rota
function calculateRouteMetrics(route: any[], origin: any): any {
    let totalDistance = 0;
    let totalTime = 0;
    let totalValue = 0;
    let currentPoint = origin;

    // Calcula distância total
    for (const delivery of route) {
        const distance = calculateDistance(currentPoint, delivery);
        totalDistance += distance;
        currentPoint = delivery;
    }

    // Calcula tempo e valor total
    for (const delivery of route) {
        totalTime += delivery.estimated_duration || 15;
        totalValue += delivery.delivery_value || 0;
    }

    const profitPerKm = totalDistance > 0 ? totalValue / totalDistance : 0;
    
    // Calcula eficiência (combinação otimizada)
    const avgTimePerDelivery = totalTime / (route.length || 1);
    const avgValuePerDelivery = totalValue / (route.length || 1);
    const efficiency = (0.6 * (1 / (avgTimePerDelivery || 1))) + (0.4 * avgValuePerDelivery);

    return {
        totalDistance: Math.round(totalDistance * 100) / 100,
        totalTime: Math.round(totalTime),
        totalValue: Math.round(totalValue * 100) / 100,
        profitPerKm: Math.round(profitPerKm * 100) / 100,
        efficiency: Math.round(efficiency * 100) / 100,
        deliveryCount: route.length
    };
}

// Gera justificativas para a rota otimizada
function generateJustifications(route: any[], metrics: any): string[] {
    const justifications: string[] = [];

    justifications.push(
        `Rota otimizada com ${route.length} entrega(s) no total`
    );

    justifications.push(
        `Distancia total: ${metrics.totalDistance} km`
    );

    justifications.push(
        `Valor total: R$ ${metrics.totalValue.toFixed(2)}`
    );

    justifications.push(
        `Tempo estimado: ${metrics.totalTime} minutos`
    );

    justifications.push(
        `Lucro por km: R$ ${metrics.profitPerKm.toFixed(2)}/km`
    );

    if (metrics.profitPerKm > 10) {
        justifications.push('Excelente taxa de lucro por distancia!');
    }

    if (route.length >= 5) {
        justifications.push('Rota de alta densidade - maximize seus ganhos!');
    }

    return justifications;
}
