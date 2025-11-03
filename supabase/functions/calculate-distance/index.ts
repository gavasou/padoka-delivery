Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { origin, destination } = await req.json();

        if (!origin || !destination) {
            throw new Error('Origin and destination are required');
        }

        const GOOGLE_MAPS_API_KEY = Deno.env.get('google_map_api_key');

        if (!GOOGLE_MAPS_API_KEY) {
            throw new Error('Google Maps API key not configured');
        }

        // Calculate distance using Google Maps Distance Matrix API
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' || !data.rows || !data.rows[0]?.elements?.[0]) {
            throw new Error('Failed to calculate distance');
        }

        const element = data.rows[0].elements[0];

        if (element.status !== 'OK') {
            throw new Error('Route not found');
        }

        const distanceInMeters = element.distance.value;
        const distanceInKm = (distanceInMeters / 1000).toFixed(2);
        const durationInSeconds = element.duration.value;
        const durationText = element.duration.text;

        return new Response(JSON.stringify({
            data: {
                distance: distanceInKm,
                distanceText: element.distance.text,
                duration: durationInSeconds,
                durationText: durationText
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Distance calculation error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'DISTANCE_CALCULATION_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
