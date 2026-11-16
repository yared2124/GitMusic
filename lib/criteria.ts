export interface CriterionResult {
  key: 'SHP' | 'CON' | 'RNG' | 'DEP' | 'IMP' | 'COL';
  name: string;
  score: number; // 15 to 100
  weight: number;
  metric: string;
  description: string;
}

export interface ClassicalTier {
  id: number;
  level: number;
  minScore: number;
  maxScore: number;
  title: string;
  movement: string;
  tempoBpm: number;
  keySignature: string;
  color: string;
  badge: string;
  instruments: string[];
  description: string;
}

export interface DeveloperEvaluation {
  overallScore: number; // 15 to 100
  ratingTitle: string;
  criteria: CriterionResult[];
  classicalTier: ClassicalTier;
  stats: {
    contributions: number;
    repos: number;
    followers: number;
    stars: number;
    forks: number;
    languages: string[];
    yearsActive: number;
  };
}

export const CLASSICAL_TIERS: ClassicalTier[] = [
  {
    id: 1,
    level: 1,
    minScore: 15,
    maxScore: 34,
    title: 'Nocturne No. 1 in C Minor: The First Stanza',
    movement: 'Adagio Tranquillo (64 BPM)',
    tempoBpm: 64,
    keySignature: 'C Minor',
    color: '#9ca3af',
    badge: 'ADAGIO · 15-34%',
    instruments: ['Solo Acoustic Piano', 'Gentle Cellist Tone'],
    description: 'A quiet, contemplative solitary piano nocturne. Spacious and meditative.',
  },
  {
    id: 2,
    level: 2,
    minScore: 35,
    maxScore: 54,
    title: "Sonata in G Major: The Artisan's Flow",
    movement: 'Andante Cantabile (78 BPM)',
    tempoBpm: 78,
    keySignature: 'G Major',
    color: '#38bdf8',
    badge: 'ANDANTE · 35-54%',
    instruments: ['Alberti Bass Piano', 'Cello Counterpoint', 'Warm Chamber Flute'],
    description: 'A melodious classical chamber sonata with graceful counterpoint and steady rhythmic flow.',
  },
  {
    id: 3,
    level: 3,
    minScore: 55,
    maxScore: 74,
    title: 'Concerto in D Minor: The Polyphonic Architect',
    movement: 'Allegro Vivace (98 BPM)',
    tempoBpm: 98,
    keySignature: 'D Minor',
    color: '#a855f7',
    badge: 'ALLEGRO · 55-74%',
    instruments: ['Concert Grand Piano', 'String Quartet', 'Baroque Cello', 'Harpsichord Arpeggios'],
    description: 'A lively, spirited classical concerto with rich counterpoint and intricate multi-part polyphony.',
  },
  {
    id: 4,
    level: 4,
    minScore: 75,
    maxScore: 89,
    title: "Maestro's Rhapsody in B Minor: Elevation",
    movement: 'Vivace con Spirito (114 BPM)',
    tempoBpm: 114,
    keySignature: 'B Minor',
    color: '#f59e0b',
    badge: 'MAESTRO · 75-89%',
    instruments: ['Virtuoso Piano Arpeggios', 'Symphonic String Ensemble', 'Cello Ostinato', 'Violin Flourish'],
    description: 'An opulent, soaring romantic rhapsody with lush harmonic sweeps and dramatic classical polyphony.',
  },
  {
    id: 5,
    level: 5,
    minScore: 90,
    maxScore: 100,
    title: 'Symphonia Grandiosa: Opus Magnum of the Masters',
    movement: 'Presto Maestoso (126 BPM)',
    tempoBpm: 126,
    keySignature: 'C Major',
    color: '#facc15',
    badge: 'OPUS MAGNUM · 90-100%',
    instruments: ['Grand Concert Piano', 'Full Symphonic Strings', 'Triumphant Horn Cadences', 'Virtuosic Arpeggios'],
    description: 'A triumphant, virtuoso masterpiece symphony reserved for world-class legends and open-source titans.',
  },
];

export function getClassicalTier(score: number): ClassicalTier {
  const s = Math.max(15, Math.min(100, Math.round(score)));
  for (let i = CLASSICAL_TIERS.length - 1; i >= 0; i--) {
    if (s >= CLASSICAL_TIERS[i].minScore) {
      return CLASSICAL_TIERS[i];
    }
  }
  return CLASSICAL_TIERS[0];
}

export function evaluateDeveloper(data: {
  login: string;
  contributions: number;
  repos: number;
  followers: number;
  following?: number;
  createdAt?: string;
  stars?: number;
  forks?: number;
  languages?: string[];
}): DeveloperEvaluation {
  const c = Math.max(0, data.contributions || 0);
  const r = Math.max(0, data.repos || 0);
  const f = Math.max(0, data.followers || 0);
  const stars = Math.max(0, data.stars || 0);
  const forks = Math.max(0, data.forks || 0);
  const langs = data.languages || [];

  // Account age in years
  let yearsActive = 1;
  if (data.createdAt) {
    const ms = Date.now() - new Date(data.createdAt).getTime();
    yearsActive = Math.max(0.5, Math.round((ms / (365.25 * 86400000)) * 10) / 10);
  }

  // 1. SHP - Shipping (Commits volume, deployments, repo throughput)
  // Base 15, scales with contributions & repos
  const shpScore = Math.max(
    15,
    Math.min(99, Math.round(15 + Math.min(65, Math.log10(c + 1) * 20) + Math.min(20, r * 0.8)))
  );

  // 2. CON - Consistency (Active cadence, commit density)
  const commitsPerRepo = r > 0 ? c / r : c;
  const conScore = Math.max(
    15,
    Math.min(
      99,
      Math.round(
        15 +
          Math.min(55, Math.log10(c + 1) * 16) +
          Math.min(30, Math.log10(commitsPerRepo + 1) * 12)
      )
    )
  );

  // 3. RNG - Range (Language breadth & tech stack variety)
  const langCount = langs.length > 0 ? langs.length : Math.min(6, Math.max(1, Math.round(r / 3)));
  let rngScore = 15;
  if (langCount <= 1) rngScore = 28;
  else if (langCount === 2) rngScore = 48;
  else if (langCount === 3) rngScore = 65;
  else if (langCount === 4) rngScore = 78;
  else if (langCount <= 6) rngScore = 88;
  else rngScore = 96;

  // 4. DEP - Depth (Account age, repository lifespan & scale)
  const depScore = Math.max(
    15,
    Math.min(
      99,
      Math.round(
        15 +
          Math.min(50, yearsActive * 9) +
          Math.min(35, Math.log10(r + 1) * 18)
      )
    )
  );

  // 5. IMP - Impact (Stars, forks, followers)
  const impactMetric = f * 2 + stars * 3 + forks * 4;
  const impScore = Math.max(
    15,
    Math.min(
      99,
      Math.round(
        15 + (impactMetric > 0 ? Math.min(84, Math.log10(impactMetric + 1) * 26) : Math.min(25, f * 3))
      )
    )
  );

  // 6. COL - Collab (Collaboration, community ties, forks & ecosystem)
  const collabMetric = forks * 3 + (data.following || 0) * 0.5 + Math.min(50, r * 1.5);
  const colScore = Math.max(
    15,
    Math.min(
      99,
      Math.round(15 + Math.min(84, Math.log10(collabMetric + 1) * 28))
    )
  );

  // Compute Overall Score out of 100% (Minimum is strictly 15)
  const weighted =
    shpScore * 0.25 +
    conScore * 0.20 +
    rngScore * 0.15 +
    depScore * 0.15 +
    impScore * 0.15 +
    colScore * 0.10;

  const overallScore = Math.max(15, Math.min(100, Math.round(weighted)));

  let ratingTitle = 'Novice Developer';
  if (overallScore >= 90) {
    ratingTitle = 'Grand Master / Titan';
  } else if (overallScore >= 75) {
    ratingTitle = 'Maestro Architect';
  } else if (overallScore >= 55) {
    ratingTitle = 'Virtuoso Engineer';
  } else if (overallScore >= 35) {
    ratingTitle = 'Artisan Craftsman';
  }

  const criteria: CriterionResult[] = [
    {
      key: 'SHP',
      name: 'Shipping',
      score: shpScore,
      weight: 25,
      metric: `${c.toLocaleString('en-US')} commits · ${r} repositories`,
      description: 'Commits, pull requests, releases, and deployed projects.',
    },
    {
      key: 'CON',
      name: 'Consistency',
      score: conScore,
      weight: 20,
      metric: `${Math.round(commitsPerRepo)} commits/repo avg`,
      description: 'Commit cadence, streaks, and continuous momentum over time.',
    },
    {
      key: 'RNG',
      name: 'Range',
      score: rngScore,
      weight: 15,
      metric: `${langCount} primary languages`,
      description: 'Stack diversity across multiple programming languages.',
    },
    {
      key: 'DEP',
      name: 'Depth',
      score: depScore,
      weight: 15,
      metric: `${yearsActive} yrs on GitHub · ${r} repos`,
      description: 'Longevity, codebase size, and repository endurance.',
    },
    {
      key: 'IMP',
      name: 'Impact',
      score: impScore,
      weight: 15,
      metric: `${stars} stars · ${f} followers`,
      description: 'Community resonance, stars, forks, and followers.',
    },
    {
      key: 'COL',
      name: 'Collab',
      score: colScore,
      weight: 10,
      metric: `${forks} forks · community flow`,
      description: 'Open source collaboration, multi-repo work, and reviews.',
    },
  ];

  const classicalTier = getClassicalTier(overallScore);

  return {
    overallScore,
    ratingTitle,
    criteria,
    classicalTier,
    stats: {
      contributions: c,
      repos: r,
      followers: f,
      stars,
      forks,
      languages: langs,
      yearsActive,
    },
  };
}
