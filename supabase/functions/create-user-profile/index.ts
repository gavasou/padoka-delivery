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
        const { userId, fullName, role, phone, address, vehicle } = await req.json();

        if (!userId || !fullName || !role) {
            throw new Error('userId, fullName and role are required');
        }

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // Create or update user profile
        const profileData = {
            id: userId,
            full_name: fullName,
            role: role,
            phone: phone || null,
            address: address || null,
            vehicle: vehicle || null,
            status: role === 'client' ? 'approved' : 'pending',
            gamification_points: 0,
            profile_image_url: 'https://i.imgur.com/jJSBvE9.png'
        };

        const upsertResponse = await fetch(`${supabaseUrl}/rest/v1/users_profile`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(profileData)
        });

        if (!upsertResponse.ok) {
            const errorText = await upsertResponse.text();
            throw new Error(`Profile creation failed: ${errorText}`);
        }

        const profileResult = await upsertResponse.json();

        return new Response(JSON.stringify({
            data: { profile: profileResult[0] }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Profile creation error:', error);

        const errorResponse = {
            error: {
                code: 'PROFILE_CREATION_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
