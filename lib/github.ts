const fail = (status: number, message: string) => Object.assign(new Error(message), { status });
import { redis } from './redis';
const mem = new Map<string, any>();
const TTL = 3600_000, NEG_TTL = 600_000;
async function readCache(key: string) {
  if (redis) { try { const r = await redis.get<any>('gm:' + key); if (r) return r; } catch {} }
  return mem.get(key) ?? null;
}
async function writeCache(key: string, rec: any) {
  mem.set(key, rec);
  if (redis) { try { await redis.set('gm:' + key, rec, { ex: 86400 }); } catch {} }
}

async function graphqlTotal(login: string, created: string, token: string): Promise<number> {
  const y0 = new Date(created).getFullYear(), y1 = new Date().getFullYear(), parts: string[] = [];
  for (let y = y0; y <= y1; y++)
    parts.push(`y${y}:contributionsCollection(from:"${y}-01-01T00:00:00Z",to:"${y}-12-31T23:59:59Z"){contributionCalendar{totalContributions}}`);
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(8000),
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'gitmusice' },
    body: JSON.stringify({ query: `query($l:String!){user(login:$l){${parts.join(' ')}}}`, variables: { l: login } }),
  });
  const u = (await r.json()).data?.user;
  if (!u) throw new Error('graphql');
  return Object.values<any>(u).reduce((a, v) => a + v.contributionCalendar.totalContributions, 0);
}

async function proxyTotal(login: string): Promise<number> {
  const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${login}?y=all`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
  const c = await r.json();
  return Object.values<number>(c.total || {}).reduce((a, b) => a + b, 0);
}

async function fetchFresh(u: string) {
  const token = process.env.GITHUB_TOKEN;
  const headers: any = { Accept: 'application/vnd.github+json', 'User-Agent': 'gitmusice' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const gh = await fetch(`https://api.github.com/users/${u}`, { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) });
  if (gh.status === 404) throw fail(404, `No GitHub user named "${u}".`);
  if (!gh.ok) throw fail(502, 'GitHub is rate limiting us. Try again in a few minutes.');
  const p = await gh.json();
  let contributions = 0;
  try { contributions = token ? await graphqlTotal(p.login, p.created_at, token) : await proxyTotal(p.login); }
  catch { try { contributions = await proxyTotal(p.login); } catch {} }

  let stars = 0, forks = 0, languages: string[] = [];
  try {
    const rRes = await fetch(`https://api.github.com/users/${encodeURIComponent(p.login)}/repos?per_page=30&sort=pushed`, {
      headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(5000),
    });
    if (rRes.ok) {
      const rData = await rRes.json();
      if (Array.isArray(rData)) {
        const lSet = new Set<string>();
        for (const item of rData) {
          stars += item.stargazers_count || 0;
          forks += item.forks_count || 0;
          if (item.language) lSet.add(item.language);
        }
        languages = Array.from(lSet);
      }
    }
  } catch {}

  return {
    login: p.login, name: p.name || p.login, bio: p.bio || 'No bio yet. The commits speak for themselves.',
    avatar: p.avatar_url, url: p.html_url, repos: p.public_repos, followers: p.followers, following: p.following,
    createdAt: p.created_at, stars, forks, languages, contributions,
  };
}

// Fresh for 1h; if GitHub fails we serve the stale copy (kept 24h). Unknown users are cached 10 min to protect the token.
export async function getProfile(u: string) {
  if (!/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(u || '')) throw fail(400, 'Enter a valid GitHub username.');
  const key = u.toLowerCase(), hit = await readCache(key), age = hit ? Date.now() - hit.t : Infinity;
  if (hit?.missing && age < NEG_TTL) throw fail(404, `No GitHub user named "${u}".`);
  if (hit && !hit.missing && age < TTL) return hit.v;
  try {
    const v = await fetchFresh(u);
    await writeCache(key, { t: Date.now(), v });
    return v;
  } catch (e: any) {
    if (e.status === 404) await writeCache(key, { t: Date.now(), missing: true });
    else if (hit && !hit.missing) return hit.v;
    throw e;
  }
}
