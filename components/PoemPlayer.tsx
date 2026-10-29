'use client';
import { useEffect, useRef, useState } from 'react';
import { speakPoem } from '../lib/sing';
import type { Poem } from '../lib/poem';

export default function PoemPlayer({ poem, bpm, onPlay, onStop }: {
  poem: Poem; bpm: number; onPlay?: () => void; onStop?: () => void;
}) {
  const [active, setActive] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const stopRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => stopRef.current?.();
  }, []);

  const finish = () => { stopRef.current = null; setPlaying(false); setActive(-1); onStop?.(); };
  const stop = () => { stopRef.current?.(); finish(); };
  const play = () => {
    onPlay?.();                                   // start your music engine here
    setPlaying(true);
    stopRef.current = speakPoem(poem.lines, { bpm, onLine: setActive, onEnd: finish });
  };

  const starts = poem.stanzas.reduce<number[]>((acc, s, k) => {
    acc.push(k ? acc[k - 1] + poem.stanzas[k - 1].lines.length : 0);
    return acc;
  }, []);

  return (
    <section className="mt-10 border border-white/10 bg-white/[.03] p-6">
      <p className="text-xs text-slate-400">The poem of your year</p>
      <h3 className="mt-1 text-2xl tracking-tight">{poem.title}</h3>

      <div className="mt-5 space-y-5">
        {poem.stanzas.map((st, si) => (
          <div key={si}>
            <p className="text-xs text-slate-400">{st.tag}</p>
            {st.lines.map((line, li) => (
              <p key={li} className={`text-lg leading-8 transition-colors ${active === starts[si] + li ? 'text-lime-300' : 'text-slate-300'}`}>
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>

      {supported ? (
        <button onClick={playing ? stop : play} className="lime-button mt-6">
          {playing ? 'Stop' : 'Perform it'}
        </button>
      ) : (
        <p className="mt-6 text-sm text-slate-400">Your browser can't read aloud, but the poem is yours to keep.</p>
      )}
    </section>
  );
}