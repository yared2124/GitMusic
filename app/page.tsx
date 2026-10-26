import Link from 'next/link';
import { ArrowRight, Github, Music2, Sparkles } from 'lucide-react';
import HeroSearch from '../components/HeroSearch';
import PreviewPlayer from '../components/PreviewPlayer';

const waveHeights = [22, 36, 52, 31, 64, 43, 25, 56, 70, 38, 60, 29, 48, 67, 34, 54, 23, 45, 62, 32, 50, 40];

export default function Home() {
  return (
    <div className="landing-shell min-h-screen overflow-hidden bg-[#070a0d] text-slate-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-end justify-center gap-0.5 rounded-full border border-lime-300/70 pb-1">
            <i className="h-2 w-0.5 bg-lime-300" />
            <i className="h-3.5 w-0.5 bg-lime-300" />
            <i className="h-2.5 w-0.5 bg-lime-300" />
          </span>
          gitmusice
        </Link>
        <nav className="hidden items-center gap-8 text-xs text-slate-400 sm:flex">
          <a href="#how-it-works" className="transition hover:text-white">How it works</a>
          <a href="#vibes" className="transition hover:text-white">Vibes</a>
          <a href="https://github.com/yared2124/GitMusice" className="flex items-center gap-2 transition hover:text-white">
            <Github className="h-4 w-4" aria-hidden /> GitHub
          </a>
        </nav>
        <a href="#try-it" className="lime-button hidden sm:inline-flex">
          Try it now <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
        <a href="#try-it" className="lime-button px-3 sm:hidden" aria-label="Try it now">
          Try it <ArrowRight className="h-4 w-4" aria-hidden />
        </a>
      </header>

      <main>
        <section className="mx-auto grid min-h-[650px] max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 lg:min-h-[calc(100vh-72px)] lg:grid-cols-[1.08fr_.92fr] lg:gap-16 lg:py-24">
          <div className="relative z-10">
            <p className="eyebrow"><span className="status-dot" /> Your GitHub, remastered</p>
            <h1 className="mt-6 max-w-2xl text-[clamp(3.4rem,7vw,6.6rem)] font-medium leading-[.91] tracking-[-.075em]">
              Your code has<br />a <em className="font-serif font-normal text-lime-300">soundtrack.</em>
            </h1>
            <p className="mt-7 max-w-xl text-lg font-bold leading-8 text-slate-200 sm:text-xl sm:leading-9">
              GitMusice turns your public GitHub activity into a unique musical identity—complete with a vibe, tier, and track made from the way you build.
            </p>
            <div id="try-it" className="mt-8 max-w-xl scroll-mt-8">
              <HeroSearch />
            </div>
            <p className="mt-2 flex items-center gap-2 font-mono text-[10px] tracking-[.12em] text-slate-500">
              <span className="status-dot status-dot-cyan" /> Free to try · No sign-up · Public data only
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[510px] lg:ml-auto">
            <div className="profile-preview">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 font-mono text-[9px] uppercase tracking-[.18em] text-slate-500">
                <span>Live profile / 001</span>
                <span className="flex items-center gap-2"><span className="status-dot status-dot-cyan" /> Analyzed</span>
              </div>
              <div className="flex items-center gap-5 px-6 py-7 sm:px-8">
                <div className="avatar-art" aria-hidden>
                  <span className="avatar-face"><i /><b /><em /></span>
                  <span className="avatar-level">LV. 07</span>
                </div>
                <div>
                  <p className="font-mono text-[10px] text-cyan-300">@theoctocat</p>
                  <p className="mt-2 text-xl tracking-tight sm:text-2xl">Midnight Builder</p>
                  <p className="mt-2 font-mono text-[9px] uppercase tracking-[.16em] text-slate-500">Legend tier · Cyan pulse</p>
                </div>
              </div>
              <div className="border-t border-white/10 px-6 py-5 sm:px-8">
                <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[.18em] text-slate-500">
                  <span>Now playing</span><span>03:42</span>
                </div>
                <p className="mt-3 text-lg tracking-tight">Commit After Midnight</p>
                <div className="mt-4 flex h-14 items-center justify-center gap-[5px]" aria-label="Audio waveform">
                  {waveHeights.map((height, index) => (
                    <span key={index} className="wave-bar" style={{ height: `${height}%`, animationDelay: `${index * 35}ms` }} />
                  ))}
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <PreviewPlayer />
                  <div className="h-[2px] flex-1 bg-white/10"><div className="h-full w-[42%] bg-lime-300" /></div>
                  <span className="font-mono text-[9px] text-slate-500">01:20</span>
                </div>
              </div>
            </div>
            <div className="vibe-tag">
              <Sparkles className="h-4 w-4 text-lime-300" aria-hidden />
              <div><p className="font-mono text-[9px] uppercase tracking-[.18em] text-slate-500">Vibe detected</p><p className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[.1em]">Electronic / Ambient</p></div>
            </div>
          </div>
        </section>

        <div className="ticker" aria-hidden>
          <div className="ticker-track">
            {Array.from({ length: 2 }).map((_, repeat) => (
              <span key={repeat}>Commits into culture <i>✦</i> Find your frequency <i>✦</i> Code. Listen. Share. <i>✦</i></span>
            ))}
          </div>
        </div>

        <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-16 px-5 py-24 sm:px-8 sm:py-32">
          <div className="grid gap-14 md:grid-cols-[.85fr_1.15fr] md:gap-24">
            <div>
              <p className="eyebrow"><span className="status-dot" /> How it works</p>
              <h2 className="mt-5 text-4xl font-medium leading-tight tracking-[-.06em] sm:text-5xl">One username.<br /><em className="font-serif font-normal">A whole new frequency.</em></h2>
            </div>
            <ol className="divide-y divide-white/10 border-y border-white/10">
              <li className="grid grid-cols-[34px_1fr] gap-4 py-6">
                <span className="font-mono text-[10px] text-lime-300">01</span>
                <div><h3 className="text-2xl font-bold tracking-[-.04em] text-white sm:text-3xl">We read your rhythm</h3><p className="mt-2 max-w-lg text-base font-medium leading-7 text-slate-300">Enter a public GitHub username. GitMusice explores contribution patterns, streaks, languages, and milestones.</p></div>
              </li>
              <li className="grid grid-cols-[34px_1fr] gap-4 py-6">
                <span className="font-mono text-[10px] text-lime-300">02</span>
                <div><h3 className="text-2xl font-bold tracking-[-.04em] text-white sm:text-3xl">We build your identity</h3><p className="mt-2 max-w-lg text-base font-medium leading-7 text-slate-300">Your coding journey becomes a custom tier, visual aura, and musical genre that evolves with your work.</p></div>
              </li>
              <li className="grid grid-cols-[34px_1fr] gap-4 py-6">
                <span className="font-mono text-[10px] text-lime-300">03</span>
                <div><h3 className="text-2xl font-bold tracking-[-.04em] text-white sm:text-3xl">You play and share it</h3><p className="mt-2 max-w-lg text-base font-medium leading-7 text-slate-300">Listen to your generated track and add your living GitMusice badge to any profile README.</p></div>
              </li>
            </ol>
          </div>
        </section>

        <section id="vibes" className="mx-auto max-w-6xl scroll-mt-16 px-5 pb-24 sm:px-8 sm:pb-32">
          <div className="vibe-section grid gap-10 p-7 sm:p-10 md:grid-cols-[.8fr_1.2fr] md:items-center md:gap-12 md:p-12">
            <div>
              <p className="eyebrow"><span className="status-dot" /> Find your vibe</p>
              <h2 className="mt-5 max-w-sm text-4xl font-medium leading-[1.02] tracking-[-.06em] sm:text-5xl">Every builder sounds different.</h2>
              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Early-morning commits. Weekend marathons. Quiet consistency. Chaotic bursts. Your rhythm shapes the music—and no two profiles land on the same frequency.</p>
              <a href="#try-it" className="lime-button mt-7">Discover your sound <ArrowRight className="h-4 w-4" aria-hidden /></a>
            </div>
            <div className="grid min-h-[290px] grid-cols-3 items-end">
              <article className="vibe-card vibe-card-cyan h-[69%]">
                <p className="vibe-number">01 / Consistent</p><Music2 className="mb-auto h-5 w-5 text-cyan-300" aria-hidden />
                <h3>Ambient<br />Architect</h3><p className="vibe-caption">Calm precision. Deep focus.</p>
              </article>
              <article className="vibe-card vibe-card-lime h-[90%]">
                <p className="vibe-number">02 / Prolific</p><Sparkles className="mb-auto h-5 w-5 text-lime-300" aria-hidden />
                <h3>Neon<br />Operator</h3><p className="vibe-caption">Fast rhythm. High output.</p>
              </article>
              <article className="vibe-card vibe-card-violet h-[62%]">
                <p className="vibe-number">03 / Explorer</p><Github className="mb-auto h-5 w-5 text-violet-300" aria-hidden />
                <h3>Cosmic<br />Hacker</h3><p className="vibe-caption">Wild range. New frontiers.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="final-cta px-5 py-24 text-center sm:px-8 sm:py-32">
          <p className="eyebrow justify-center"><span className="status-dot" /> Your track is waiting</p>
          <h2 className="mx-auto mt-5 max-w-3xl text-5xl font-medium leading-[.98] tracking-[-.07em] sm:text-7xl">What does your<br />GitHub <em className="font-serif font-normal text-lime-300">sound like?</em></h2>
          <a href="#try-it" className="lime-button mt-8">Generate my GitMusice <ArrowRight className="h-4 w-4" aria-hidden /></a>
          <p className="mt-2 font-mono text-[9px] tracking-[.15em] text-slate-500">It takes less than 10 seconds.</p>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 border-t border-white/10 px-5 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold"><span className="text-lime-300">◉</span> gitmusice</Link>
        <p className="font-mono text-[9px] uppercase tracking-[.15em] text-slate-500">Turning commits into culture</p>
        <p className="font-mono text-[9px] uppercase tracking-[.15em] text-slate-500">© 2025 GitMusice</p>
      </footer>
    </div>
  );
}
