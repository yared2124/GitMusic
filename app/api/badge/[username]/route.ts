import { getProfile } from '../../../../lib/github';
import { evaluateDeveloper } from '../../../../lib/criteria';

export async function GET(_: Request, { params }: { params: { username: string } }) {
  let label = 'NOT FOUND';
  let sub = 'GITMUSICE';
  let color = '#9ca3af';
  let live = false;
  let cache = 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400';

  try {
    const p = await getProfile(params.username);
    const ev = evaluateDeveloper(p);
    label = `${ev.overallScore}% · ${ev.classicalTier.badge.split('·')[0].trim()}`;
    sub = `${p.contributions.toLocaleString('en-US')} commits · ${ev.classicalTier.title}`;
    color = ev.classicalTier.color;
    live = true;
  } catch (e: any) {
    if (e.status !== 404 && e.status !== 400) {
      label = 'UNAVAILABLE';
      sub = 'try again soon';
      cache = 'public, max-age=60, s-maxage=60';
    }
  }

  const w = Math.round(70 + Math.max(label.length * 10, sub.length * 6));
  const bars = [0, -0.35, -0.7, -0.15, -0.55]
    .map(
      (d, i) =>
        `<rect class="b" x="${14 + i * 7}" y="9" width="4" height="22" rx="1" fill="${color}" style="${
          live ? `animation-delay:${d}s` : 'transform:scaleY(.3)'
        }"/>`
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="40" viewBox="0 0 ${w} 40" role="img" aria-label="GitMusice ${label} ${sub}">
<style>.b{transform-box:fill-box;transform-origin:50% 100%;${
    live ? 'animation:eq 1.1s ease-in-out infinite;' : ''
  }}@keyframes eq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}text{font-family:"Segoe UI",Ubuntu,Arial,sans-serif}</style>
<rect x=".5" y=".5" width="${w - 1}" height="39" rx="8" fill="#0a0d0f" stroke="${color}" stroke-opacity=".7"/>
${bars}<text x="54" y="18" font-size="14" font-weight="700" fill="${color}">${label}</text>
<text x="54" y="31" font-size="10" fill="#aab6bb">${sub.length > 40 ? sub.slice(0, 38) + '...' : sub}</text></svg>`;

  return new Response(svg, {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': cache },
  });
}
