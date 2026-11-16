import { notFound } from 'next/navigation';
import Profile from '../../components/Profile';
import { getProfile } from '../../lib/github';
import { evaluateDeveloper } from '../../lib/criteria';

export async function generateMetadata({ params }: { params: { username: string } }) {
  try {
    const p = await getProfile(decodeURIComponent(params.username));
    const ev = evaluateDeveloper(p);
    return {
      title: `${p.name || p.login} (${ev.overallScore}%) — ${ev.classicalTier.title} — GitMusice`,
      description: `${p.name || p.login} scored ${ev.overallScore}% on GitMusice. Listen to the dedicated classical piece: ${ev.classicalTier.title}.`,
      alternates: { canonical: `/${p.login}` },
      twitter: { card: 'summary_large_image' },
    };
  } catch {
    return { title: 'GitMusice' };
  }
}

export default async function Page({ params }: { params: { username: string } }) {
  const username = decodeURIComponent(params.username);
  try {
    const data = await getProfile(username);
    return <Profile key={username} username={username} data={data} />;
  } catch (e: any) {
    if (e.status === 404 || e.status === 400) notFound();
    return <Profile key={username} username={username} error={e.message} />;
  }
}
