// PATCH /api/checkin/[code]
// Uses SUPABASE_SERVICE_KEY to bypass RLS (server-side only)
export async function onRequestPatch(context) {
  const { params, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const code = params.code;

    if (!code) {
      return new Response(JSON.stringify({ error: 'Code required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use SERVICE_KEY (bypasses RLS) - only available server-side
    const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;

    if (!env.SUPABASE_URL || !serviceKey) {
      return new Response(JSON.stringify({ 
        error: 'Configuration error' 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/QUOTAS?CODE=eq.${code}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ STATUS: 'CheckIn' })
      }
    );

    return new Response(null, {
      status: response.status,
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
