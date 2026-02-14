// GET /api/stats
// Uses SUPABASE_SERVICE_KEY to bypass RLS (server-side only)
export async function onRequestGet(context) {
  const { env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    // Use SERVICE_KEY (bypasses RLS) - only available server-side
    const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
    
    if (!env.SUPABASE_URL || !serviceKey) {
      return new Response(JSON.stringify({ 
        error: 'Configuration error',
        hasUrl: !!env.SUPABASE_URL,
        hasKey: !!serviceKey
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/QUOTAS?select=CAMP,STATUS`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      }
    );

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
