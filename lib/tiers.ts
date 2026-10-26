export const TIERS = [
  { n: 1,  key: 'afk',      name: 'AFK',      min: 0,     color: '#9ca3af', icon: 'Moon',     track: 'Idle Connection Lost' },
  { n: 2,  key: 'chill',    name: 'CHILL',    min: 1,     color: '#4ade80', icon: 'Coffee',   track: 'Lo-Fi Pull Request' },
  { n: 3,  key: 'hustler',  name: 'HUSTLER',  min: 500,   color: '#a855f7', icon: 'Zap',      track: 'Side Project Season' },
  { n: 4,  key: 'grinder',  name: 'GRINDER',  min: 1501,  color: '#f97316', icon: 'Flame',    track: 'Green Square Grind' },
  { n: 5,  key: 'titan',    name: 'TITAN',    min: 3001,  color: '#f43f5e', icon: 'Swords',   track: 'Merge Conflict Warfare' },
  { n: 6,  key: 'legend',   name: 'LEGEND',   min: 5000,  color: '#22d3ee', icon: 'Crown',    track: 'Commit After Midnight' },
  { n: 7,  key: 'mythic',   name: 'MYTHIC',   min: 10000, color: '#e879f9', icon: 'Gem',      track: 'Infinite Loop Symphony' },
  { n: 8,  key: 'demigod',  name: 'DEMIGOD',  min: 15001, color: '#34d399', icon: 'Sparkles', track: 'Plasma Compiler' },
  { n: 9,  key: 'immortal', name: 'IMMORTAL', min: 20000, color: '#ef4444', icon: 'Eye',      track: 'The Streak Never Ends' },
  { n: 10, key: 'goat',     name: 'GOAT',     min: 25000, color: '#facc15', icon: 'Trophy',   track: 'Greatest Of All Commits' },
];
export function getTier(c: number) {
  let i = 0;
  TIERS.forEach((t, k) => { if (c >= t.min) i = k; });
  return { cur: TIERS[i], next: TIERS[i + 1] || null, idx: i };
}
