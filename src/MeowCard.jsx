import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

export const MEOWCARD_FPS = 30;
export const MEOWCARD_DURATION = 6.0;

const PawIcon = ({size = 34, color = '#ffd76a'}) => (
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
      {/* holographic sheen sweep, always animating */}
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
          <div style={{
            marginTop: 22, fontSize: 24, fontWeight: 700, letterSpacing: 10, color: 'rgba(255,255,255,.75)',
          }}>KITTEHCOIN</div>
          <div style={{
            marginTop: 10, fontSize: 12, fontWeight: 500, letterSpacing: 3, color: 'rgba(255,215,120,.55)',
          }}>DESIGN&nbsp;BY&nbsp;NITRAEX</div>
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
          <div style={{
            marginTop: 14, fontSize: 26, fontWeight: 700, letterSpacing: 9, color: 'rgba(255,255,255,.9)',
          }}>KITTEHCOIN</div>
        </>
      )}
    </div>
  );
}

export const MeowCard = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  // continuous slow spin with a gentle float/wobble — a hero "trading card" showcase loop
  const spin = t / MEOWCARD_DURATION;
  const rotY = spin * 360;
  const rotX = Math.sin(t * 0.9) * 5;
  const floatY = Math.sin(t * 1.1) * 14;
  const introScale = interpolate(t, [0, 0.6], [0.85, 1], {extrapolateRight: 'clamp'});
  const introOp = interpolate(t, [0, 0.5], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#050604'}}>
      <div style={{
        position: 'absolute', inset: '-20%',
        background: 'radial-gradient(circle at 50% 42%, rgba(255,196,60,.16) 0%, transparent 55%)',
        filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        perspective: 1800, opacity: introOp,
      }}>
        <div style={{
          position: 'relative', width: 620, height: 860,
          transform: `translateY(${floatY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${introScale})`,
          transformStyle: 'preserve-3d',
        }}>
          <CardFace side="front" spin={spin} />
          <CardFace side="back" spin={spin} />
        </div>
      </div>
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.6) 100%)',
      }} />
    </AbsoluteFill>
  );
};
