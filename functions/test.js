// Самая простая функция для теста
export async function onRequest() {
  return new Response(JSON.stringify({
    message: "Functions работают!",
    timestamp: new Date().toISOString()
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
