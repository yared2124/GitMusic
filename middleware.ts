import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './lib/redis';

// Pages: 60/min per IP. Badges: 600/min per IP, because GitHub's image proxy shares IPs across many READMEs;
// badge load is controlled by CDN caching (s-maxage) rather than by this limit.
const pages = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m'), prefix: 'rl:page' }) : null;
const badges = redis ? new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(600, '1 m'), prefix: 'rl:badge' }) : null;

export async function middleware(req: NextRequest) {
  const rl = req.nextUrl.pathname.startsWith('/api/badge') ? badges : pages;
  if (!rl) return NextResponse.next();
  const ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
  try {
    const { success, reset } = await rl.limit(ip);
    if (success) return NextResponse.next();
    return new NextResponse('Too many requests. Slow down and try again shortly.', {
      status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))) },
    });
  } catch { return NextResponse.next(); } // fail open if Redis is down
}
export const config = { matcher: ['/((?!_next/|tracks/|favicon.ico|.*\\..*).*)'] };
