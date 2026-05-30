import { NextResponse } from 'next/server';
import { decryptSession } from '../../../utils/session';

async function verifyAuth(request) {
  const sessionCookie = request.cookies.get('platubot_session')?.value;
  const sessionSecret = process.env.SESSION_SECRET || 'platubot-secure-session-key-must-be-long-32';
  
  if (!sessionCookie) return null;
  return decryptSession(sessionCookie, sessionSecret);
}

export async function GET(request) {
  const user = await verifyAuth(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001';
  const botApiSecret = process.env.BOT_API_SECRET || 'platubot-super-secret-key-1234';

  try {
    const res = await fetch(`${botApiUrl}/api/vps/logs`, {
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
    console.error('[API Proxy VPS Logs GET Exception]:', err);
    return NextResponse.json({ error: 'Failed to contact bot server' }, { status: 502 });
  }
}
