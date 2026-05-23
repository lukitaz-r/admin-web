import { NextResponse } from 'next/server.js';
import { decryptSession } from '../../../utils/session.js';

async function verifyAuth(request) {
  const sessionCookie = request.cookies.get('platubot_session')?.value;
  const sessionSecret = process.env.SESSION_SECRET || 'platubot-secure-session-key-must-be-long-32';
  
  if (!sessionCookie) return null;
  return decryptSession(sessionCookie, sessionSecret);
}

export async function GET(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001';
  const botApiSecret = process.env.BOT_API_SECRET || 'platubot-super-secret-key-1234';

  let botEndpoint = '';
  if (!path || path.length === 0) {
    botEndpoint = '/api/collections';
  } else if (path.length === 1) {
    botEndpoint = `/api/collections/${path[0]}`;
  } else if (path.length === 2) {
    botEndpoint = `/api/collections/${path[0]}/${path[1]}`;
  } else {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  try {
    const res = await fetch(`${botApiUrl}${botEndpoint}`, {
      headers: {
        'Authorization': `Bearer ${botApiSecret}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Proxy GET Exception]:', err);
    return NextResponse.json({ error: 'Failed to contact bot server' }, { status: 502 });
  }
}

export async function POST(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001';
  const botApiSecret = process.env.BOT_API_SECRET || 'platubot-super-secret-key-1234';

  if (!path || path.length !== 1) {
    return NextResponse.json({ error: 'Post only allowed on collection endpoint' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${botApiUrl}/api/collections/${path[0]}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botApiSecret}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[API Proxy POST Exception]:', err);
    return NextResponse.json({ error: 'Failed to contact bot server' }, { status: 502 });
  }
}

export async function PUT(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001';
  const botApiSecret = process.env.BOT_API_SECRET || 'platubot-super-secret-key-1234';

  if (!path || path.length !== 2) {
    return NextResponse.json({ error: 'Put only allowed on document endpoint' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const res = await fetch(`${botApiUrl}/api/collections/${path[0]}/${path[1]}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botApiSecret}`
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Proxy PUT Exception]:', err);
    return NextResponse.json({ error: 'Failed to contact bot server' }, { status: 502 });
  }
}

export async function DELETE(request, { params }) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { path } = await params;
  const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001';
  const botApiSecret = process.env.BOT_API_SECRET || 'platubot-super-secret-key-1234';

  if (!path || path.length !== 2) {
    return NextResponse.json({ error: 'Delete only allowed on document endpoint' }, { status: 400 });
  }

  try {
    const res = await fetch(`${botApiUrl}/api/collections/${path[0]}/${path[1]}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${botApiSecret}`
      }
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: errText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[API Proxy DELETE Exception]:', err);
    return NextResponse.json({ error: 'Failed to contact bot server' }, { status: 502 });
  }
}
