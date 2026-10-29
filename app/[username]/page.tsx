import { notFound } from 'next/navigation';
import Profile from '../../components/Profile';
import { getProfile } from '../../lib/github';
import { getTier } from '../../lib/tiers';
import { analyzeCached } from '../../lib/analyze';
import { writePoem } from '../../lib/poem';

export async function generateMetadata({ params }: { params: { username: string } }) {
  try {
    const p = await getProfile(decodeURIComponent(params.username));
    const { cur } = getTier(p.contributions);
    return {
      title: `${p.name} is ${cur.name} — GitMusice`,
      description: `${p.contributions.toLocaleString('en-US')} contributions. Hear ${p.login}'s ${cur.name} track.`,
      alternates: { canonical: `/${p.login}` },
      twitter: { card: 'summary_large_image' },
    };
  } catch { return { title: 'GitMusice' }; }
}

export default async function Page({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);
  try {
    const data = await getProfile(username);
    let poem = null;
    let bpm = 100;
    try {
      const { analysis, spec } = await analyzeCached(data.login);
      poem = writePoem(analysis, spec);
      bpm = spec.bpm;
    } catch (e) { console.error('analysis failed', e); }
    return <Profile key={username} username={username} data={data} poem={poem} bpm={bpm} />;
  } catch (e: any) {
    if (e.status === 404 || e.status === 400) notFound(); // real HTTP 404
    return <Profile key={username} username={username} error={e.message} />;
  }
}