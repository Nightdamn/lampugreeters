// GET /api/stats
export async function onRequestGet(context) {
  const { env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Configuration error',
        hasUrl: !!env.SUPABASE_URL,
        hasKey: !!env.SUPABASE_KEY
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/QUOTAS?select=CAMP,STATUS`,
      {
        headers: {
          'apikey': env.SUPABASE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_KEY}`
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
