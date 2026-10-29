'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, Copy, Github } from 'lucide-react';
import Nav from './Nav';
import { Engine } from '../lib/audio';
import { getTier } from '../lib/tiers';
import { TIER_ICONS } from './tierIcons';
import PoemPlayer from './PoemPlayer';
import type { Poem } from '../lib/poem';

const nf = (n: number) => n.toLocaleString('en-US');
const glass = 'rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl';

export default function Profile({ username, data, error, poem, bpm }: { username: string; data?: any; error?: string; poem?: Poem | null; bpm?: number }) {
  const tier = data ? getTier(data.contributions) : null;
  const color = tier?.cur.color || '#9ca3af';
  const goat = tier?.cur.key === 'goat';
  const [playing, setPlaying] = useState(false), [copied, setCopied] = useState(false);
  const eng = useRef<Engine | null>(null), av = useRef<HTMLDivElement>(null), fl = useRef<HTMLDivElement>(null);

  useEffect(() => { if (goat && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) import('canvas-confetti').then((m) => m.default({ particleCount: 180, spread: 100, origin: { y: 0.3 }, colors: ['#facc15', '#fde047', '#ffffff'] })); }, [goat]);
  useEffect(() => () => eng.current?.stop(), []);

  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; let sm = 0;
    const loop = () => {
      const e = eng.current;
      // Smoothed bass so nothing flashes faster than a few times per second; skipped entirely for reduced motion.
      sm = sm * 0.9 + (e && e.running() ? e.bass() : 0) * 0.1;
      if (!reduce) {
        if (av.current) { av.current.style.transform = `scale(${1 + sm * 0.16})`; av.current.style.boxShadow = `0 0 ${24 + sm * 70}px ${color}`; }
        if (goat && fl.current) fl.current.style.opacity = String(Math.min(0.3, sm * 0.5));
      }
      raf = requestAnimationFrame(loop);
    };
    loop(); return () => cancelAnimationFrame(raf);
  }, [color, goat, data]);

  const toggle = async () => {
    if (!eng.current) {
      let src: string | undefined;
      try { const r = await fetch(`/tracks/${tier!.cur.key}.mp3`, { method: 'HEAD' }); if (r.ok && (r.headers.get('content-type') || '').includes('audio')) src = `/tracks/${tier!.cur.key}.mp3`; } catch {}
      const e = new Engine(data.login, tier!.cur.n, src); await e.start(); eng.current = e; setPlaying(true); return;
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
              {poem && (
                <PoemPlayer
                  poem={poem}
                  bpm={bpm ?? 100}
                  onPlay={() => { if (!playing) void toggle(); }}
                  onStop={() => { void eng.current?.pause(); setPlaying(false); }}
                />
              )}
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
