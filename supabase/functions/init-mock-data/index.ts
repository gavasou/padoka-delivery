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

        // Create admin user first
        const adminEmail = 'admin@padoka.com';
        const adminPassword = 'Padoka2025!';

        // Check if admin exists
        const checkAdmin = await fetch(`${supabaseUrl}/rest/v1/users_profile?id=eq.${adminEmail}`, {
            headers: {
                'Authorization': `Bearer ${serviceRoleKey}`,
                'apikey': serviceRoleKey
            }
        });

        const results = {
            admin_created: false,
            message: 'Mock data initialization completed'
        };

        // Create admin if doesn't exist
        if (checkAdmin.ok) {
            const existingAdmin = await checkAdmin.json();
            if (existingAdmin.length === 0) {
                // Create admin auth user
                const createAdminAuth = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${serviceRoleKey}`,
                        'apikey': serviceRoleKey,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: adminEmail,
                        password: adminPassword,
                        email_confirm: true
                    })
                });

                if (createAdminAuth.ok) {
                    const adminData = await createAdminAuth.json();
                    
                    // Create admin profile
                    await fetch(`${supabaseUrl}/rest/v1/users_profile`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${serviceRoleKey}`,
                            'apikey': serviceRoleKey,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        },
                        body: JSON.stringify({
                            id: adminData.id,
                            full_name: 'Admin Padoka',
                            role: 'admin',
                            status: 'approved'
                        })
                    });

                    results.admin_created = true;
                }
            }
        }

        return new Response(JSON.stringify({ data: results }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Init data error:', error);

        return new Response(JSON.stringify({
            error: {
                code: 'INIT_DATA_FAILED',
                message: error.message
            }
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
