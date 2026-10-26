'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Pause, Play, Github } from 'lucide-react';
import Nav from './Nav';
import { Engine } from '../lib/audio';
import { getTier } from '../lib/tiers';
import { TIER_ICONS } from './tierIcons';

const nf = (n: number) => n.toLocaleString('en-US');
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const glass = 'rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl';

export default function Profile({ username, data, error }: { username: string; data?: any; error?: string }) {
  const tier = data ? getTier(data.contributions) : null;
  const color = tier?.cur.color || '#9ca3af';
  const goat = tier?.cur.key === 'goat';
  const [playing, setPlaying] = useState(false), [t, setT] = useState(0), [dur, setDur] = useState(252), [copied, setCopied] = useState(false);
  const eng = useRef<Engine | null>(null), cv = useRef<HTMLCanvasElement>(null), av = useRef<HTMLDivElement>(null), fl = useRef<HTMLDivElement>(null);

  useEffect(() => { if (goat && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) import('canvas-confetti').then((m) => m.default({ particleCount: 180, spread: 100, origin: { y: 0.3 }, colors: ['#facc15', '#fde047', '#ffffff'] })); }, [goat]);
  useEffect(() => () => eng.current?.stop(), []);

  useEffect(() => {
    const c = cv.current; if (!c) return;
    const g = c.getContext('2d')!; let raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; let sm = 0;
    const loop = () => {
      const e = eng.current, f = e?.freq(), W = c.width, H = c.height, N = 40;
      g.clearRect(0, 0, W, H); g.fillStyle = color;
      for (let i = 0; i < N; i++) {
        const v = f ? f[Math.floor((i * 120) / N) + 1] / 255 : 0.1 + 0.07 * Math.sin(i * 1.7);
        const h = Math.max(4, v * H * 0.95); g.fillRect(i * (W / N) + 2, (H - h) / 2, 4, h);
      }
      // Smoothed bass so nothing flashes faster than a few times per second; skipped entirely for reduced motion.
      sm = sm * 0.9 + (e && e.running() ? e.bass() : 0) * 0.1;
      if (!reduce) {
        if (av.current) { av.current.style.transform = `scale(${1 + sm * 0.16})`; av.current.style.boxShadow = `0 0 ${24 + sm * 70}px ${color}`; }
        if (goat && fl.current) fl.current.style.opacity = String(Math.min(0.3, sm * 0.5));
      }
      if (e && e.running()) { const x = e.time(); setT((p) => (Math.floor(p) === Math.floor(x) ? p : x)); }
      raf = requestAnimationFrame(loop);
    };
    loop(); return () => cancelAnimationFrame(raf);
  }, [color, goat, data]);

  const toggle = async () => {
    if (!eng.current) {
      let src: string | undefined;
      try { const r = await fetch(`/tracks/${tier!.cur.key}.mp3`, { method: 'HEAD' }); if (r.ok && (r.headers.get('content-type') || '').includes('audio')) src = `/tracks/${tier!.cur.key}.mp3`; } catch {}
      const e = new Engine(data.login, tier!.cur.n, src); await e.start(); eng.current = e; setDur(e.duration()); setPlaying(true); return;
    }
    if (playing) { await eng.current.pause(); setPlaying(false); } else { await eng.current.resume(); setPlaying(true); }
  };
  const copy = async () => {
    const o = location.origin;
    await navigator.clipboard.writeText(`[![GitMusice Vibe](${o}/api/badge/${data.login})](${o}/${data.login})`);
    setCopied(true); setTimeout(() => setCopied(false), 1800);
  };

  const Icon = tier ? TIER_ICONS[tier.cur.icon] : null;
  const pct = tier?.next ? Math.min(100, ((data.contributions - tier.cur.min) / (tier.next.min - tier.cur.min)) * 100) : 100;
  const NIcon = tier?.next ? TIER_ICONS[tier.next.icon] : null;

  return (
    <div className="min-h-screen" style={{ background: `radial-gradient(800px 480px at 20% 0, ${color}22, transparent 60%), #07090b` }}>
      {goat && <div ref={fl} aria-hidden className="pointer-events-none fixed inset-0 opacity-0" style={{ boxShadow: `inset 0 0 180px ${color}` }} />}
      <Nav initial={username} />
      <main className="mx-auto max-w-5xl px-4 py-10">
        {error || !data ? (
          <div className={glass + ' text-center'} role="alert"><p className="text-lg">{error}</p><p className="mt-2 text-sm text-slate-400">Check the spelling and search again.</p></div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col gap-5">
              <section className={glass}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div ref={av} className="relative h-32 w-32 shrink-0 rounded-full will-change-transform" style={{ border: `2px solid ${color}` }}>
                    <img src={data.avatar} alt={`${data.login} avatar`} className="h-full w-full rounded-full object-cover" />
                    <span className="absolute -bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded px-2 py-0.5 text-xs font-bold text-black" style={{ background: color }}>
                      <Icon className="h-3 w-3" aria-hidden /> LV. {String(tier!.cur.n).padStart(2, '0')}</span>
                  </div>
                  <div className="min-w-0">
                    <a href={data.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-cyan-300 hover:underline"><Github className="h-3.5 w-3.5" aria-hidden />@{data.login}</a>
                    <h1 className="truncate text-3xl font-semibold tracking-tight">{data.name}</h1>
                    <p className="mt-1 text-sm text-slate-300">{data.bio}</p>
                  </div>
                </div>
                <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-5">
                  {[['Contributions', nf(data.contributions)], ['Repositories', nf(data.repos)], ['Followers', nf(data.followers)]].map(([k, v]) => (
                    <div key={k}><dd className="text-xl font-semibold">{v}</dd><dt className="text-xs text-slate-400">{k}</dt></div>))}
                </dl>
              </section>
              <section className={glass} style={{ borderColor: color + '55' }}>
                <div className="flex items-center gap-3" style={{ color }}>
                  <Icon className="h-8 w-8" aria-hidden />
                  <div><p className="text-xs text-slate-400">Current tier</p><p className="text-2xl font-bold tracking-wide">{tier!.cur.name}</p></div>
                </div>
                {tier!.next ? (<>
                  <div className="mt-5 flex items-end justify-between text-sm">
                    <span className="flex items-center gap-1.5" style={{ color: tier!.next.color }}><NIcon className="h-4 w-4" aria-hidden />Next: {tier!.next.name}</span>
                    <span><b className="text-lg">{nf(tier!.next.min - data.contributions)}</b> <span className="text-slate-400">commits to go</span></span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
                    <div className="h-full rounded-full" style={{ width: pct + '%', background: `linear-gradient(90deg, ${tier!.cur.color}, ${tier!.next.color})` }} />
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-slate-400"><span>{nf(data.contributions)}</span><span>{nf(tier!.next.min)}</span></div>
                </>) : <p className="mt-4 text-sm text-slate-300">Top tier reached. Nothing left to climb.</p>}
              </section>
            </div>
            <div className="flex flex-col gap-5">
              <section className={glass}>
                <div className="flex justify-between text-xs text-slate-400"><span>Now playing</span><span>{fmt(dur)}</span></div>
                <p className="mt-4 text-sm font-medium" style={{ color }}>{tier!.cur.name} frequency</p>
                <h2 className="mt-1 text-3xl font-semibold leading-tight tracking-tight">{tier!.cur.track}</h2>
                <p className="mt-1 text-sm text-slate-400">GitMusice Originals · {tier!.cur.name} tier</p>
                <canvas ref={cv} width={480} height={88} className="mx-auto my-6 h-11 w-60" aria-hidden />
                <div className="flex items-center gap-4 border-t border-white/10 pt-5">
                  <button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'} className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-black transition hover:scale-105" style={{ background: color }}>
                    {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-px" />}</button>
                  <div className="flex-1">
                    <div className="h-1 rounded bg-white/10"><div className="h-full rounded" style={{ width: Math.min(100, (t / dur) * 100) + '%', background: color }} /></div>
                    <div className="mt-1.5 flex justify-between text-xs text-slate-400"><span>{fmt(t)}</span><span>{fmt(dur)}</span></div>
                  </div>
                </div>
              </section>
              <section className={glass}>
                <div className="flex justify-between text-xs text-slate-400"><span>README badge</span><span>Share your vibe</span></div>
                <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3"><img src={`/api/badge/${data.login}`} alt="GitMusice badge preview" className="h-10" /></div>
                <button onClick={copy} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2.5 text-sm font-medium transition hover:border-lime-300">
                  {copied ? <Check className="h-4 w-4 text-lime-300" /> : <Copy className="h-4 w-4" />}{copied ? 'Copied to clipboard' : 'Copy Markdown'}</button>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
