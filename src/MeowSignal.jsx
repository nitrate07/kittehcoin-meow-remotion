import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const SIGNAL_FPS = 30;
export const SIGNAL_DURATION = 15.6;

const LINES = [
  {text: 'SOMETHING IS AWAKENING', start: 2.0, dur: 2.1},
  {text: 'THE SIGNAL IS SPREADING', start: 4.5, dur: 2.1},
  {text: 'THEY FELT IT FIRST', start: 7.1, dur: 1.9},
  {text: 'JOIN THE PACK', start: 9.3, dur: 1.9},
];

const BLACKOUT_START = 11.3;
const CONVERGE_START = 11.7;
const LOGO_FORM = 13.1;
const WORDMARK_IN = 13.6;
const SIGNATURE_IN = 14.5;
const FADE_START = 14.9;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeIn = (t) => t * t * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rand = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const PawIcon = ({size = 100, color = '#ffd76a', opacity = 1}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{opacity, filter: `drop-shadow(0 0 26px ${color}bb)`}}>
    <ellipse cx="32" cy="42" rx="17" ry="14" fill={color} />
    <ellipse cx="14" cy="24" rx="7" ry="9" fill={color} />
    <ellipse cx="30" cy="14" rx="7.5" ry="9.5" fill={color} />
    <ellipse cx="48" cy="18" rx="7" ry="9" fill={color} transform="rotate(12 48 18)" />
    <ellipse cx="56" cy="34" rx="6" ry="8" fill={color} transform="rotate(28 56 34)" />
  </svg>
);

function RadarSweep({t}) {
  const rot = t * 70;
  const fade = 1 - clamp((t - BLACKOUT_START) / 0.5, 0, 1);
  return (
    <>
      {[220, 360, 500, 640].map((d, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '42%', width: d, height: d, borderRadius: '50%',
          transform: 'translate(-50%,-50%)', border: '1px solid rgba(255,205,100,.14)',
          opacity: fade,
        }} />
      ))}
      <div style={{
        position: 'absolute', left: '50%', top: '42%', width: 640, height: 640, borderRadius: '50%',
        transform: `translate(-50%,-50%) rotate(${rot}deg)`, opacity: 0.5 * fade,
        background: 'conic-gradient(from 0deg, rgba(255,196,60,.55) 0deg, transparent 40deg, transparent 360deg)',
        WebkitMaskImage: 'radial-gradient(circle, transparent 0%, #fff 55%, #fff 70%, transparent 72%)',
        maskImage: 'radial-gradient(circle, transparent 0%, #fff 55%, #fff 70%, transparent 72%)',
      }} />
    </>
  );
}

function ScanGlitch({t}) {
  // brief horizontal glitch scanlines pulsing in sync with each hype line's entrance
  const active = LINES.find((l) => t >= l.start - 0.08 && t < l.start + 0.12);
  if (!active) return null;
  const localT = t - (active.start - 0.08);
  const op = clamp(1 - localT / 0.2, 0, 1) * 0.5;
  return (
    <div style={{
      position: 'absolute', inset: 0, opacity: op, pointerEvents: 'none', mixBlendMode: 'overlay',
      background: `repeating-linear-gradient(0deg, rgba(255,255,255,.5) 0px, transparent 2px, transparent ${4 + rand(Math.floor(t * 30)) * 6}px)`,
      transform: `translateX(${(rand(Math.floor(t * 30) + 5) - 0.5) * 20}px)`,
    }} />
  );
}

function HypeLines({t}) {
  return (
    <>
      {LINES.map((l, i) => {
        const localT = t - l.start;
        if (localT < -0.05 || localT > l.dur + 0.2) return null;
        const inT = clamp(localT / 0.18, 0, 1);
        const outT = clamp((localT - (l.dur - 0.2)) / 0.2, 0, 1);
        const op = easeOut(inT) * (1 - outT);
        const jitter = inT < 1 ? (rand(i * 7 + Math.floor(localT * 60)) - 0.5) * 6 : 0;
        return (
          <div key={i} style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: op,
          }}>
            <div style={{
              fontSize: 46, fontWeight: 800, letterSpacing: 3, color: '#fff', textAlign: 'center',
              textTransform: 'uppercase', textShadow: '0 0 24px rgba(255,205,100,.5)',
              transform: `translateX(${jitter}px)`, padding: '0 60px',
            }}>{l.text}</div>
          </div>
        );
      })}
    </>
  );
}

function ConvergingParticles({t}) {
  const localT = t - CONVERGE_START;
  if (localT < 0 || localT > (LOGO_FORM - CONVERGE_START) + 0.1) return null;
  const dur = LOGO_FORM - CONVERGE_START;
  const prog = easeIn(clamp(localT / dur, 0, 1));
  const n = 26;
  const items = new Array(n).fill(0).map((_, i) => {
    const angle = (i / n) * Math.PI * 2 + rand(i) * 0.5;
    const r0 = 260 + rand(i + 40) * 260;
    const r = lerp(r0, 0, prog);
    const size = lerp(2, 6, rand(i + 80));
    const op = clamp(prog * 2, 0, 1) * (1 - clamp((prog - 0.85) / 0.15, 0, 1));
    return {x: Math.cos(angle) * r, y: Math.sin(angle) * r * 0.9, size, op};
  });
  return (
    <>
      {items.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '42%', width: p.size, height: p.size, borderRadius: '50%',
          transform: `translate(${p.x}px, ${p.y}px)`, background: '#ffd76a', opacity: p.op,
          boxShadow: '0 0 8px rgba(255,215,120,.8)',
        }} />
      ))}
    </>
  );
}

export const MeowSignal = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const blackoutOp = clamp((t - BLACKOUT_START) / 0.4, 0, 1) * (1 - clamp((t - (CONVERGE_START - 0.1)) / 0.3, 0, 1));

  const logoT = clamp((t - LOGO_FORM) / 0.6, 0, 1);
  const logoOp = easeOut(logoT);
  const logoScale = lerp(0.6, 1, easeOut(logoT));
  const logoGlowPulse = 1 + Math.sin(clamp((t - LOGO_FORM), 0, 10) * 4) * 0.06 * (1 - clamp((t - LOGO_FORM) / 1.2, 0, 1));

  const wordmarkT = clamp((t - WORDMARK_IN) / 0.5, 0, 1);
  const wordmarkOp = easeOut(wordmarkT);

  const sigOp = clamp((t - SIGNATURE_IN) / 0.7, 0, 1) * 0.85;
  const fadeOp = t > FADE_START ? easeInOut(clamp((t - FADE_START) / (SIGNAL_DURATION - FADE_START), 0, 1)) : 0;

  return (
    <AbsoluteFill style={{background: '#040403', overflow: 'hidden'}}>
      <div style={{
        position: 'absolute', inset: '-15%',
        background: 'radial-gradient(circle at 50% 40%, rgba(255,196,60,.10) 0%, transparent 55%)',
        filter: 'blur(50px)',
      }} />

      <RadarSweep t={t} />
      <HypeLines t={t} />
      <ScanGlitch t={t} />
      <ConvergingParticles t={t} />

      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: blackoutOp}} />

      <div style={{
        position: 'absolute', left: 0, right: 0, top: '42%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', transform: 'translateY(-50%)',
      }}>
        <div style={{transform: `scale(${logoScale * logoGlowPulse})`, opacity: logoOp}}>
          <PawIcon size={110} />
        </div>
        <div style={{
          marginTop: 26, fontSize: 84, fontWeight: 900, letterSpacing: 1, opacity: wordmarkOp,
          background: 'linear-gradient(160deg, #fff8e1, #ffd76a 40%, #d4a017)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 34px rgba(255,196,60,.6)) drop-shadow(0 0 80px rgba(255,196,60,.3))',
        }}>$MEOW</div>
        <div style={{
          marginTop: 10, fontSize: 24, fontWeight: 700, letterSpacing: 9, color: 'rgba(255,255,255,.9)',
          opacity: wordmarkOp,
        }}>KITTEHCOIN</div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '18%', textAlign: 'center',
        fontSize: 13, fontWeight: 500, letterSpacing: 4, color: 'rgba(255,215,120,.7)',
        textShadow: '0 0 14px rgba(255,196,60,.4)', opacity: sigOp,
      }}>DESIGN&nbsp;BY&nbsp;NITRAEX</div>

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.6) 100%)',
      }} />
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: fadeOp}} />

      <Audio src={staticFile('signal_score.wav')} />
    </AbsoluteFill>
  );
};
