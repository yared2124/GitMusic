import { ImageResponse } from 'next/og';
import { getProfile } from '../../lib/github';
import { evaluateDeveloper } from '../../lib/criteria';

export const alt = 'GitMusice Classical Score card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

export default async function Image({ params }: { params: { username: string } }) {
  let p: any = null;
  try {
    p = await getProfile(decodeURIComponent(params.username));
  } catch {}
  const ev = p ? evaluateDeveloper(p) : null;
  const color = ev?.classicalTier.color || '#38bdf8';
  const base: any = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    padding: 72,
    color: '#e8eef0',
    fontFamily: 'sans-serif',
    background: `radial-gradient(circle at 20% 0%, ${color}38, #07090b 62%)`,
  };

  if (!p || !ev) {
    return new ImageResponse(
      <div
        style={{
          ...base,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ fontSize: 90, fontWeight: 700, letterSpacing: -3 }}>
          Your code has a <span style={{ color }}>&nbsp;classical symphony.</span>
        </div>
        <div style={{ fontSize: 36, color: '#9aa7ad', marginTop: 24 }}>gitmusice</div>
      </div>,
      size
    );
  }

  return new ImageResponse(
    <div style={base}>
      <img
        src={p.avatar}
        width={280}
        height={280}
        style={{
          borderRadius: 48,
          border: `6px solid ${color}`,
          marginRight: 60,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 30, color: '#9aa7ad', fontFamily: 'monospace' }}>
          gitmusice · @{p.login}
        </div>
        <div style={{ fontSize: 54, fontWeight: 700, marginTop: 6, letterSpacing: -1 }}>
          {p.name || p.login}
        </div>
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color,
            lineHeight: 1,
            marginTop: 10,
            letterSpacing: -3,
          }}
        >
          {ev.overallScore}% OVR
        </div>
        <div style={{ fontSize: 34, marginTop: 12, color: '#ffffff' }}>
          {ev.ratingTitle} ({ev.amharicRatingTitle})
        </div>
        <div style={{ fontSize: 26, color: '#9aa7ad', marginTop: 8 }}>
          {ev.classicalTier.title}
        </div>
      </div>
    </div>,
    size
  );
}
