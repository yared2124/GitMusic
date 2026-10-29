// lib/sing.ts  -- import this only from client components
export type SingOpts = { bpm: number; barsPerLine?: number; onLine?: (i: number) => void; onEnd?: () => void };

export function speakPoem(lines: string[], { bpm, barsPerLine = 2, onLine, onEnd }: SingOpts) {
  const synth = window.speechSynthesis;
  const slot = (60 / bpm) * 4 * barsPerLine * 1000;           // ms per line (4/4 bars)
  const pitches = [1, 1.12, 1.25, 1.12];                      // small rise and fall, a chant contour
  const timers: number[] = [];
  let stopped = false;

  const pickVoice = () => {
    const en = synth.getVoices().filter((v) => v.lang.startsWith('en'));
    return en.find((v) => /natural|neural|google|samantha|daniel/i.test(v.name)) ?? en[0];
  };

  const say = (line: string, i: number) => {
    if (stopped) return;
    onLine?.(i);
    const u = new SpeechSynthesisUtterance(line);
    const v = pickVoice();
    if (v) u.voice = v;
    u.rate = Math.min(1.2, Math.max(0.8, bpm / 110));
    u.pitch = pitches[i % 4];
    synth.speak(u);
  };

  synth.cancel();
  lines.forEach((line, i) => {
    if (i === 0) say(line, 0);                                // must run inside the click on iOS
    else timers.push(window.setTimeout(() => say(line, i), i * slot));
  });
  timers.push(window.setTimeout(() => { if (!stopped) onEnd?.(); }, lines.length * slot));

  return () => { stopped = true; timers.forEach(clearTimeout); synth.cancel(); };
}