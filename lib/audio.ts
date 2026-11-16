// Classical Procedural Symphony Engine & Web Audio synthesizer
// Synthesizes rich acoustic piano, warm cellos, violins, and orchestral classical counterpoint
// dynamically scaled according to the developer's score (15% to 100%).

function hash(s: string) {
  let h = 2166136261;
  for (const c of s) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

const mtof = (m: number) => 440 * 2 ** ((m - 69) / 12);

// Classical scales: Natural Minor, Harmonic Minor, and Classical Major
const MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]; // Natural minor
const HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11]; // Harmonic minor with leading tone
const MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]; // Classical major

function getScaleDegree(degree: number, harmonic: boolean = false, isMajor: boolean = false): number {
  const scale = isMajor ? MAJOR_SCALE : harmonic ? HARMONIC_MINOR : MINOR_SCALE;
  const len = scale.length;
  const oct = Math.floor(degree / len);
  const idx = ((degree % len) + len) % len;
  return scale[idx] + oct * 12;
}

export class Engine {
  ctx!: AudioContext;
  master!: GainNode;
  reverbGain!: GainNode;
  an!: AnalyserNode;
  buf!: Uint8Array;
  el: HTMLAudioElement | null = null;
  timer: any;
  t0 = 0;
  next = 0;
  step = 0;
  spb = 0.125; // seconds per 16th note beat
  root = 48; // Middle C or D
  isMajor = false;
  progression: number[][] = [];
  theme: number[] = [];
  flourishes: number[] = [];
  score: number = 50;

  constructor(
    public user: string,
    public level: number = 5,
    public src?: string,
    scoreOverride?: number
  ) {
    this.score = scoreOverride ?? Math.min(100, Math.max(15, 15 + level * 8));
  }

  async start() {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const C = (this.ctx = new AudioCtx());

    this.master = C.createGain();
    this.master.gain.value = 0.65;

    // Analyser node for live visualizer
    this.an = C.createAnalyser();
    this.an.fftSize = 1024;
    this.an.smoothingTimeConstant = 0.85;

    this.master.connect(this.an);
    this.an.connect(C.destination);
    this.buf = new Uint8Array(this.an.frequencyBinCount);

    if (C.state === 'suspended') {
      await C.resume();
    }

    // If an external licensed track exists in /public/tracks/[tier].mp3
    if (this.src) {
      const el = (this.el = new Audio(this.src));
      el.loop = true;
      try {
        const source = C.createMediaElementSource(el);
        source.connect(this.master);
      } catch {}
      await el.play();
      return;
    }

    // Classical Music Generator based on user hash & score
    const r = rng(hash(this.user));
    const s = Math.max(15, Math.min(100, this.score));

    // Major key for triumphant high scores, rich minor for dramatic/poetic pieces
    this.isMajor = s >= 85 ? r() > 0.4 : s >= 50 ? r() > 0.6 : false;

    // Base root MIDI note (e.g. C3 = 48, D3 = 50, Eb3 = 51, G3 = 43)
    const roots = this.isMajor ? [48, 53, 55] : [48, 50, 45, 43];
    this.root = roots[Math.floor(r() * roots.length)];

    // Classical Harmonic Progressions:
    // Minor: i - VI - III - VII or i - iv - V7 - i
    // Major: I - V - vi - IV or I - IV - V - I
    if (this.isMajor) {
      this.progression = [
        [0, 4, 7], // I
        [7, 11, 14], // V
        [9, 12, 16], // vi
        [5, 9, 12], // IV
      ];
    } else {
      this.progression = [
        [0, 3, 7], // i
        [8, 12, 15], // VI
        [5, 8, 12], // iv
        [7, 11, 14], // V7 (harmonic)
      ];
    }

    // Melodic Motifs (16-step classical melody phrase)
    this.theme = Array.from({ length: 16 }, (_, i) => {
      if (i % 4 === 0) return 0;
      if (i % 2 === 0) return Math.floor(r() * 4) + 1;
      return Math.floor(r() * 6);
    });

    this.flourishes = Array.from({ length: 16 }, () => Math.floor(r() * 5));

    // Tempo based on classical tier:
    // 15-34% : Adagio (64 BPM)
    // 35-54% : Andante (78 BPM)
    // 55-74% : Allegro (98 BPM)
    // 75-89% : Vivace (114 BPM)
    // 90-100%: Presto Maestoso (126 BPM)
    let bpm = 64;
    if (s >= 90) bpm = 126;
    else if (s >= 75) bpm = 114;
    else if (s >= 55) bpm = 98;
    else if (s >= 35) bpm = 78;

    this.spb = 60 / bpm / 4; // duration of a 16th note
    this.t0 = C.currentTime;
    this.next = C.currentTime + 0.05;
    this.timer = setInterval(() => this.tick(), 25);
  }

  tick() {
    while (this.next < this.ctx.currentTime + 0.18) {
      this.playStep(this.step++, this.next);
      this.next += this.spb;
    }
  }

  // Play a natural classical piano note
  piano(midi: number, t: number, dur: number, vel: number = 0.35) {
    if (!this.ctx) return;
    const C = this.ctx;
    const f = mtof(midi);

    // Fundamental partial
    const o1 = C.createOscillator();
    const g1 = C.createGain();
    o1.type = 'sine';
    o1.frequency.setValueAtTime(f, t);

    // Octave overtone (adds acoustic resonance)
    const o2 = C.createOscillator();
    const g2 = C.createGain();
    o2.type = 'sine';
    o2.frequency.setValueAtTime(f * 2, t);

    // Subtle 3rd harmonic (triangle for wood hammer warmth)
    const o3 = C.createOscillator();
    const g3 = C.createGain();
    o3.type = 'triangle';
    o3.frequency.setValueAtTime(f * 3, t);

    // Dynamic lowpass filter to emulate piano string dampening
    const flt = C.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(Math.min(7500, f * 3.5), t);
    flt.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.1), t + dur * 0.8);

    // Piano Envelope: instant hammer strike (3ms), natural decay
    g1.gain.setValueAtTime(0.0001, t);
    g1.gain.linearRampToValueAtTime(vel * 0.45, t + 0.003);
    g1.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(vel * 0.22, t + 0.003);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.7);

    g3.gain.setValueAtTime(0.0001, t);
    g3.gain.linearRampToValueAtTime(vel * 0.08, t + 0.003);
    g3.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.45);

    o1.connect(g1); g1.connect(flt);
    o2.connect(g2); g2.connect(flt);
    o3.connect(g3); g3.connect(flt);
    flt.connect(this.master);

    o1.start(t); o1.stop(t + dur + 0.05);
    o2.start(t); o2.stop(t + dur + 0.05);
    o3.start(t); o3.stop(t + dur + 0.05);
  }

  // Play a bowed cello / double bass string with natural vibrato
  cello(midi: number, t: number, dur: number, vel: number = 0.28) {
    if (!this.ctx) return;
    const C = this.ctx;
    const f = mtof(midi);

    const o = C.createOscillator();
    const g = C.createGain();
    const flt = C.createBiquadFilter();

    // Natural classical vibrato
    const lfo = C.createOscillator();
    const lfoG = C.createGain();
    lfo.frequency.value = 5.2; // 5.2 Hz vibrato
    lfoG.gain.value = f * 0.012;
    lfo.connect(o.frequency);

    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f, t);

    // Warm string filter
    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(750, t);

    // Bowing attack (100ms) and warm decay
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.4, t + 0.09);
    g.gain.setValueAtTime(vel * 0.35, t + dur - 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);

    o.connect(flt);
    flt.connect(g);
    g.connect(this.master);

    lfo.start(t); lfo.stop(t + dur + 0.15);
    o.start(t); o.stop(t + dur + 0.15);
  }

  // Play violin / high string quartet note with expressive vibrato
  violin(midi: number, t: number, dur: number, vel: number = 0.2) {
    if (!this.ctx) return;
    const C = this.ctx;
    const f = mtof(midi);

    const o = C.createOscillator();
    const g = C.createGain();
    const flt = C.createBiquadFilter();

    const lfo = C.createOscillator();
    const lfoG = C.createGain();
    lfo.frequency.value = 5.6;
    lfoG.gain.value = f * 0.015;
    lfo.connect(o.frequency);

    o.type = 'sawtooth';
    o.frequency.setValueAtTime(f, t);

    flt.type = 'lowpass';
    flt.frequency.setValueAtTime(1800, t);

    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vel * 0.3, t + 0.06);
    g.gain.setValueAtTime(vel * 0.28, t + dur - 0.06);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.06);

    o.connect(flt);
    flt.connect(g);
    g.connect(this.master);

    lfo.start(t); lfo.stop(t + dur + 0.12);
    o.start(t); o.stop(t + dur + 0.12);
  }

  // Play classical step according to score tier
  playStep(step: number, t: number) {
    const k = step % 16; // 16th note position in bar
    const bar = Math.floor(step / 16) % 4; // 4-bar progression loop
    const chord = this.progression[bar];
    const s = this.score;

    const baseMidi = this.root;
    const chordRoot = baseMidi + chord[0];
    const chordThird = baseMidi + chord[1];
    const chordFifth = baseMidi + chord[2];

    // ==========================================
    // Tier 1: 15% - 34% (Adagio / First Nocturne)
    // Minimalist, meditative solo piano with gentle space
    // ==========================================
    if (s < 35) {
      // Gentle chord notes on downbeats (beats 0 and 8)
      if (k === 0) {
        this.piano(chordRoot - 12, t, this.spb * 12, 0.45); // Deep bass note
        this.piano(chordRoot, t, this.spb * 10, 0.35);
        this.piano(chordThird, t + 0.02, this.spb * 8, 0.28);
        this.piano(chordFifth, t + 0.04, this.spb * 8, 0.25);
      } else if (k === 8) {
        this.piano(chordFifth - 12, t, this.spb * 7, 0.3);
        this.piano(chordThird, t, this.spb * 6, 0.22);
      }
      // Contemplative right-hand classical melody notes
      if (k === 4 || k === 12) {
        const deg = this.theme[k];
        const m = chordRoot + 12 + getScaleDegree(deg, true, this.isMajor);
        this.piano(m, t, this.spb * 5, 0.3);
      }
      return;
    }

    // ==========================================
    // Tier 2: 35% - 54% (Andante Cantabile / Artisan's Sonata)
    // Classical Alberti Bass (Root - 5th - 3rd - 5th) + melody + cello root
    // ==========================================
    if (s < 55) {
      // Cello warm foundation on beat 0
      if (k === 0) {
        this.cello(chordRoot - 12, t, this.spb * 15, 0.32);
      }
      // Alberti bass in 8th notes (steps 0, 2, 4, 6, 8, 10, 12, 14)
      if (k % 4 === 0) {
        this.piano(chordRoot, t, this.spb * 3, 0.28); // Root
      } else if (k % 4 === 2) {
        this.piano(chordFifth, t, this.spb * 3, 0.22); // Fifth
      }

      // Melodic theme floating on top
      if (k === 0 || k === 4 || k === 7 || k === 10 || k === 13) {
        const deg = this.theme[k];
        const m = chordRoot + 12 + getScaleDegree(deg, true, this.isMajor);
        this.piano(m, t, this.spb * 4, 0.34);
      }
      return;
    }

    // ==========================================
    // Tier 3: 55% - 74% (Allegro Vivace / Polyphonic Concerto)
    // Running piano arpeggios + cello counterpoint + violin melody
    // ==========================================
    if (s < 75) {
      // Cello melodic bassline
      if (k === 0 || k === 8) {
        const celloNote = k === 0 ? chordRoot - 12 : chordFifth - 12;
        this.cello(celloNote, t, this.spb * 7, 0.38);
      } else if (k === 4 || k === 12) {
        this.cello(chordThird - 12, t, this.spb * 3.5, 0.28);
      }

      // Rolling classical arpeggio (16th notes)
      const arpNotes = [chordRoot, chordThird, chordFifth, chordRoot + 12];
      const note = arpNotes[k % 4];
      this.piano(note, t, this.spb * 2.2, 0.24);

      // Violin counterpoint melody
      if (k % 2 === 0 && (k === 2 || k === 6 || k === 10 || k === 14)) {
        const deg = this.theme[k];
        const vm = chordRoot + 12 + getScaleDegree(deg, true, this.isMajor);
        this.violin(vm, t, this.spb * 3.5, 0.25);
      }
      return;
    }

    // ==========================================
    // Tier 4: 75% - 89% (Maestro's Rhapsody / Elevation)
    // Virtuosic rolling piano + lush string ensemble + cello ostinato + violin flourish
    // ==========================================
    if (s < 90) {
      // Grand cello foundation
      if (k === 0) {
        this.cello(chordRoot - 24, t, this.spb * 16, 0.45);
        this.cello(chordRoot - 12, t, this.spb * 16, 0.38);
      } else if (k === 8) {
        this.cello(chordFifth - 12, t, this.spb * 8, 0.35);
      }

      // Virtuoso Piano Arpeggio (sweeping classical harp/piano runs)
      const rhapsodyPattern = [
        chordRoot,
        chordFifth,
        chordThird + 12,
        chordRoot + 12,
        chordFifth + 12,
        chordThird + 24,
        chordRoot + 24,
        chordFifth + 12,
      ];
      this.piano(rhapsodyPattern[k % 8], t, this.spb * 1.8, 0.28);

      // Romantic Violin Melody with sweeping vibrato
      if (k === 0 || k === 3 || k === 6 || k === 9 || k === 12) {
        const deg = this.theme[k];
        const vm = chordRoot + 12 + getScaleDegree(deg + 2, true, this.isMajor);
        this.violin(vm, t, this.spb * 4.2, 0.32);
      }
      return;
    }

    // ==========================================
    // Tier 5: 90% - 100% (Symphonia Grandiosa / Opus Magnum)
    // Triumphant full symphonic orchestra: grand piano cascades, soaring violins, majestic cello
    // ==========================================
    // Full symphonic string section
    if (k === 0) {
      this.cello(chordRoot - 24, t, this.spb * 16, 0.5); // Double bass
      this.cello(chordRoot - 12, t, this.spb * 16, 0.42); // Cello
      this.violin(chordFifth + 12, t, this.spb * 16, 0.35); // Viola/Violin harmony
    } else if (k === 8) {
      this.cello(chordFifth - 12, t, this.spb * 8, 0.4);
      this.violin(chordThird + 12, t, this.spb * 8, 0.32);
    }

    // Cascading grand concert piano runs (16th-note virtuoso sweeps)
    const grandScale = [
      chordRoot - 12,
      chordFifth,
      chordRoot,
      chordThird,
      chordFifth,
      chordRoot + 12,
      chordThird + 12,
      chordFifth + 12,
      chordRoot + 24,
      chordThird + 24,
      chordFifth + 24,
      chordRoot + 12,
      chordFifth + 12,
      chordThird + 12,
      chordRoot + 12,
      chordFifth,
    ];
    this.piano(grandScale[k], t, this.spb * 1.9, 0.32);

    // Triumphant soaring violin theme
    if (k % 2 === 0) {
      const deg = this.theme[k];
      const vm = chordRoot + 24 + getScaleDegree(deg, true, this.isMajor);
      this.violin(vm, t, this.spb * 3.8, 0.36);
    }
  }

  pause() {
    return this.el ? Promise.resolve(this.el.pause()) : this.ctx.suspend();
  }

  resume() {
    return this.el ? this.el.play() : this.ctx.resume();
  }

  running() {
    return this.el ? !this.el.paused : this.ctx?.state === 'running';
  }

  stop() {
    clearInterval(this.timer);
    this.el?.pause();
    this.ctx?.close();
  }

  duration() {
    return this.el && isFinite(this.el.duration) ? this.el.duration : 288;
  }

  time() {
    return this.el ? this.el.currentTime : (this.ctx.currentTime - this.t0) % 288;
  }

  freq() {
    if (!this.an) return new Uint8Array(0);
    this.an.getByteFrequencyData(this.buf);
    return this.buf;
  }

  bass() {
    if (!this.an) return 0;
    this.an.getByteFrequencyData(this.buf);
    let s = 0;
    for (let i = 1; i <= 6; i++) s += this.buf[i];
    return s / 6 / 255;
  }
}
