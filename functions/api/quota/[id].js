// GET /api/quota/[id]
export async function onRequestGet(context) {
  const { params, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const entryId = params.id;

    if (!entryId) {
      return new Response(JSON.stringify({ error: 'Entry ID required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    if (!env.SUPABASE_URL || !env.SUPABASE_KEY) {
      return new Response(JSON.stringify({ 
        error: 'Configuration error' 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/QUOTAS?USER_ID=eq.${entryId}`,
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
