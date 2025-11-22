import axios from 'axios';

const DIRECTUS_URL = process.env.DIRECTUS_INTERNAL_URL || 'http://directus:8055';
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN || '';

export async function GET(req, { params }) {
  const resolvedParams = await params;
  const { collection } = resolvedParams;
  try {
    const url = new URL(req.url);
    const query = url.searchParams;
    const r = await axios({
      method: 'GET',
      url: `${DIRECTUS_URL}/items/${collection}`,
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      params: query,
    });
    return new Response(JSON.stringify(r.data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Directus proxy error', err.response?.data || err.message);
    return new Response(JSON.stringify({ error: 'Directus proxy failed', detail: err.response?.data || err.message }), { status: err.response?.status || 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req, { params }) {
  const resolvedParams = await params;
  const { collection } = resolvedParams;
  try {
    const body = await req.json();
    const r = await axios({
      method: 'POST',
      url: `${DIRECTUS_URL}/items/${collection}`,
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      data: body,
    });
    return new Response(JSON.stringify(r.data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Directus proxy error', err.response?.data || err.message);
    return new Response(JSON.stringify({ error: 'Directus proxy failed', detail: err.response?.data || err.message }), { status: err.response?.status || 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function PUT(req, { params }) {
  const resolvedParams = await params;
  const { collection } = resolvedParams;
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const body = await req.json();
    const r = await axios({
      method: 'PUT',
      url: `${DIRECTUS_URL}/items/${collection}/${id}`,
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
      data: body,
    });
    return new Response(JSON.stringify(r.data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Directus proxy error', err.response?.data || err.message);
    return new Response(JSON.stringify({ error: 'Directus proxy failed', detail: err.response?.data || err.message }), { status: err.response?.status || 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(req, { params }) {
  const resolvedParams = await params;
  const { collection } = resolvedParams;
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    const r = await axios({
      method: 'DELETE',
      url: `${DIRECTUS_URL}/items/${collection}/${id}`,
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {},
    });
    return new Response(JSON.stringify(r.data), { status: r.status, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Directus proxy error', err.response?.data || err.message);
    return new Response(JSON.stringify({ error: 'Directus proxy failed', detail: err.response?.data || err.message }), { status: err.response?.status || 500, headers: { 'Content-Type': 'application/json' } });
  }
}
