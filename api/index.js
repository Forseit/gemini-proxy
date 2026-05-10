export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  url.host = 'gemini.google.com';
  url.port = '443';
  url.protocol = 'https:';

  const headers = new Headers(req.headers);
  headers.set('host', 'gemini.google.com');
  headers.set('origin', 'https://gemini.google.com');
  
  // Удаляем все заголовки, по которым Google может понять, что это прокси Vercel
  headers.delete('x-forwarded-for');
  headers.delete('x-real-ip');
  headers.delete('x-vercel-id');
  headers.delete('x-vercel-forwarded-for');
  headers.delete('x-vercel-ip-country');
  headers.delete('x-vercel-ip-city');
  headers.delete('x-vercel-proxied-for');

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? await req.blob() : undefined,
      redirect: 'manual'
    });

    const responseHeaders = new Headers(response.headers);
    // Удаляем заголовки безопасности, мешающие работе во встроенных браузерах
    responseHeaders.delete('content-security-policy');
    responseHeaders.delete('x-frame-options');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders
    });
  } catch (err) {
    return new Response('Edge Proxy Error: ' + err.message, { status: 500 });
  }
}
