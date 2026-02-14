// GET /api/quota/[id]
// Uses SUPABASE_SERVICE_KEY to bypass RLS (server-side only)
export async function onRequestGet(context) {
  const { params, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const entryId = params.id;
    
    console.log("=== API /api/quota/[id] ===");
    console.log("Received Entry ID:", entryId);

    if (!entryId) {
      return new Response(JSON.stringify({ error: 'Entry ID required' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Use SERVICE_KEY (bypasses RLS) - only available server-side
    const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
    
    if (!env.SUPABASE_URL || !serviceKey) {
      console.error("Missing environment variables!");
      return new Response(JSON.stringify({ 
        error: 'Configuration error' 
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const supabaseUrl = `${env.SUPABASE_URL}/rest/v1/QUOTAS?USER_ID=eq.${entryId}`;
    console.log("Querying Supabase:", supabaseUrl);
    console.log("Using key type:", env.SUPABASE_SERVICE_KEY ? "SERVICE (bypasses RLS)" : "ANON");

    const response = await fetch(supabaseUrl, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });

    console.log("Supabase response status:", response.status);
    
    const data = await response.json();
    console.log("Supabase returned records:", data.length);
    console.log("==========================");
    
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: corsHeaders
    });

  } catch (error) {
    console.error("API error:", error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
