import { NextResponse } from 'next/server';

export async function GET(request) {
  const response = NextResponse.redirect(new URL('/', request.url));
  
  // Delete session cookie
  response.cookies.delete('platubot_session');

  return response;
}
