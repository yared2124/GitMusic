import { ImageResponse } from 'next/og';

export const alt = 'GitMusice — Your code has a sound';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '72px',
        color: '#e8eef0',
        backgroundColor: '#070a0d',
        backgroundImage: 'radial-gradient(circle at 78% 24%, rgba(0, 105, 104, .35), transparent 38%)',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', color: '#c6f432', fontSize: 28, fontWeight: 700, letterSpacing: 4 }}>
        <span style={{ width: 24, height: 24, marginRight: 16, border: '2px solid #c6f432', borderRadius: 24 }} />
        GITMUSICE
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: 44, fontSize: 86, fontWeight: 600, lineHeight: 1.08, letterSpacing: -4 }}>
        <span>Your code has a</span>
        <span style={{ color: '#c6f432', fontFamily: 'serif', fontStyle: 'italic', fontWeight: 400 }}>soundtrack.</span>
      </div>
      <div style={{ display: 'flex', marginTop: 28, color: '#aab7bc', fontSize: 28 }}>
        Turn your GitHub activity into a vibe, tier and track.
      </div>
    </div>,
    size,
  );
}
