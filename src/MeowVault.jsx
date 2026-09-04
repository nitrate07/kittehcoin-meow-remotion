import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

export const VAULT_FPS = 30;
export const VAULT_DURATION = 12.6;

const T_OPEN = 2.6;
const T_OPEN_END = 3.3;
const T_RISE = 3.0;
const T_RISE_END = 3.8;
const T_FLOAT_END = 9.0;
const T_SETTLE_END = 10.6;
const T_SIGNATURE = 11.0;
const T_FADE = 11.8;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const rand = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

const PawIcon = ({size = 40, color = '#ffd76a'}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{filter: `drop-shadow(0 0 10px ${color}aa)`}}>
    <ellipse cx="32" cy="42" rx="17" ry="14" fill={color} />
    <ellipse cx="14" cy="24" rx="7" ry="9" fill={color} />
    <ellipse cx="30" cy="14" rx="7.5" ry="9.5" fill={color} />
    <ellipse cx="48" cy="18" rx="7" ry="9" fill={color} transform="rotate(12 48 18)" />
    <ellipse cx="56" cy="34" rx="6" ry="8" fill={color} transform="rotate(28 56 34)" />
  </svg>
);

function CardFace({side, spin}) {
  const isBack = side === 'back';
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 40,
      backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
      transform: isBack ? 'rotateY(180deg)' : 'none',
      background: 'linear-gradient(160deg, rgba(12,24,17,.96), rgba(3,8,6,.98))',
      border: '2px solid rgba(255,205,100,.4)',
      boxShadow: '0 50px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.06), 0 0 90px rgba(255,190,60,.16)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-60%', left: `${((spin * 40) % 220) - 90}%`, width: '55%', height: '260%',
        background: 'linear-gradient(100deg, transparent 25%, rgba(255,255,255,.10) 45%, rgba(255,225,140,.30) 50%, rgba(255,255,255,.10) 55%, transparent 75%)',
        transform: 'rotate(16deg)', pointerEvents: 'none',
      }} />
      {isBack ? (
        <>
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.07,
            backgroundImage: 'radial-gradient(circle, #ffd76a 3px, transparent 3.5px)',
            backgroundSize: '46px 46px',
          }} />
          <PawIcon size={54} />
          <div style={{marginTop: 22, fontSize: 24, fontWeight: 700, letterSpacing: 10, color: 'rgba(255,255,255,.75)'}}>KITTEHCOIN</div>
        </>
      ) : (
        <>
          <PawIcon size={40} />
          <div style={{
            marginTop: 18, fontSize: 96, fontWeight: 900, letterSpacing: 1,
            background: 'linear-gradient(160deg, #fff8e1, #ffd76a 40%, #d4a017)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 34px rgba(255,196,60,.6)) drop-shadow(0 0 80px rgba(255,196,60,.3))',
          }}>$MEOW</div>
          <div style={{marginTop: 14, fontSize: 26, fontWeight: 700, letterSpacing: 9, color: 'rgba(255,255,255,.9)'}}>KITTEHCOIN</div>
        </>
      )}
    </div>
  );
}

function EnergyRing({t}) {
  const rot = t * 22;
  const opacity = clamp(t / 1.5, 0, 1) * (1 - clamp((t - T_RISE_END - 0.5) / 3, 0, 0.55));
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '46%', width: 780, height: 780, borderRadius: '50%',
      transform: `translate(-50%,-50%) rotate(${rot}deg)`, opacity,
      background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,196,60,.85) 18deg, transparent 55deg, transparent 180deg, rgba(255,196,60,.5) 205deg, transparent 250deg, transparent 360deg)',
      WebkitMaskImage: 'radial-gradient(circle, transparent 62%, #fff 64%, #fff 68%, transparent 70%)',
      maskImage: 'radial-gradient(circle, transparent 62%, #fff 64%, #fff 68%, transparent 70%)',
      filter: 'blur(1.5px)',
    }} />
  );
}

function VaultDoor({t}) {
  const openT = clamp((t - T_OPEN) / (T_OPEN_END - T_OPEN), 0, 1);
  const preGlow = clamp(t / T_OPEN, 0, 1) * 0.35;
  const glowScale = lerp(0.35, 1, easeOut(openT));
  const glowOp = lerp(preGlow, 1, easeOut(openT)) * (1 - clamp((t - T_RISE_END - 0.6) / 2.5, 0, 0.75));
  return (
    <div style={{
      position: 'absolute', left: '50%', top: '46%', width: 520, height: 520, borderRadius: '50%',
      transform: `translate(-50%,-50%) scale(${glowScale})`, opacity: glowOp,
      background: 'radial-gradient(circle, rgba(255,225,150,.95) 0%, rgba(255,190,60,.55) 35%, transparent 70%)',
      filter: 'blur(6px)',
    }} />
  );
}

function Smoke({t}) {
  const localT = t - T_OPEN;
  if (localT < 0 || localT > 3.2) return null;
  const puffs = new Array(10).fill(0).map((_, i) => {
    const angle = rand(i) * Math.PI * 2;
    const speed = 60 + rand(i + 50) * 90;
    const size = 90 + rand(i + 100) * 140;
    const delay = rand(i + 150) * 0.4;
    const lt = clamp(localT - delay, 0, 4);
    const dist = lt * speed;
    const op = clamp(lt / 0.5, 0, 1) * clamp(1 - (lt - 0.6) / 1.8, 0, 1);
    return {x: Math.cos(angle) * dist, y: Math.sin(angle) * dist * 0.6 - lt * 30, size, op: Math.max(op, 0)};
  });
  return (
    <>
      {puffs.map((p, i) => (
        <div key={i} style={{
          position: 'absolute', left: '50%', top: '46%', width: p.size, height: p.size, borderRadius: '50%',
          transform: `translate(${p.x - p.size / 2}px, ${p.y - p.size / 2}px)`,
          background: 'radial-gradient(circle, rgba(255,210,150,.4), transparent 70%)',
          opacity: p.op, pointerEvents: 'none',
        }} />
      ))}
    </>
  );
}

export const MeowVault = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const riseT = clamp((t - T_RISE) / (T_RISE_END - T_RISE), 0, 1);
  const riseE = easeOut(riseT);
  const cardOpacity = riseE;
  const cardY = lerp(320, 0, riseE);
  const cardScale = lerp(0.45, 1, riseE);

  let rotY;
  let extraScale = 1;
  if (t < T_RISE_END) {
    rotY = lerp(50, 0, riseE);
  } else if (t < T_FLOAT_END) {
    rotY = ((t - T_RISE_END) / 1.7) * 360;
  } else if (t < T_SETTLE_END) {
    const contAtStart = ((T_FLOAT_END - T_RISE_END) / 1.7) * 360;
    const target = Math.round(contAtStart / 360) * 360;
    const st = easeInOut(clamp((t - T_FLOAT_END) / (T_SETTLE_END - T_FLOAT_END), 0, 1));
    rotY = lerp(contAtStart, target, st);
    extraScale = lerp(1, 1.08, st);
  } else {
    rotY = 0;
    extraScale = 1.08;
  }

  const orbitWobble = t > T_RISE_END && t < T_SETTLE_END ? Math.sin(t * 0.7) * 6 : 0;
  const floatBob = t > T_RISE_END ? Math.sin(t * 1.05) * 10 : 0;

  const signatureOp = clamp((t - T_SIGNATURE) / 0.9, 0, 1) * 0.85;
  const fadeOp = t > T_FADE ? easeInOut(clamp((t - T_FADE) / (VAULT_DURATION - T_FADE), 0, 1)) : 0;

  return (
    <AbsoluteFill style={{background: '#050604', overflow: 'hidden'}}>
      <div style={{
        position: 'absolute', inset: '-15%',
        background: 'radial-gradient(circle at 50% 44%, rgba(255,196,60,.14) 0%, transparent 55%)',
        filter: 'blur(50px)',
      }} />
      <EnergyRing t={t} />
      <VaultDoor t={t} />
      <Smoke t={t} />

      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 1800, opacity: cardOpacity,
      }}>
        <div style={{
          position: 'relative', width: 560, height: 780,
          transform: `translateY(${cardY + floatBob}px) rotateX(${orbitWobble}deg) rotateY(${rotY}deg) scale(${cardScale * extraScale})`,
          transformStyle: 'preserve-3d',
        }}>
          <CardFace side="front" spin={t / 1.7} />
          <CardFace side="back" spin={t / 1.7} />
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: '20%', textAlign: 'center',
        fontSize: 13, fontWeight: 500, letterSpacing: 4, color: 'rgba(255,215,120,.7)',
        textShadow: '0 0 14px rgba(255,196,60,.4)', opacity: signatureOp,
      }}>DESIGN&nbsp;BY&nbsp;NITRAEX</div>

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.6) 100%)',
      }} />
      <div style={{position: 'absolute', inset: 0, background: '#000', opacity: fadeOp}} />
      <Audio src={staticFile('vault_score.wav')} />
    </AbsoluteFill>
  );
};
