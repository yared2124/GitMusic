'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Pause,
  Play,
  Github,
  Sparkles,
  Award,
  Music,
  Activity,
  Layers,
  Zap,
  Star,
  GitFork,
  ArrowUpRight,
  ShieldCheck,
  Flame,
  Radio,
} from 'lucide-react';
import Nav from './Nav';
import { Engine } from '../lib/audio';
import { evaluateDeveloper, DeveloperEvaluation } from '../lib/criteria';
import ClassicalVisualizer from './ClassicalVisualizer';

const nf = (n: number) => n.toLocaleString('en-US');
const fmt = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const glass = 'rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl';

export default function Profile({
  username,
  data,
  error,
}: {
  username: string;
  data?: any;
  error?: string;
}) {
  const [evaluation, setEvaluation] = useState<DeveloperEvaluation | null>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(288);
  const [copied, setCopied] = useState(false);

  const eng = useRef<Engine | null>(null);
  const av = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data) {
      const ev = evaluateDeveloper(data);
      setEvaluation(ev);
    }
  }, [data]);

  useEffect(() => () => eng.current?.stop(), []);

  const tier = evaluation?.classicalTier;
  const score = evaluation?.overallScore ?? 15;
  const color = tier?.color || '#38bdf8';
  const isHighMaster = score >= 85;

  useEffect(() => {
    if (isHighMaster && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      import('canvas-confetti').then((m) =>
        m.default({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.35 },
          colors: ['#facc15', '#fde047', '#ffffff', '#38bdf8'],
        })
      );
    }
  }, [isHighMaster]);

  // Audio play/pause toggle
  const toggle = async () => {
    if (!data || !evaluation) return;
    if (!eng.current) {
      let src: string | undefined;
      // Check if custom track exists
      try {
        const r = await fetch(`/tracks/${evaluation.classicalTier.id}.mp3`, { method: 'HEAD' });
        if (r.ok && (r.headers.get('content-type') || '').includes('audio')) {
          src = `/tracks/${evaluation.classicalTier.id}.mp3`;
        }
      } catch {}

      const e = new Engine(data.login, evaluation.classicalTier.level, src, score);
      await e.start();
      eng.current = e;
      setDur(e.duration());
      setPlaying(true);
      return;
    }

    if (playing) {
      await eng.current.pause();
      setPlaying(false);
    } else {
      await eng.current.resume();
      setPlaying(true);
    }
  };

  // Sync playback time for progress bar
  useEffect(() => {
    let animId = 0;
    const syncTime = () => {
      if (eng.current && eng.current.running()) {
        const x = eng.current.time();
        setT(x);
      }
      animId = requestAnimationFrame(syncTime);
    };
    syncTime();
    return () => cancelAnimationFrame(animId);
  }, []);

  const copy = async () => {
    const o = location.origin;
    await navigator.clipboard.writeText(
      `[![GitMusice Classical Score](${o}/api/badge/${data.login})](${o}/${data.login})`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="min-h-screen pb-16 text-slate-100"
      style={{
        background: `radial-gradient(1000px 600px at 50% 0, ${color}20, transparent 70%), #07090d`,
      }}
    >
      <Nav initial={username} />

      <main className="mx-auto max-w-6xl px-4 pt-8">
        {error || !data || !evaluation ? (
          <div className={glass + ' text-center my-12'} role="alert">
            <p className="text-xl font-medium text-rose-300">{error || 'User not found'}</p>
            <p className="mt-2 text-sm text-slate-400">
              Check the spelling of the GitHub username and try again.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {/* 1. DEVELOPER HERO & OVERALL SCORE (100% SCALE, MIN 15%) */}
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              {/* Profile Bio Card */}
              <section className={glass}>
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div
                    ref={av}
                    className="relative h-28 w-28 shrink-0 rounded-2xl will-change-transform sm:h-32 sm:w-32"
                    style={{
                      border: `2px solid ${color}`,
                      boxShadow: `0 0 35px ${color}35`,
                    }}
                  >
                    <img
                      src={data.avatar}
                      alt={`${data.login} avatar`}
                      className="h-full w-full rounded-2xl object-cover"
                    />
                    <span
                      className="absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-black"
                      style={{ background: color }}
                    >
                      <Award className="h-3 w-3" /> {score}% OVR
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={data.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-sky-400 hover:underline"
                      >
                        <Github className="h-3.5 w-3.5" />@{data.login}
                      </a>
                      <span className="rounded border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">
                        {evaluation.stats.yearsActive} yrs active
                      </span>
                    </div>

                    <h1 className="mt-1 truncate text-2xl font-bold tracking-tight sm:text-3xl">
                      {data.name || data.login}
                    </h1>
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-300">{data.bio}</p>

                    {evaluation.stats.languages.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {evaluation.stats.languages.slice(0, 5).map((lang) => (
                          <span
                            key={lang}
                            className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-300"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <dl className="mt-6 grid grid-cols-4 gap-2 border-t border-white/10 pt-5 text-center sm:text-left">
                  <div>
                    <dd className="font-mono text-lg font-bold sm:text-xl">
                      {nf(data.contributions)}
                    </dd>
                    <dt className="text-[11px] text-slate-400">Commits</dt>
                  </div>
                  <div>
                    <dd className="font-mono text-lg font-bold sm:text-xl">{nf(data.repos)}</dd>
                    <dt className="text-[11px] text-slate-400">Repos</dt>
                  </div>
                  <div>
                    <dd className="font-mono text-lg font-bold sm:text-xl">
                      {nf(evaluation.stats.stars)}
                    </dd>
                    <dt className="text-[11px] text-slate-400">Stars</dt>
                  </div>
                  <div>
                    <dd className="font-mono text-lg font-bold sm:text-xl">
                      {nf(data.followers)}
                    </dd>
                    <dt className="text-[11px] text-slate-400">Followers</dt>
                  </div>
                </dl>
              </section>

              {/* Developer Score Rating Card */}
              <section
                className={`${glass} flex flex-col justify-between`}
                style={{ borderColor: `${color}60` }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
                      Developer Overall Rating
                    </span>
                    <span
                      className="rounded px-2 py-0.5 font-mono text-[10px] font-semibold text-black"
                      style={{ background: color }}
                    >
                      {tier?.badge}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-4">
                    <div className="font-mono text-6xl font-black tracking-tight" style={{ color }}>
                      {score}
                      <span className="text-3xl font-light text-slate-400">%</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold tracking-tight text-white">
                        {evaluation.ratingTitle}
                      </div>
                      <div className="font-medium text-slate-400">
                        
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-300">
                   The score is calculated across 6 key criteria, each rated from 15% (minimum) to 100% (maximum).
                  </p>
                </div>

                <div className="mt-6 border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="text-slate-400">Scale Progress</span>
                    <span style={{ color }}>{score} / 100%</span>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${score}%`,
                        background: `linear-gradient(90deg, #38bdf8, ${color})`,
                      }}
                    />
                  </div>
                  <div className="mt-1.5 flex justify-between font-mono text-[10px] text-slate-400">
                    <span>15% (Baseline)</span>
                    <span>50%</span>
                    <span>100% (Legend)</span>
                  </div>
                </div>
              </section>
            </div>

            {/* 2. THE CLASSICAL MUSIC INVITATION (Classical Music Invitation) */}
            <section
              className="relative overflow-hidden rounded-2xl border p-6 sm:p-8 backdrop-blur-2xl"
              style={{
                borderColor: `${color}80`,
                background: `linear-gradient(135deg, ${color}15, rgba(10, 14, 20, 0.85))`,
                boxShadow: `0 0 60px ${color}20`,
              }}
            >
              <div className="relative z-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                {/* Dedication info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-semibold text-black"
                      style={{ background: color }}
                    >
                      <Music className="h-3.5 w-3.5" /> Classical Music Invitation
                    </span>
                    <span className="font-mono text-xs text-slate-300">
                      Dedicated Classical Piece
                    </span>
                  </div>

                  <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {tier?.title}
                  </h2>
                  <p className="mt-1 font-serif text-lg italic text-amber-200/90">
                    {tier?.description}
                  </p>

                  <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                    <p className="text-sm font-medium leading-relaxed text-amber-100">
                      &ldquo;{tier?.description}&rdquo;
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="font-mono text-slate-400">Instruments:</span>
                    {tier?.instruments.map((inst) => (
                      <span
                        key={inst}
                        className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-slate-200"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Player & Visualizer */}
                <div className="flex flex-col gap-4">
                  {/* Real-time Web Audio Visualizer */}
                  <ClassicalVisualizer
                    engine={eng.current}
                    isPlaying={playing}
                    color={color}
                    movement={tier?.movement}
                    bpm={tier?.tempoBpm}
                  />

                  {/* Audio Controls */}
                  <div className="rounded-xl border border-white/10 bg-black/40 p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={toggle}
                        aria-label={playing ? 'Pause classical piece' : 'Play classical piece'}
                        className="grid h-14 w-14 shrink-0 place-items-center rounded-full text-black transition-all hover:scale-105 active:scale-95"
                        style={{
                          background: color,
                          boxShadow: `0 0 25px ${color}60`,
                        }}
                      >
                        {playing ? (
                          <Pause className="h-6 w-6 fill-current" />
                        ) : (
                          <Play className="ml-1 h-6 w-6 fill-current" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="flex items-center justify-between font-mono text-xs">
                          <span className="font-bold text-white">
                            {playing ? 'Playing Classical Dedication' : 'Listen to Your Classical'}
                          </span>
                          <span className="text-slate-400">
                            {fmt(t)} / {fmt(dur)}
                          </span>
                        </div>

                        <div className="mt-2 h-1.5 w-full rounded-full bg-white/10">
                          <div
                            className="h-full rounded-full transition-all duration-100"
                            style={{
                              width: `${Math.min(100, (t / dur) * 100)}%`,
                              background: color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. DETAILED 6 EVALUATION CRITERIA */}
            <section className={glass}>
              <div className="flex flex-col justify-between gap-2 border-b border-white/10 pb-5 sm:flex-row sm:items-end">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-sky-400">
                    [ Specsheet Criteria Evaluation ]
                  </span>
                  <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">
                    Evaluation Breakdown
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Each criterion is scored from 15% to 100% and contributes to the overall result.
                  </p>
                </div>
                <div className="font-mono text-xs text-slate-400">
                  Overall Score: <b className="text-lg text-white">{score}%</b>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {evaluation.criteria.map((c, idx) => (
                  <div
                    key={c.key}
                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-black/25 p-4 transition hover:border-white/20"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-semibold text-slate-400">
                          0{idx + 1} · {c.key}
                        </span>
                        <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-slate-300">
                          Weight: {c.weight}%
                        </span>
                      </div>

                      <div className="mt-3 flex items-baseline justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white">{c.name}</h4>
  
                        </div>
                        <div className="font-mono text-2xl font-black text-sky-300">{c.score}%</div>
                      </div>

                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${c.score}%`,
                            background:
                              c.score >= 80 ? '#facc15' : c.score >= 50 ? '#38bdf8' : '#9ca3af',
                          }}
                        />
                      </div>

                      <p className="mt-3 text-xs leading-relaxed text-slate-300">{c.description}</p>
                    </div>

                    <div className="mt-4 border-t border-white/10 pt-2 font-mono text-[11px] text-sky-400">
                      {c.metric}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. README BADGE EMBED & SHARE */}
            <section className={glass}>
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <span className="font-mono text-xs uppercase text-slate-400">
                    GitHub README Badge
                  </span>
                  <h4 className="text-lg font-bold text-white">Share Your Classical Score</h4>
                  <p className="text-xs text-slate-400">
                    Embed an animated SVG badge on your GitHub profile or repository README.
                  </p>
                </div>
                <button
                  onClick={copy}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 font-mono text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" /> Copied Markdown!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> Copy README Markdown
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4 text-center sm:text-left">
                <img
                  src={`/api/badge/${data.login}`}
                  alt="GitMusice badge"
                  className="inline-block h-10"
                />
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
