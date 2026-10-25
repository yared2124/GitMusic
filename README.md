# GitMusice
Turn your GitHub contributions into a tier, a soundtrack and a README badge.

    cp .env.example .env.local && npm install && npm run dev      # http://localhost:3000/torvalds

- `/[username]`            profile page (server-rendered; unknown users return a real 404)
- `/[username]/opengraph-image`  social preview card (PNG, 1200x630)
- `/api/badge/[username]`  animated SVG badge, cached 1h at the CDN
- `middleware.ts`          per-IP rate limiting (needs Redis env vars; fails open if Redis is down)
- Audio: procedural by default; drop licensed files at `public/tracks/<tier>.mp3`
  (afk, chill, hustler, grinder, titan, legend, mythic, demigod, immortal, goat).

## Deploy to Vercel
1. Push to GitHub, then Import Project in Vercel.
2. Storage tab > add Upstash Redis (sets the Redis env vars for you).
3. Settings > Environment Variables: add `GITHUB_TOKEN` and `NEXT_PUBLIC_SITE_URL`.
4. Settings > Domains: add gitmusice.pro.et and create the DNS records Vercel shows at your registrar.
5. Test: `/torvalds`, `/definitely-not-a-user-123` (expect 404), and paste a badge into a README.
