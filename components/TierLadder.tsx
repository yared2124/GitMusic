'use client';
import { useRef, useState } from 'react';
import { TIERS } from '../lib/tiers';
import { TIER_ICONS } from './tierIcons';

// Major pentatonic climbing two octaves: each tier sounds higher than the one below.
const SEMITONES = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
const nf = (n: number) => n.toLocaleString('en-US');
const range = (i: number) => {
  if (i === 0) return 'No contributions yet';
  const next = TIERS[i + 1];
  return next ? `${nf(TIERS[i].min)} to ${nf(next.min - 1)} contributions` : `${nf(TIERS[i].min)} contributions and up`;
};

export default function TierLadder() {
  const [sel, setSel] = useState(5);
  const ctx = useRef<AudioContext | null>(null);

  const play = (i: number) => {
    try {
      if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const C = ctx.current, o = C.createOscillator(), g = C.createGain(), t = C.currentTime;
      o.type = 'triangle'; o.frequency.value = 196 * 2 ** (SEMITONES[i] / 12);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
      o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + 0.75);
    } catch {}
  };
  const cur = TIERS[sel];

  return (
    <section aria-labelledby="ladder-title">
      <h2 id="ladder-title" className="text-xl font-semibold tracking-tight">Ten tiers, one scale</h2>
      <p className="mt-1 text-slate-400">Each tier sits a step higher. Select a bar to hear it.</p>

      <div className="mt-8 flex h-56 items-end gap-1.5 border-b border-white/20 sm:h-64 sm:gap-2" role="group" aria-label="Tier ladder">
        {TIERS.map((t, i) => (
          <button key={t.key} type="button" onClick={() => { setSel(i); play(i); }}
            aria-label={`${t.name}, ${range(i)}`} aria-pressed={sel === i}
            className="group flex h-full flex-1 flex-col justify-end outline-offset-4">
            <span className="block w-full rounded-t-sm transition-opacity duration-150 group-hover:opacity-90"
              style={{ height: `${22 + i * 8.5}%`, background: t.color, opacity: sel === i ? 1 : 0.55 }} />
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 sm:gap-2" aria-hidden>
        {TIERS.map((t, i) => { const I = TIER_ICONS[t.icon]; return (
          <span key={t.key} className="flex flex-1 justify-center"><I className="h-4 w-4" style={{ color: t.color, opacity: sel === i ? 1 : 0.5 }} /></span>); })}
      </div>

      <div className="mt-8 flex flex-wrap items-baseline gap-x-6 gap-y-1" aria-live="polite">
        <p className="text-4xl font-semibold tracking-tight sm:text-5xl" style={{ color: cur.color }}>{cur.name}</p>
        <p className="text-slate-200">{range(sel)}</p>
        <p className="text-sm text-slate-400">Plays “{cur.track}”</p>
      </div>
    </section>
  );
}