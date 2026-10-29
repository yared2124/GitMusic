'use client';

import { useState } from 'react';
import PreviewPlayer from './PreviewPlayer';

const waveHeights = [22, 36, 52, 31, 64, 43, 25, 56, 70, 38, 60, 29, 48, 67, 34, 54, 23, 45, 62, 32, 50, 40];

export default function SampleTrack() {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      <div className={`mt-5 flex h-14 items-center justify-center gap-[5px] ${playing ? 'waveform-playing' : ''}`} aria-hidden>
        {waveHeights.map((height, index) => (
          <span key={index} className="wave-bar" style={{ height: `${height}%`, animationDelay: `${index * 35}ms` }} />
        ))}
      </div>
      <PreviewPlayer onPlayingChange={setPlaying} />
    </>
  );
}
