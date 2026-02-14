// GET /api/camp-icons
// Returns camp names and their emoji icons from SUMMARY table
export async function onRequestGet(context) {
  const { env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  try {
    const serviceKey = env.SUPABASE_SERVICE_KEY || env.SUPABASE_KEY;
    
    if (!env.SUPABASE_URL || !serviceKey) {
      return new Response(JSON.stringify({ 
        error: 'Configuration error'
      }), {
        status: 500,
        headers: corsHeaders
      });
    }

    const response = await fetch(
      `${env.SUPABASE_URL}/rest/v1/SUMMARY?select=CAMP,ICON`,
      {
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`
        }
      }
    );

    const data = await response.json();
    
    // Convert to object for easy lookup: { "Central Camp": "🔥", ... }
    const icons = {};
    data.forEach(item => {
      if (item.CAMP && item.ICON) {
        icons[item.CAMP] = item.ICON;
      }
    });
    
    return new Response(JSON.stringify(icons), {
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
