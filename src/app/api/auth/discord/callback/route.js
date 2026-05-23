import { NextResponse } from 'next/server.js';
import { encryptSession } from '../../../utils/session.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = process.env.DISCORD_REDIRECT_URI;
  const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3001';
  const botApiSecret = process.env.BOT_API_SECRET || 'platubot-super-secret-key-1234';
  const sessionSecret = process.env.SESSION_SECRET || 'platubot-secure-session-key-must-be-long-32';

  try {
    // 1. Exchange OAuth2 code for an access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[Discord OAuth Callback] Token exchange failed:', errorText);
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 2. Fetch user details from Discord
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      return NextResponse.redirect(new URL('/?error=user_fetch_failed', request.url));
    }

    const userData = await userResponse.json();

    // 3. Ask the bot if the user is authorized (has role in server)
    const botCheckResponse = await fetch(`${botApiUrl}/api/auth-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${botApiSecret}`
      },
      body: JSON.stringify({ userId: userData.id })
    });

    if (!botCheckResponse.ok) {
      const errorData = await botCheckResponse.text();
      console.error('[Discord OAuth Callback] Bot validation error:', errorData);
      return NextResponse.redirect(new URL('/?error=bot_validation_failed', request.url));
    }

    const botCheckData = await botCheckResponse.json();

    if (!botCheckData.authorized) {
      return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
    }

    // 4. Create secure encrypted session
    const sessionData = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      displayName: botCheckData.user?.displayName || userData.username,
      loggedInAt: Date.now()
    };

    const encryptedText = encryptSession(sessionData, sessionSecret);

    // 5. Redirect to Home and set secure cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    
    response.cookies.set('platubot_session', encryptedText, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: '/'
    });

    return response;

  } catch (err) {
    console.error('[Discord OAuth Callback Exception]:', err);
    return NextResponse.redirect(new URL('/?error=auth_exception', request.url));
  }
}
