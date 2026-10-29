// lib/analyze.ts
// GitHub profile -> measurable traits -> MusicSpec (the "score" the audio engine plays).
import { redis } from './redis';

const API = 'https://api.github.com';
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));

export type Day = { date: string; count: number };
export type Repo = { fork?: boolean; language?: string | null; stargazers_count?: number };

export type Analysis = {
  login: string;
  total: number;          // contributions in the last year
  consistency: number;    // 0..1  share of days with activity
  burstiness: number;     // 0..1  0 = steady, 1 = rare huge spikes
  longestStreak: number;  // days
  weekendShare: number;   // 0..1
  trend: number;          // -1..1 last 90 days vs the 90 before
  weekly: number[];       // weekly totals, the shape of the year
  weekPattern: number[];  // Mon..Sun, 0..1 (the "week" becomes the bar)
  langs: { name: string; share: number }[];
  spread: number;         // 0..1 0 = one tight time window, 1 = around the clock (UTC)
  stars: number;
};

export type MusicSpec = {
  seed: number;
  bpm: number;
  swing: number;          // 0..0.25
  root: number;           // MIDI note of the tonic (bass register)
  modeName: string;
  mode: number[];         // 7 semitone offsets
  progression: number[];  // scale degrees, one per 4 bars
  lead: 'sawtooth' | 'square' | 'triangle' | 'sine';
  brightness: number;     // 0..1  filter openness
  space: number;          // 0..1  reverb / delay amount
  weekPattern: number[];  // 7 accents, Mon..Sun
  energy: number[];       // 32 bars, 0..1: the year as song structure
  title: string;
};

/* ---------- pure feature extraction (no network, easy to test) ---------- */

export function features(login: string, days: Day[], hours: number[], repos: Repo[]): Analysis {
  const counts = days.map((d) => d.count);
  const total = counts.reduce((a, b) => a + b, 0);
  const n = Math.max(1, counts.length);
  const mean = total / n;
  const sd = Math.sqrt(counts.reduce((a, c) => a + (c - mean) ** 2, 0) / n);

  let streak = 0, longestStreak = 0;
  for (const c of counts) { streak = c > 0 ? streak + 1 : 0; longestStreak = Math.max(longestStreak, streak); }

  const sums = Array(7).fill(0), seen = Array(7).fill(0);
  for (const d of days) { const w = new Date(d.date + 'T00:00:00Z').getUTCDay(); sums[w] += d.count; seen[w]++; }
  const weekdayAvg = sums.map((s, i) => s / Math.max(1, seen[i]));          // Sun..Sat
  const monFirst = [1, 2, 3, 4, 5, 6, 0].map((i) => weekdayAvg[i]);
  const top = Math.max(...monFirst, 0.0001);

  const weekly: number[] = [];
  for (let i = 0; i < counts.length; i += 7) weekly.push(counts.slice(i, i + 7).reduce((a, b) => a + b, 0));

  const last = counts.slice(-90).reduce((a, b) => a + b, 0);
  const prev = counts.slice(-180, -90).reduce((a, b) => a + b, 0);

  const own = repos.filter((r) => !r.fork);
  const byLang = new Map<string, number>();
  own.forEach((r) => r.language && byLang.set(r.language, (byLang.get(r.language) || 0) + 1));
  const langTotal = [...byLang.values()].reduce((a, b) => a + b, 0) || 1;
  const langs = [...byLang].map(([name, c]) => ({ name, share: c / langTotal })).sort((a, b) => b.share - a.share).slice(0, 5);

  const hSum = hours.reduce((a, b) => a + b, 0);
  const entropy = hSum ? -hours.reduce((a, h) => (h ? a + (h / hSum) * Math.log(h / hSum) : a), 0) / Math.log(24) : 0.5;

  return {
    login, total,
    consistency: counts.filter((c) => c > 0).length / n,
    burstiness: mean ? clamp(sd / mean / 3) : 0,
    longestStreak,
    weekendShare: total ? (sums[0] + sums[6]) / total : 0,
    trend: last + prev ? (last - prev) / (last + prev) : 0,
    weekly,
    weekPattern: monFirst.map((v) => v / top),
    langs,
    spread: entropy,
    stars: own.reduce((a, r) => a + (r.stargazers_count || 0), 0),
  };
}

/* ---------- traits -> music ---------- */

const MODES: Record<string, number[]> = {
  phrygian: [0, 1, 3, 5, 7, 8, 10],   // dark, tense
  aeolian: [0, 2, 3, 5, 7, 8, 10],    // plain minor
  dorian: [0, 2, 3, 5, 7, 9, 10],     // cool, jazzy
  mixolydian: [0, 2, 4, 5, 7, 9, 10], // bright, bluesy
  lydian: [0, 2, 4, 6, 7, 9, 11],     // floating, hopeful
  ionian: [0, 2, 4, 5, 7, 9, 11],     // major, clean
};
const LANG_MODE: Record<string, string> = {
  Rust: 'phrygian', C: 'phrygian', 'C++': 'phrygian', Zig: 'phrygian', Assembly: 'phrygian',
  Python: 'dorian', R: 'dorian', 'Jupyter Notebook': 'dorian', Elixir: 'dorian',
  JavaScript: 'mixolydian', TypeScript: 'mixolydian', Lua: 'mixolydian',
  Go: 'lydian', Ruby: 'lydian', Swift: 'lydian', Dart: 'lydian',
  Java: 'ionian', 'C#': 'ionian', Kotlin: 'ionian', PHP: 'ionian',
  Shell: 'aeolian', HTML: 'ionian', CSS: 'lydian',
};
const LANG_LEAD: Record<string, MusicSpec['lead']> = {
  Rust: 'sawtooth', C: 'sawtooth', 'C++': 'sawtooth', Go: 'sine', Python: 'triangle', Ruby: 'triangle',
  JavaScript: 'square', TypeScript: 'square', Java: 'square', 'C#': 'square',
};
const PROGS = [[0, 5, 3, 4], [0, 3, 5, 4], [0, 6, 2, 5], [0, 2, 5, 3]];

function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

export function toSpec(a: Analysis): MusicSpec {
  const seed = hash(a.login.toLowerCase());
  const lead = a.langs[0]?.name ?? '';
  const modeName = LANG_MODE[lead] ?? 'aeolian';

  const perActiveDay = a.total / Math.max(1, a.consistency * 365);
  const intensity = clamp(perActiveDay / 10);

  const W = Math.max(1, a.weekly.length), BARS = 32;
  const raw = Array.from({ length: BARS }, (_, i) => {
    const from = Math.floor((i * W) / BARS), to = Math.max(from + 1, Math.floor(((i + 1) * W) / BARS));
    const slice = a.weekly.slice(from, to);
    return slice.reduce((x, y) => x + y, 0) / Math.max(1, slice.length);
  });
  const max = Math.max(...raw, 0);
  const energy = raw.map((v) => (max ? Math.sqrt(v / max) : 0.15));

  const rich = a.langs.length >= 4;
  return {
    seed,
    bpm: Math.round(76 + 44 * intensity + 20 * a.consistency),
    swing: clamp(a.weekendShare * 0.8, 0, 0.25),
    root: 33 + (seed % 12),
    modeName,
    mode: MODES[modeName],
    progression: PROGS[(rich ? 2 : 0) + (seed % 2)],
    lead: LANG_LEAD[lead] ?? 'triangle',
    brightness: clamp(0.35 + 0.4 * a.consistency + 0.25 * a.trend),
    space: clamp(0.2 + 0.6 * a.spread),
    weekPattern: a.weekPattern,
    energy,
    title: `${lead || 'Quiet'} in ${modeName[0].toUpperCase() + modeName.slice(1)}`,
  };
}

/* ---------- network (server side only) ---------- */

async function getDays(login: string, token?: string): Promise<Day[]> {
  if (token) {
    const query = `query($l:String!){user(login:$l){contributionsCollection{contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}`;
    const r = await fetch(`${API}/graphql`, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(8000),
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'gitmusice' },
      body: JSON.stringify({ query, variables: { l: login } }),
    });
    const weeks = (await r.json()).data?.user?.contributionsCollection?.contributionCalendar?.weeks;
    if (weeks) return weeks.flatMap((w: any) => w.contributionDays.map((d: any) => ({ date: d.date, count: d.contributionCount })));
  }
  const r = await fetch(`https://github-contributions-api.jogruber.de/v4/${login}?y=last`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
  return ((await r.json()).contributions || []).map((d: any) => ({ date: d.date, count: d.count }));
}

async function getRepos(login: string, headers: Record<string, string>): Promise<Repo[]> {
  const r = await fetch(`${API}/users/${login}/repos?per_page=100&type=owner&sort=pushed`, { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
  return r.ok ? r.json() : [];
}

async function getHours(login: string, headers: Record<string, string>): Promise<number[]> {
  const hours = Array(24).fill(0);
  for (let page = 1; page <= 3; page++) {
    const r = await fetch(`${API}/users/${login}/events/public?per_page=100&page=${page}`, { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) break;
    const ev = await r.json();
    if (!Array.isArray(ev) || !ev.length) break;
    ev.forEach((e: any) => hours[new Date(e.created_at).getUTCHours()]++);
  }
  return hours;
}

export async function analyze(login: string) {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'gitmusice', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
  const [days, repos, hours] = await Promise.all([
    getDays(login, token).catch(() => [] as Day[]),
    getRepos(login, headers).catch(() => [] as Repo[]),
    getHours(login, headers).catch(() => Array(24).fill(0)),
  ]);
  const analysis = features(login, days, hours, repos);
  return { analysis, spec: toSpec(analysis) };
}

/* ---------- cached wrapper: use this one in pages (1 hour, like getProfile) ---------- */

const mem = new Map<string, { t: number; v: any }>();

export async function analyzeCached(login: string): Promise<Awaited<ReturnType<typeof analyze>>> {
  const key = 'gm:an:v1:' + login.toLowerCase();
  try {
    if (redis) { const hit = await redis.get<any>(key); if (hit) return hit; }
    else { const m = mem.get(key); if (m && Date.now() - m.t < 3600_000) return m.v; }
  } catch {}
  const v = await analyze(login);
  try { if (redis) await redis.set(key, v, { ex: 3600 }); else mem.set(key, { t: Date.now(), v }); } catch {}
  return v;
}