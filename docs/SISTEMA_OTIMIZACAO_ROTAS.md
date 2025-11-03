# Sistema de Otimizacao de Rotas - Padoka

## Visao Geral
Sistema avancado de otimizacao de rotas para entregadores no Padoka, permitindo maximizar lucros combinando entregas proximas de forma inteligente.

## Status: IMPLEMENTADO E FUNCIONAL

### Data de Implementacao: 2025-11-03 15:52

## Componentes Implementados

### 1. Estrutura de Dados (Backend)

#### Tabela deliveries (expandida)
Campos adicionados:
- `latitude` DECIMAL(10,8) - Coordenada de latitude
- `longitude` DECIMAL(11,8) - Coordenada de longitude
- `delivery_value` DECIMAL(10,2) - Valor da entrega em R$
- `priority_level` INTEGER (1-5) - Nivel de prioridade
- `estimated_duration` INTEGER - Tempo estimado em minutos
- `zone_id` VARCHAR(50) - ID da zona/regiao
- `delivery_person_id` UUID - ID do entregador responsavel

#### Tabela delivery_routes (nova)
Campos:
- `id` UUID - Identificador unico
- `route_id` VARCHAR(100) - ID legivel da rota
- `delivery_person_id` UUID - ID do entregador
- `delivery_ids` UUID[] - Array de IDs das entregas
- `sequence_order` INTEGER[] - Ordem otimizada
- `total_distance` DECIMAL(10,2) - Distancia total em km
- `total_value` DECIMAL(10,2) - Valor total em R$
- `estimated_time` INTEGER - Tempo estimado em minutos
- `status` VARCHAR(20) - Status (planejada, em_andamento, concluida, cancelada)
- `optimization_score` DECIMAL(5,2) - Score de eficiencia (0-100)
- `profit_per_km` DECIMAL(10,2) - Lucro por km em R$
- Timestamps: created_at, updated_at, completed_at

#### Tabela route_opportunities (nova)
Campos:
- `id` UUID - Identificador unico
- `delivery_person_id` UUID - ID do entregador
- `current_route_id` UUID - ID da rota atual (opcional)
- `suggested_delivery_ids` UUID[] - IDs das entregas sugeridas
- `additional_distance` DECIMAL(10,2) - Distancia adicional em km
- `additional_value` DECIMAL(10,2) - Valor adicional em R$
- `additional_time` INTEGER - Tempo adicional em minutos
- `justification` TEXT - Explicacao da sugestao
- `status` VARCHAR(20) - Status (pendente, aceita, rejeitada, expirada)
- Timestamps: created_at, expires_at, responded_at

### 2. Edge Functions

#### optimize-delivery-route
**URL**: https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/optimize-delivery-route

**Funcionalidade**:
- Calcula rota otimizada usando algoritmo Nearest Neighbor
- Considera capacidade maxima de 8 entregas
- Otimiza por combinacao tempo/lucro (60% tempo, 40% valor)
- Filtra por horarios validos (6-10h e 15-18h)

**Input**:
```json
{
  "deliveryPersonId": "uuid",
  "currentDelivery": { /* objeto com entrega atual */ },
  "availableDeliveries": [ /* array de entregas disponiveis */ ],
  "origin": {
    "latitude": -23.5505,
    "longitude": -46.6333
  }
}
```

**Output**:
```json
{
  "data": {
    "route": [ /* entregas ordenadas otimamente */ ],
    "metrics": {
      "totalDistance": 12.5,
      "totalValue": 89.50,
      "totalTime": 120,
      "profitPerKm": 7.16,
      "efficiency": 85.3,
      "deliveryCount": 5
    },
    "justifications": [
      "Rota otimizada com 5 entrega(s) no total",
      "Distancia total: 12.5 km",
      "Valor total: R$ 89.50",
      "Tempo estimado: 120 minutos",
      "Lucro por km: R$ 7.16/km"
    ],
    "timestamp": "2025-11-03T15:52:40.123Z"
  }
}
```

#### find-nearby-deliveries
**URL**: https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/find-nearby-deliveries

**Funcionalidade**:
- Busca entregas disponiveis proximas a rota atual
- Raio de busca configuravel (padrao 5km)
- Prioriza por proximidade e horario (6-10h, 15-18h)
- Calcula valor adicional por km
- Cria notificacoes de oportunidades automaticamente

**Input**:
```json
{
  "deliveryPersonId": "uuid",
  "currentLocation": {
    "latitude": -23.5505,
    "longitude": -46.6333
  },
  "currentRoute": [ /* rota atual (opcional) */ ],
  "maxRadius": 5
}
```

**Output**:
```json
{
  "data": {
    "opportunities": [
      {
        "delivery": { /* objeto da entrega */ },
        "metrics": {
          "distance": 2.3,
          "additionalValue": 18.50,
          "estimatedTime": 15,
          "valuePerKm": 8.04,
          "priority": 4
        },
        "justification": "Muito proxima - desvio minimo! | Bom valor por distancia | Alta prioridade"
      }
    ],
    "count": 3,
    "timestamp": "2025-11-03T15:52:40.123Z"
  }
}
```

### 3. Interface Frontend (DeliveryManager)

#### Secao "Otimizar Rota"
- Card destacado com gradiente purple-to-indigo
- Botao "Calcular Rota Otimizada"
- Botao "Buscar Proximas"
- Indicadores de carregamento

#### Exibicao de Rota Otimizada
**Metricas**:
- Distancia Total (km)
- Valor Total (R$)
- Tempo Estimado (minutos)

**Justificativas**:
- Explicacao clara do porque da rota sugerida
- Criterios de otimizacao aplicados

**Lista de Entregas Sugeridas**:
- Cards individuais com:
  - Numero de sequencia na rota
  - Nome do cliente
  - Endereco
  - Valor da entrega
  - Tempo estimado
  - Botoes "Aceitar" e "Recusar"

#### Oportunidades Proximas
- Alerta visual com destaque amber
- Lista das 3 melhores oportunidades
- Metricas: distancia, valor adicional
- Justificativa da sugestao
- Botao de aceitacao rapida

### 4. RLS Policies

**deliveries**:
- Entregadores veem suas entregas ou as disponiveis (sem entregador atribuido)
- Entregadores atualizam apenas suas entregas
- Admins tem acesso total

**delivery_routes**:
- Entregadores veem, criam e atualizam apenas suas rotas
- Admins tem acesso total

**route_opportunities**:
- Entregadores veem e respondem apenas suas oportunidades
- Sistema (edge functions) pode criar oportunidades
- Admins tem acesso total

### 5. Algoritmo de Otimizacao

#### Nearest Neighbor
1. Comeca no ponto de origem
2. Seleciona a entrega mais proxima nao visitada
3. Move para essa entrega
4. Repete ate todas as entregas serem visitadas

#### Otimizacao Tempo/Valor
Apos Nearest Neighbor, reordena entregas por score combinado:
- Score = (1 / tempo_entrega) × 0.6 + valor_entrega × 0.4
- Prioriza entregas rapidas e de alto valor

#### Criterios de Filtragem
- Capacidade maxima: 8 entregas
- Horarios validos: 6-10h e 15-18h
- Apenas entregas com coordenadas validas

### 6. Calculo de Metricas

#### Distancia Haversine
Formula para calcular distancia entre coordenadas GPS:
```
R = 6371 km (raio da Terra)
dLat = lat2 - lat1
dLon = lon2 - lon1
a = sin²(dLat/2) + cos(lat1) × cos(lat2) × sin²(dLon/2)
c = 2 × atan2(√a, √(1-a))
distancia = R × c
```

#### Lucro por Km
```
lucro_por_km = valor_total / distancia_total
```

#### Eficiencia
```
eficiencia = (0.6 × (1 / tempo_medio_por_entrega)) + (0.4 × valor_medio_por_entrega)
```

## Integracao Completa

### Frontend → Backend
1. Usuario clica em "Calcular Rota Otimizada"
2. Frontend busca entregas disponiveis do Supabase
3. Frontend chama edge function `optimize-delivery-route`
4. Edge function retorna rota otimizada
5. Frontend exibe sugestoes com metricas

### Sistema de Notificacoes
1. Usuario clica em "Buscar Proximas"
2. Frontend chama edge function `find-nearby-deliveries`
3. Edge function busca entregas no raio de 5km
4. Se encontrar boas oportunidades (valor/km > 5), cria registro em `route_opportunities`
5. Frontend exibe oportunidades em tempo real

### Aceitacao de Entregas
1. Usuario clica em "Aceitar" em uma entrega sugerida
2. Frontend atualiza `delivery_person_id` na tabela deliveries
3. Entrega passa a aparecer na lista de "Pendentes" do entregador
4. Usuario pode marca-la como entregue quando concluir

## Compatibilidade

### Sistema de Assinaturas
- Mantem compatibilidade total com sistema existente
- Usa `subscription_id` existente na tabela deliveries

### Google Maps
- Integrado com `googleMapsService.ts` existente
- Pode ser estendido para visualizacao de rotas no mapa

### RLS Policies
- Respeita policies existentes
- Adiciona policies especificas para otimizacao

## Proximos Passos (Opcio nais)

1. **Visualizacao no Mapa**:
   - Integrar MapView para mostrar rota no mapa
   - Marcar entregas com pins numerados
   - Desenhar polyline da rota otimizada

2. **Notificacoes Push**:
   - Integrar com sistema de notificacoes existente
   - Alertar entregador quando surgir boa oportunidade

3. **Historico de Rotas**:
   - Salvar rotas concluidas em delivery_routes
   - Analytics de eficiencia do entregador

4. **Machine Learning**:
   - Aprender padroes de trafego por horario
   - Ajustar estimativas de tempo dinamicamente

## Arquivos Criados/Modificados

### Backend
- `/workspace/supabase/migrations/20251103_route_optimization_system_v3.sql` (APLICADA)
- `/workspace/supabase/functions/optimize-delivery-route/index.ts` (DEPLOYADA)
- `/workspace/supabase/functions/find-nearby-deliveries/index.ts` (DEPLOYADA)

### Frontend
- `/workspace/components/DeliveryManager.tsx` (ATUALIZADO - 431 linhas)

### Documentacao
- `/workspace/docs/SISTEMA_OTIMIZACAO_ROTAS.md` (este arquivo)

## Status de Deploy

- Migration: APLICADA com sucesso
- Edge Function optimize-delivery-route: ATIVA (Function ID: 95a44c19-455c-45ab-a85f-fb28a4d3a38f)
- Edge Function find-nearby-deliveries: ATIVA (Function ID: 887a64e2-5709-4fcf-831c-2861e47209bb)
- Frontend: IMPLEMENTADO (requer rebuild)

## Como Testar

### 1. Criar Entregas de Teste
```sql
INSERT INTO deliveries (
    subscription_id, customer_name, address, 
    latitude, longitude, delivery_value, 
    priority_level, estimated_duration, zone_id, status
) VALUES
    (
        (SELECT id FROM subscriptions LIMIT 1),
        'Cliente Teste 1',
        'Rua Augusta, 100 - Sao Paulo',
        -23.5567,
        -46.6625,
        25.00,
        4,
        15,
        'centro',
        'Pendente'
    ),
    (
        (SELECT id FROM subscriptions LIMIT 1),
        'Cliente Teste 2',
        'Av Paulista, 1000 - Sao Paulo',
        -23.5613,
        -46.6565,
        18.50,
        3,
        20,
        'centro',
        'Pendente'
    );
```

### 2. Testar Edge Function optimize-delivery-route
```bash
curl -X POST \
  'https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/optimize-delivery-route' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "deliveryPersonId": "uuid-do-entregador",
    "availableDeliveries": [...]
  }'
```

### 3. Testar Edge Function find-nearby-deliveries
```bash
curl -X POST \
  'https://ywpazjaaqavjcdonlnzs.supabase.co/functions/v1/find-nearby-deliveries' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -d '{
    "deliveryPersonId": "uuid-do-entregador",
    "currentLocation": {
      "latitude": -23.5505,
      "longitude": -46.6333
    }
  }'
```

### 4. Testar Interface
1. Fazer login como entregador (entregador@padoka.com / Padoka2025!)
2. Acessar DeliveryManager
3. Clicar em "Calcular Rota Otimizada"
4. Verificar metricas e sugestoes
5. Clicar em "Buscar Proximas"
6. Aceitar/recusar entregas sugeridas

## Metricas de Sucesso

- Aumento de entregas por hora por entregador
- Reducao de km rodados por entrega
- Aumento de lucro por km
- Taxa de aceitacao de sugestoes
- Tempo medio de rota otimizada vs nao-otimizada

## Sistema PRONTO para PRODUCAO
