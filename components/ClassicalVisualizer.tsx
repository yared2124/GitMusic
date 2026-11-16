'use client';

import { useEffect, useRef } from 'react';
import { Engine } from '../lib/audio';

interface ClassicalVisualizerProps {
  engine: Engine | null;
  isPlaying: boolean;
  color: string;
  movement?: string;
  bpm?: number;
}

export default function ClassicalVisualizer({
  engine,
  isPlaying,
  color,
  movement = 'Andante',
  bpm = 80,
}: ClassicalVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let phase = 0;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Subtle technical grid lines (Specsheet inspired blueprint feel)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let y = 16; y < H; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      for (let x = 20; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }

      // Center baseline
      const midY = H / 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(W, midY);
      ctx.stroke();
      ctx.setLineDash([]);

      const freqs = engine && isPlaying ? engine.freq() : null;
      const bassVal = engine && isPlaying ? engine.bass() : 0;
      const count = 48;
      const barWidth = W / count;

      phase += isPlaying ? 0.04 : 0.015;

      // Draw mirrored classical frequency harmonic spectrum
      for (let i = 0; i < count; i++) {
        let v = 0;
        if (freqs && freqs.length > 0) {
          // Sample across audible music spectrum
          const binIndex = Math.min(freqs.length - 1, Math.floor((i * 90) / count) + 1);
          v = freqs[binIndex] / 255;
        } else {
          // Idle elegant ambient wave
          v = 0.12 + 0.08 * Math.sin(phase + i * 0.28) + 0.04 * Math.cos(phase * 1.5 + i * 0.1);
        }

        const barH = Math.max(4, v * (H * 0.85));
        const x = i * barWidth + barWidth * 0.15;
        const width = barWidth * 0.7;

        // Gradient for piano/strings harmonics
        const grad = ctx.createLinearGradient(0, midY - barH / 2, 0, midY + barH / 2);
        grad.addColorStop(0, color);
        grad.addColorStop(0.5, '#ffffff');
        grad.addColorStop(1, color);

        ctx.fillStyle = grad;
        ctx.fillRect(x, midY - barH / 2, width, barH);

        // Highlight tip dots on active notes
        if (v > 0.35) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + width / 2, midY - barH / 2 - 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Smooth flowing classical violin curve overlay
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = isPlaying ? 12 + bassVal * 15 : 4;

      for (let x = 0; x < W; x += 4) {
        const norm = x / W;
        const wave =
          Math.sin(norm * 12 + phase * 2) * (isPlaying ? 14 + bassVal * 28 : 6) +
          Math.cos(norm * 6 - phase) * (isPlaying ? 8 : 4);
        const y = midY + wave;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // reset shadow

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [engine, isPlaying, color]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1.5">
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              isPlaying ? 'animate-pulse' : 'opacity-40'
            }`}
            style={{ backgroundColor: color }}
          />
          {isPlaying ? 'Acoustic Synthesizer Active' : 'Classical Standby'}
        </span>
        <span className="text-slate-400">
          {movement} · {bpm} BPM
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={560}
        height={100}
        className="h-24 w-full cursor-crosshair rounded"
        aria-label="Classical audio waveform visualizer"
      />
    </div>
  );
}

