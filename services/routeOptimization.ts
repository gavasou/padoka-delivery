export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Delivery {
  id: string;
  address: string;
  coordinates: Coordinates;
  value: number;
  timeWindow: {
    start: number; // hora em formato 24h (ex: 6 para 6h)
    end: number;   // hora em formato 24h (ex: 10 para 10h)
  };
  deliveryTime: number; // tempo estimado para entrega em minutos
}

export interface RouteMetrics {
  totalDistance: number; // em km
  totalTime: number; // em minutos
  totalValue: number;
  profitPerKm: number;
  efficiency: number; // combinação otimizada de tempo e valor
  deliveries: Delivery[];
}

export interface OptimizationParams {
  timeWeight: number; // 0.6 (60%)
  valueWeight: number; // 0.4 (40%)
  maxCapacity: number; // 8 entregas
  validTimeWindows: Array<{ start: number; end: number }>;
}

/**
 * Calcula a distância entre dois pontos usando a fórmula de Haversine
 * @param coord1 Primeiro ponto
 * @param coord2 Segundo ponto
 * @returns Distância em km
 */
export function calculateHaversineDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371; // Raio da Terra em km
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * 
    Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Encontra entregas próximas a um ponto específico
 * @param deliveries Lista de entregas disponíveis
 * @param origin Ponto de origem
 * @param maxDistance Distância máxima em km (padrão 10km)
 * @returns Lista de entregas próximas ordenadas por distância
 */
export function findNearbyDeliveries(
  deliveries: Delivery[],
  origin: Coordinates,
  maxDistance: number = 10
): Delivery[] {
  const deliveriesWithDistance = deliveries.map(delivery => ({
    ...delivery,
    distance: calculateHaversineDistance(origin, delivery.coordinates)
  }));

  return deliveriesWithDistance
    .filter(delivery => delivery.distance <= maxDistance)
    .filter(delivery => isValidTimeWindow(delivery.timeWindow))
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Verifica se um horário está dentro das janelas válidas
 * @param timeWindow Janela de horário da entrega
 * @returns true se o horário é válido
 */
function isValidTimeWindow(timeWindow: { start: number; end: number }): boolean {
  const { start, end } = timeWindow;
  
  // Verifica janelas válidas: 6-10h e 15-18h
  const validWindows = [
    { start: 6, end: 10 },
    { start: 15, end: 18 }
  ];

  return validWindows.some(window => 
    start >= window.start && end <= window.end
  );
}

/**
 * Algoritmo Nearest Neighbor para ordenar entregas
 * @param deliveries Lista de entregas
 * @param origin Ponto de partida
 * @returns Entregas ordenadas por proximidade
 */
function nearestNeighbor(deliveries: Delivery[], origin: Coordinates): Delivery[] {
  const unvisited = [...deliveries];
  const route: Delivery[] = [];
  let currentPoint = origin;

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = calculateHaversineDistance(currentPoint, unvisited[0].coordinates);

    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateHaversineDistance(currentPoint, unvisited[i].coordinates);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const nearest = unvisited.splice(nearestIndex, 1)[0];
    route.push(nearest);
    currentPoint = nearest.coordinates;
  }

  return route;
}

/**
 * Calcula métricas da rota
 * @param route Rota otimizada
 * @param origin Ponto de partida
 * @returns Métricas da rota
 */
export function calculateRouteMetrics(route: Delivery[], origin: Coordinates): RouteMetrics {
  let totalDistance = 0;
  let totalTime = 0;
  let totalValue = 0;
  let currentPoint = origin;

  // Calcula distância total
  for (const delivery of route) {
    totalDistance += calculateHaversineDistance(currentPoint, delivery.coordinates);
    currentPoint = delivery.coordinates;
  }

  // Calcula tempo total
  totalTime = route.reduce((acc, delivery) => acc + delivery.deliveryTime, 0);

  // Calcula valor total
  totalValue = route.reduce((acc, delivery) => acc + delivery.value, 0);

  // Calcula lucro por km
  const profitPerKm = totalDistance > 0 ? totalValue / totalDistance : 0;

  // Calcula eficiência (combinação de tempo e valor)
  const avgTimePerDelivery = totalTime / route.length;
  const avgValuePerDelivery = totalValue / route.length;
  const efficiency = (0.6 * (1 / avgTimePerDelivery)) + (0.4 * avgValuePerDelivery);

  return {
    totalDistance: Math.round(totalDistance * 100) / 100,
    totalTime,
    totalValue,
    profitPerKm: Math.round(profitPerKm * 100) / 100,
    efficiency: Math.round(efficiency * 100) / 100,
    deliveries: route
  };
}

/**
 * Otimiza a rota considerando tempo e valor
 * @param deliveries Lista de entregas disponíveis
 * @param origin Ponto de partida
 * @param params Parâmetros de otimização
 * @returns Rota otimizada com métricas
 */
export function optimizeRoute(
  deliveries: Delivery[],
  origin: Coordinates,
  params: OptimizationParams = {
    timeWeight: 0.6,
    valueWeight: 0.4,
    maxCapacity: 8,
    validTimeWindows: [
      { start: 6, end: 10 },
      { start: 15, end: 18 }
    ]
  }
): RouteMetrics {
  // Filtra entregas por capacidade e horários válidos
  const validDeliveries = deliveries
    .filter(delivery => isValidTimeWindow(delivery.timeWindow))
    .slice(0, params.maxCapacity);

  if (validDeliveries.length === 0) {
    return {
      totalDistance: 0,
      totalTime: 0,
      totalValue: 0,
      profitPerKm: 0,
      efficiency: 0,
      deliveries: []
    };
  }

  // Aplica algoritmo Nearest Neighbor
  const nearestNeighborRoute = nearestNeighbor(validDeliveries, origin);

  // Calcula métricas da rota
  const metrics = calculateRouteMetrics(nearestNeighborRoute, origin);

  // Aplica otimização por valor/tempo (reordenação inteligente)
  const optimizedRoute = optimizeByValueTime(nearestNeighborRoute, params);

  // Recalcula métricas com a rota otimizada
  const finalMetrics = calculateRouteMetrics(optimizedRoute, origin);

  return finalMetrics;
}

/**
 * Otimiza a rota considerando a combinação de tempo e valor
 * @param route Rota base (resultado do Nearest Neighbor)
 * @param params Parâmetros de otimização
 * @returns Rota otimizada
 */
function optimizeByValueTime(route: Delivery[], params: OptimizationParams): Delivery[] {
  if (route.length <= 1) return route;

  const optimized = [...route];
  
  // Usa algoritmo de ordenação com peso para tempo e valor
  // Menores tempos e maiores valores são preferidos
  optimized.sort((a, b) => {
    const timeScoreA = (1 / a.deliveryTime) * params.timeWeight;
    const valueScoreA = a.value * params.valueWeight;
    const totalScoreA = timeScoreA + valueScoreA;

    const timeScoreB = (1 / b.deliveryTime) * params.timeWeight;
    const valueScoreB = b.value * params.valueWeight;
    const totalScoreB = timeScoreB + valueScoreB;

    return totalScoreB - totalScoreA; // Ordem decrescente
  });

  return optimized;
}

/**
 * Calcula potencial de lucro por km de uma rota
 * @param route Rota para análise
 * @param origin Ponto de partida
 * @returns Potencial de lucro por km
 */
export function calculateProfitPotential(route: Delivery[], origin: Coordinates): number {
  const metrics = calculateRouteMetrics(route, origin);
  return metrics.profitPerKm;
}

/**
 * Estima tempo total da rota incluindo deslocamento
 * @param route Rota planejada
 * @param origin Ponto de partida
 * @param averageSpeed Velocidade média em km/h (padrão 30 km/h)
 * @returns Tempo total em minutos
 */
export function estimateTotalTime(
  route: Delivery[], 
  origin: Coordinates,
  averageSpeed: number = 30
): number {
  let totalTime = 0;
  let currentPoint = origin;

  // Tempo de deslocamento
  for (const delivery of route) {
    const distance = calculateHaversineDistance(currentPoint, delivery.coordinates);
    const travelTime = (distance / averageSpeed) * 60; // conversão para minutos
    totalTime += travelTime;
    currentPoint = delivery.coordinates;
  }

  // Tempo de entrega
  totalTime += route.reduce((acc, delivery) => acc + delivery.deliveryTime, 0);

  return Math.round(totalTime);
}