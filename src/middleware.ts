import { NextResponse, NextRequest } from 'next/server';
import { BASIC_AUTH_DISABLED, BASIC_AUTH_PASSWORD, BASIC_AUTH_USER } from '@/config/constants';

export const middleware = (req: NextRequest) => {
  if (BASIC_AUTH_DISABLED === 'true') {
    return NextResponse.next();
  }
  const basicAuth = req.headers.get('authorization');
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [username, password] = atob(authValue).split(':');
    if (
      username === BASIC_AUTH_USER &&
      password === BASIC_AUTH_PASSWORD
    ) {
      return NextResponse.next();
    }
  }
  const url = req.nextUrl;
  url.pathname = '/api/auth';
  return NextResponse.rewrite(url);
};

export const config = {
  matcher: ['/:path*'],
};