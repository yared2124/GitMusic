'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { Engine } from '../lib/audio';

export default function PreviewPlayer() {
  const engine = useRef<Engine | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => engine.current?.stop(), []);

  const toggle = async () => {
    try {
      if (!engine.current) {
        const player = new Engine('theoctocat', 7);
        await player.start();
        engine.current = player;
        setPlaying(true);
      } else if (playing) {
        await engine.current.pause();
        setPlaying(false);
      } else {
        await engine.current.resume();
        setPlaying(true);
      }
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Audio playback could not be started.');
    }
  };

  return (
    <>
      <div className="mt-3 flex items-center gap-3">
        <button type="button" className="play-button" onClick={() => void toggle()} aria-label={playing ? 'Pause sample soundtrack' : 'Play sample soundtrack'} aria-pressed={playing}>
          {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
        </button>
        <span className="font-mono text-xs text-slate-400">01:20</span>
        <div className="hero-progress"><i /></div>
        <span className="font-mono text-xs text-slate-500">03:42</span>
      </div>
      {error && <p className="mt-3 text-xs text-rose-300" role="alert">{error}</p>}
    </>
  );
}
