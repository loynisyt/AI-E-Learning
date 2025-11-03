export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return Response.json({ error: 'ID token is required' }, { status: 400 });
    }

    // Proxy the request to the backend
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return Response.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    const response = await fetch(`${backendUrl}/api/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    // Create a new response with the backend's data
    const frontendResponse = Response.json(data);

    // Forward the Set-Cookie header from backend if present
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      frontendResponse.headers.set('Set-Cookie', setCookieHeader);
    }

    return frontendResponse;

  } catch (error) {
    console.error('Session proxy error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// Optional: GET endpoint to verify current session (proxy to backend)
export async function GET(request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return Response.json({ error: 'Backend URL not configured' }, { status: 500 });
    }

    // Forward cookies to backend
    const cookieHeader = request.headers.get('cookie');

    const response = await fetch(`${backendUrl}/api/auth/session`, {
      method: 'GET',
      headers: {
        ...(cookieHeader && { cookie: cookieHeader }),
      },
    });

    const data = await response.json();

    return Response.json(data, { status: response.status });

  } catch (error) {
    console.error('Session verification proxy error:', error);
    return Response.json({ error: 'Session verification failed' }, { status: 500 });
  }
}
