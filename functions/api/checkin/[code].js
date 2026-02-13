// PATCH /api/checkin/[code]
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

    if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
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
          'apikey': env.SUPABASE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_KEY}`,
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
