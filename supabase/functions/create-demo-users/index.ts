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
        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        const demoUsers = [
            {
                email: 'cliente@padoka.com',
                password: 'Padoka2025!',
                full_name: 'Ana Silva',
                role: 'client',
                phone: '(11) 98765-4321',
                address: 'Rua das Flores, 123',
                profile_image_url: 'https://i.imgur.com/kFHFGv1.png'
            },
            {
                email: 'padaria@padoka.com',
                password: 'Padoka2025!',
                full_name: 'Carlos Ferreira',
                role: 'bakery',
                phone: '(11) 91122-3344',
                profile_image_url: 'https://i.imgur.com/jJSBvE9.png'
            },
            {
                email: 'entregador@padoka.com',
                password: 'Padoka2025!',
                full_name: 'João Entregador',
                role: 'delivery',
                phone: '(11) 91234-5678',
                address: 'Região Central',
                vehicle: 'moto',
                profile_image_url: 'https://i.imgur.com/jJSBvE9.png',
                delivery_month_count: 124,
                delivery_avg_rating: 4.9,
                delivery_ontime_rate: 98
            },
            {
                email: 'admin@padoka.com',
                password: 'Padoka2025!',
                full_name: 'Admin Padoka',
                role: 'admin'
            }
        ];

        const results = [];

        for (const userData of demoUsers) {
            // Check if user already exists
            const checkResponse = await fetch(`${supabaseUrl}/rest/v1/users_profile?full_name=eq.${encodeURIComponent(userData.full_name)}`, {
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey
                }
            });

            const existingUsers = await checkResponse.json();
            
            if (existingUsers && existingUsers.length > 0) {
                results.push({ email: userData.email, status: 'already_exists' });
                continue;
            }

            // Create auth user
            const createAuthResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: userData.email,
                    password: userData.password,
                    email_confirm: true,
                    user_metadata: {
                        full_name: userData.full_name,
                        role: userData.role
                    }
                })
            });

            if (!createAuthResponse.ok) {
                const errorText = await createAuthResponse.text();
                results.push({ email: userData.email, status: 'auth_failed', error: errorText });
                continue;
            }

            const authData = await createAuthResponse.json();

            // Create profile
            const profileData = {
                id: authData.id,
                full_name: userData.full_name,
                role: userData.role,
                phone: userData.phone || null,
                address: userData.address || null,
                vehicle: userData.vehicle || null,
                profile_image_url: userData.profile_image_url || 'https://i.imgur.com/jJSBvE9.png',
                status: 'approved',
                gamification_points: userData.role === 'client' ? 450 : 0,
                gamification_level: userData.role === 'client' ? 'Pão de Ouro' : null,
                delivery_month_count: userData.delivery_month_count || null,
                delivery_avg_rating: userData.delivery_avg_rating || null,
                delivery_ontime_rate: userData.delivery_ontime_rate || null
            };

            const profileResponse = await fetch(`${supabaseUrl}/rest/v1/users_profile`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${serviceRoleKey}`,
                    'apikey': serviceRoleKey,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(profileData)
            });

            if (!profileResponse.ok) {
                const errorText = await profileResponse.text();
                results.push({ email: userData.email, status: 'profile_failed', error: errorText });
                continue;
            }

            results.push({ email: userData.email, status: 'created', id: authData.id });
        }

        return new Response(JSON.stringify({ data: { results } }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Create demo users error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'CREATE_DEMO_USERS_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
