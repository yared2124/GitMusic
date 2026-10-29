// lib/poem.ts  -- pure function, no network, no AI call: costs nothing, runs on server or in the browser.
import type { Analysis, MusicSpec } from './analyze';

export type Poem = { title: string; stanzas: { tag: string; lines: string[] }[]; lines: string[] };

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const IMAGE: Record<string, string> = {
  phrygian: 'shadow', aeolian: 'rain', dorian: 'twilight',
  mixolydian: 'golden dust', lydian: 'morning mist', ionian: 'open sky',
};

function rng(seed: number) {            // mulberry32: same user, same poem
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function writePoem(a: Analysis, s: MusicSpec): Poem {
  const r = rng(s.seed);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(r() * arr.length)];

  const lang = a.langs[0]?.name ?? 'code';
  const img = IMAGE[s.modeName] ?? 'starlight';
  const day = DAYS[Math.max(0, a.weekPattern.indexOf(Math.max(...a.weekPattern)))];
  const n = a.longestStreak;

  const who = pick([
    [`In ${lang} you shape the night,`, `where ${img} turns into light.`],
    [`Meet ${a.login}, a ${lang} mind,`, `leaving ${img} far behind.`],
    [`Out of ${lang}, line by line,`, `you make the ${img} shine.`],
  ]);

  const quiet = a.total < 20;          // brand-new or private-heavy profiles get a gentle "beginning" verse

  const rhythm =
    quiet
      ? [`The page is fresh, the song is new,`, `and the first note belongs to you.`]
    : a.burstiness > 0.6
      ? pick([[`Some weeks are silent, soft and slow,`, `then storms of commits start to flow.`],
              [`Long calm, then a thunder sound,`, `a burst of code and joy abound.`]])
      : a.consistency > 0.5
      ? pick([[`Day by day the keys keep time,`, `a patient, steady, rolling rhyme.`],
              [`Most days you show up, calm and true,`, `and ${a.total} small steps came through.`]])
      : pick([[`Some days a whisper, some days loud,`, `you build your way beneath the cloud.`],
              [`${a.total} steps in a year, you see,`, `each one a note of what could be.`]]);

  const streak =
    n >= 14 ? [`${n} days without a break,`, `what a streak you chose to make.`]
    : n >= 5 ? [`${n} days in a row you came,`, `and every day you kept the flame.`]
    : [`Even pauses are part of the tune,`, `you always return like the moon.`];

  const when =
    quiet
      ? [`Any day is a day to start,`, `every line a work of art.`]
    : a.weekendShare >= 0.25
      ? [`Even weekends hear you play,`, `building at the edge of day.`]
      : [`${day}s are when your code comes alive,`, `that's when the best ideas arrive.`];

  const trend =
    a.trend > 0.2 ? [`And lately the tempo's climbing higher,`, `your code is a rising fire.`]
    : a.trend < -0.2 ? [`Lately the pace is soft and low,`, `but quiet rivers always flow.`]
    : [`The pace holds firm, the pulse stays true,`, `there's always something left to do.`];

  const chorus = [`Every push is a heartbeat,`, `every merge a little song,`, `every commit hums a note,`, `and the whole year sings along.`];
  const outro = [`This one's yours, ${a.login}, hear it play,`, `your code is music every day.`];

  const stanzas = [
    { tag: 'Verse 1', lines: [...who, ...rhythm] },
    { tag: 'Chorus', lines: chorus },
    { tag: 'Verse 2', lines: [...streak, ...when] },
    { tag: 'Chorus', lines: chorus },
    { tag: 'Bridge', lines: trend },
    { tag: 'Outro', lines: outro },
  ];
  const title = `${a.login}'s ${img[0].toUpperCase() + img.slice(1)} Song`;
  return { title, stanzas, lines: stanzas.flatMap((x) => x.lines) };
}