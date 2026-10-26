# GitMusice

GitMusice turns a public GitHub profile into a personalized music identity. It analyzes contribution patterns, ranks a developer by contribution volume, assigns a tier, and generates a dynamic audio identity with a profile page and README badge.

Built with Next.js, TypeScript, and Tailwind CSS, GitMusice is designed to showcase how coding activity can be translated into a visual and sonic profile.

## Features

- Personalized developer profile pages for any public GitHub username
- Contribution-based tier system with progression and leaderboards-style naming
- Dynamic audio track and visual identity tied to each tier
- Animated SVG README badge for embedding in profiles or project docs
- Open Graph preview card support for social sharing
- IP-based request throttling via Upstash Redis
- Cached GitHub profile data with graceful fallback behavior

## Live product concept

GitMusice generates a unique identity for a GitHub user by combining:

- contribution totals
- repository and follower metadata
- tier progression
- a generated soundtrack and waveform-inspired UI
- a shareable badge and social preview

## Tech stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- GitHub REST/GraphQL APIs
- Upstash Redis for rate limiting and caching
- Vercel deployment

## Project structure

```text
.
├── app/
│   ├── api/
│   │   └── badge/[username]/route.ts
│   ├── [username]/
│   │   ├── not-found.tsx
│   │   ├── opengraph-image.tsx
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── HeroSearch.tsx
│   ├── Nav.tsx
│   ├── PreviewPlayer.tsx
│   ├── Profile.tsx
│   ├── TierLadder.tsx
│   └── tierIcons.ts
├── lib/
│   ├── audio.ts
│   ├── github.ts
│   ├── redis.ts
│   └── tiers.ts
├── public/
│   └── tracks/
├── .env.example
├── middleware.ts
├── next-env.d.ts
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Getting started

### Prerequisites

- Node.js 18+
- npm
- A GitHub token (optional but recommended for better contribution accuracy)
- Upstash Redis (optional for production-grade rate limiting and caching)

### Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Then open:

- http://localhost:3000
- http://localhost:3000/torvalds

### Environment variables

The project includes a sample configuration in `.env.example`.

```env
# GitHub: exact all-time contributions + 5000 req/hour. No scopes needed.
GITHUB_TOKEN=

# Redis (Upstash, or Vercel Marketplace > Upstash which sets KV_REST_API_URL / KV_REST_API_TOKEN automatically).
# Without these the app still runs, using in-memory cache and no rate limiting.
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Public origin used for social preview image URLs, e.g. https://gitmusice.pro.et
NEXT_PUBLIC_SITE_URL=
```

Notes:

- `GITHUB_TOKEN` is strongly recommended for more reliable GitHub contribution collection.
- Without Redis, the app still works locally but rate limiting and distributed caching are disabled.
- `NEXT_PUBLIC_SITE_URL` is used for absolute URL generation and social cards.

## Routes

- `/` — landing page
- `/[username]` — user profile page
- `/[username]/opengraph-image` — social preview image
- `/api/badge/[username]` — animated SVG badge for README embedding

## Deployment

### Vercel

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add Upstash Redis from the Vercel Storage tab or configure the environment variables manually.
4. Add the required environment variables in Vercel:
   - `GITHUB_TOKEN`
   - `NEXT_PUBLIC_SITE_URL`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
5. Configure your custom domain and DNS records as prompted by Vercel.

### GitHub Actions deployment

The deployment workflow runs on pushes to `main` or `master`. It uses the GitHub Actions `production` environment, so configure these secrets in **Repository Settings > Environments > production** (or as repository Actions secrets):

- `VERCEL_TOKEN` — a Vercel access token
- `VERCEL_ORG_ID` — the Vercel team or account ID
- `VERCEL_PROJECT_ID` — the Vercel project ID

You can find the organization and project IDs in the linked Vercel project's settings or its `.vercel/project.json` file. The workflow checks that all three secrets are present before attempting deployment.

### Production checks

After deployment, verify the following:

- `/torvalds` loads correctly
- an invalid username returns a real 404
- badge generation works at `/api/badge/[username]`
- social preview cards render correctly
- rate limiting does not block legitimate traffic unexpectedly

## Audio files

The app supports tier-based audio playback. Procedural audio runs by default, and custom licensed tracks can be placed in `public/tracks/` using the tier keys such as:

- afk
- chill
- hustler
- grinder
- titan
- legend
- mythic
- demigod
- immortal
- goat

## Contributing

Contributions are welcome. To propose changes:

1. Fork the repository
2. Create a feature branch
3. Commit your improvements
4. Open a pull request with a clear explanation of the change

## License

This project is provided as-is for educational and personal use. Add a license file if you plan to distribute it publicly.

## Acknowledgements

- GitHub public profile data
- Vercel platform
- Upstash Redis
- Next.js and the open-source ecosystem behind the app
