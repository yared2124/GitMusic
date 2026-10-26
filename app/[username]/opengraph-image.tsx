import { ImageResponse } from 'next/og';
import { getProfile } from '../../lib/github';
import { getTier } from '../../lib/tiers';

export const alt = 'GitMusice tier card';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 3600;

export default async function Image({ params }: { params: { username: string } }) {
  let p: any = null;
  try { p = await getProfile(decodeURIComponent(params.username)); } catch {}
  const t = p ? getTier(p.contributions) : null;
  const color = t?.cur.color || '#c6f432';
  const base: any = { width: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: 72, color: '#e8eef0', fontFamily: 'sans-serif',
    background: `radial-gradient(circle at 20% 0%, ${color}38, #07090b 62%)` };
  if (!p) return new ImageResponse(
    <div style={{ ...base, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ fontSize: 120, fontWeight: 700, letterSpacing: -4 }}>Your code has a <span style={{ color }}>&nbsp;sound.</span></div>
      <div style={{ fontSize: 36, color: '#9aa7ad', marginTop: 24 }}>gitmusice</div>
    </div>, size);
  return new ImageResponse(
    <div style={base}>
      <img src={p.avatar} width={300} height={300} style={{ borderRadius: 150, border: `6px solid ${color}`, marginRight: 64 }} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: 34, color: '#9aa7ad' }}>gitmusice · @{p.login}</div>
        <div style={{ fontSize: 64, fontWeight: 600, marginTop: 8, letterSpacing: -2 }}>{p.name}</div>
        <div style={{ fontSize: 150, fontWeight: 800, color, lineHeight: 1, marginTop: 12, letterSpacing: -4 }}>{t!.cur.name}</div>
        <div style={{ fontSize: 42, marginTop: 16 }}>{p.contributions.toLocaleString('en-US')} contributions</div>
        <div style={{ fontSize: 30, color: '#9aa7ad', marginTop: 10 }}>{t!.cur.track}</div>
      </div>
    </div>, size);
}
