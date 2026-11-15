import { notFound } from 'next/navigation';
import Profile from '../../components/Profile';
import { getProfile } from '../../lib/github';
import { getTier } from '../../lib/tiers';

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
  try { return <Profile key={username} username={username} data={await getProfile(username)} />; }
  catch (e: any) {
    if (e.status === 404 || e.status === 400) notFound(); // real HTTP 404
    return <Profile key={username} username={username} error={e.message} />;
  }
}
