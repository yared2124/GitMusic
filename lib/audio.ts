// Tier-scaled procedural music, or an mp3 from /public/tracks when one exists. Both feed one AnalyserNode.
const MINOR = [0, 2, 3, 5, 7, 8, 10];
const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);
const degree = (d: number) => MINOR[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
function hash(s: string) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function rng(seed: number) { let s = seed >>> 0; return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296); }

export class Engine {
  ctx!: AudioContext; master!: GainNode; an!: AnalyserNode; buf!: Uint8Array; noiseBuf!: AudioBuffer;
  el: HTMLAudioElement | null = null; timer: any; t0 = 0; next = 0; step = 0; spb = 0.1; root = 40;
  prog: number[] = []; bassP: boolean[] = []; lead: number[] = [];
  constructor(public user: string, public level: number, public src?: string) {}

  async start() {
    const C = (this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)());
    this.master = C.createGain(); this.master.gain.value = 0.6;
    this.an = C.createAnalyser(); this.an.fftSize = 1024; this.an.smoothingTimeConstant = 0.8;
    this.master.connect(this.an); this.an.connect(C.destination);
    this.buf = new Uint8Array(this.an.frequencyBinCount);
    if (C.state === 'suspended') await C.resume();
    if (this.src) {
      const el = (this.el = new Audio(this.src)); el.loop = true;
      C.createMediaElementSource(el).connect(this.master);
      await el.play(); return;
    }
    const nb = (this.noiseBuf = C.createBuffer(1, C.sampleRate, C.sampleRate)), d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const r = rng(hash(this.user));
    this.root = 36 + Math.floor(r() * 7);
    this.prog = [0, 5, 3, 4].map((x) => (r() < 0.3 ? x + 1 : x));
    this.bassP = Array.from({ length: 16 }, (_, i) => i % 4 === 0 || r() < 0.3);
    this.lead = Array.from({ length: 16 }, () => Math.floor(r() * 5));
    this.spb = 60 / (68 + this.level * 7) / 4;
    this.t0 = C.currentTime; this.next = C.currentTime + 0.05;
    this.timer = setInterval(() => this.tick(), 25);
  }
  tick() { while (this.next < this.ctx.currentTime + 0.15) { this.play(this.step++, this.next); this.next += this.spb; } }
  pause() { return this.el ? Promise.resolve(this.el.pause()) : this.ctx.suspend(); }
  resume() { return this.el ? this.el.play() : this.ctx.resume(); }
  running() { return this.el ? !this.el.paused : this.ctx.state === 'running'; }
  stop() { clearInterval(this.timer); this.el?.pause(); this.ctx?.close(); }
  duration() { return this.el && isFinite(this.el.duration) ? this.el.duration : 252; }
  time() { return this.el ? this.el.currentTime : (this.ctx.currentTime - this.t0) % 252; }
  freq() { this.an.getByteFrequencyData(this.buf); return this.buf; }
  bass() { this.an.getByteFrequencyData(this.buf); let s = 0; for (let i = 1; i <= 5; i++) s += this.buf[i]; return s / 5 / 255; }

  tone(type: OscillatorType, f: number, t: number, d: number, g: number, cut = 4000) {
    const C = this.ctx, o = C.createOscillator(), v = C.createGain(), fl = C.createBiquadFilter();
    o.type = type; o.frequency.value = f; fl.type = 'lowpass'; fl.frequency.value = cut;
    v.gain.setValueAtTime(0.0001, t); v.gain.linearRampToValueAtTime(g, t + 0.01); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(fl); fl.connect(v); v.connect(this.master); o.start(t); o.stop(t + d + 0.05);
  }
  noise(t: number, d: number, g: number, hp: number) {
    const C = this.ctx, s = C.createBufferSource(), v = C.createGain(), fl = C.createBiquadFilter();
    s.buffer = this.noiseBuf; fl.type = 'highpass'; fl.frequency.value = hp;
    v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(0.0001, t + d);
    s.connect(fl); fl.connect(v); v.connect(this.master); s.start(t); s.stop(t + d);
  }
  kick(t: number) {
    const o = this.ctx.createOscillator(), v = this.ctx.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    v.gain.setValueAtTime(0.9, t); v.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    o.connect(v); v.connect(this.master); o.start(t); o.stop(t + 0.3);
  }
  play(s: number, t: number) {
    const k = s % 16, bar = Math.floor(s / 16) % 4, T = this.level, root = this.root + degree(this.prog[bar]);
    if (k % 4 === 0) this.kick(t);
    if (T >= 3 && (k === 4 || k === 12)) this.noise(t, 0.14, 0.35, 1200);
    if (T >= 2 && k % 2 === 0) this.noise(t, 0.04, 0.12, 7000);
    if (T >= 5 && k % 2 === 1) this.noise(t, 0.03, 0.06, 8000);
    if (this.bassP[k]) this.tone('sawtooth', mtof(root), t, this.spb * 1.8, 0.25, 500 + T * 110);
    if (T >= 3 && k % 2 === 0) this.tone(T >= 7 ? 'sawtooth' : 'square', mtof(root + 24 + degree(this.lead[k] * 2)), t, this.spb * 1.5, 0.07, 1800 + T * 280);
    if (T >= 4 && k === 0) [0, 2, 4].forEach((d) => this.tone('triangle', mtof(root + 12 + degree(d)), t, this.spb * 15, 0.06, 1500));
    if (T >= 8 && k % 4 === 2) this.tone('sine', mtof(root + 36), t, this.spb * 3, 0.05);
  }
}
