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
        const { address } = await req.json();

        if (!address) {
            throw new Error('Address is required');
        }

        const GOOGLE_MAPS_API_KEY = Deno.env.get('google_map_api_key');

        if (!GOOGLE_MAPS_API_KEY) {
            throw new Error('Google Maps API key not configured');
        }

        // Geocode the address
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'OK' || !data.results || data.results.length === 0) {
            throw new Error('Address not found');
        }

        const result = data.results[0];
        const location = result.geometry.location;
        const formattedAddress = result.formatted_address;

        return new Response(JSON.stringify({
            data: {
                latitude: location.lat,
                longitude: location.lng,
                formattedAddress: formattedAddress
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Geocoding error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'GEOCODING_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
