'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Headphones } from 'lucide-react';

export default function Nav({ initial = '', hideSearch = false }: { initial?: string; hideSearch?: boolean }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  return (
    <nav className="mx-auto flex max-w-5xl items-center justify-between gap-4 border-b border-white/10 px-4 py-4">
      <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <Headphones className="h-5 w-5 text-lime-300" aria-hidden /> gitmusice
      </Link>
      {!hideSearch && (
        <form onSubmit={(e) => { e.preventDefault(); const u = q.trim().replace(/^@/, ''); if (u) router.push('/' + encodeURIComponent(u)); }}
          className="flex h-10 w-full max-w-xs items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 focus-within:border-lime-300">
          <Search className="h-4 w-4 text-slate-400" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search GitHub username" aria-label="GitHub username"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-400" />
        </form>
      )}
    </nav>
  );
}