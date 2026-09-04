import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame} from 'remotion';

export const FPS = 30;
export const TOTAL_SECONDS = 20.0;

const COINS = [
  {name: 'BITCOIN', sub: 'DID YOU MISS IT?', glyph: '₿', a: '#FFB347', b: '#F7931A', glow: 'rgba(247,147,26,.65)', start: 0.15, dur: 2.55, btc: true},
  {name: 'ETHEREUM', sub: 'DID YOU MISS IT?', glyph: 'Ξ', a: '#9DB0FF', b: '#627EEA', glow: 'rgba(98,126,234,.65)', start: 2.85, dur: 2.35},
  {name: 'SOLANA', sub: 'DID YOU MISS IT?', glyph: 'SOL', a: '#9945FF', b: '#14F195', glow: 'rgba(20,241,149,.55)', start: 5.35, dur: 2.15, sol: true},
  {name: 'DOGE', sub: 'TOO LATE?', glyph: 'Đ', a: '#F0D48A', b: '#C2A633', glow: 'rgba(194,166,51,.6)', start: 7.65, dur: 1.85},
  {name: 'SHIBA', sub: 'MISSED THIS ONE TOO?', glyph: 'SHIB', a: '#FFC97A', b: '#FF6B4A', glow: 'rgba(255,107,74,.65)', start: 9.65, dur: 1.65},
];

const BLACKOUT_START = 11.45;
const BLACKOUT_TEXT_IN = 11.9;
const BLACKOUT_END = 14.1;
const CAT_START = 14.1;
const IMPACT_T = 15.55;
const FINAL_TEXT_T = 16.55;
const SPIN_T = 17.5;
const SIGNATURE_T = 18.3;
const FADE_START = 19.2;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
// deterministic per-frame pseudo-random (seeded), so re-renders are frame-perfect
const rand = (seed) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

function getActiveCoin(t) {
  for (const coin of COINS) {
    const localT = t - coin.start;
    if (localT < -0.4 || localT > coin.dur + 0.35) continue;
    return {coin, localT};
  }
  return null;
}

function BgGlow({t}) {
  const active = getActiveCoin(t);
  const color = active ? active.coin.a : '#6C4EF5';
  const inT = active ? clamp(active.localT / 0.4, 0, 1) : 0;
  const op = active ? easeOut(inT) * 0.55 : 0;
  return (
    <div
      style={{
        position: 'absolute', inset: '-20%', zIndex: 1,
        background: `radial-gradient(circle at 50% 42%, ${color} 0%, transparent 55%)`,
        opacity: op, filter: 'blur(40px)',
      }}
    />
  );
}

function CardGlyph({coin}) {
  if (coin.btc) {
    return (
      <svg width="130" height="130" viewBox="0 0 64 64" fill="none"
        style={{color: coin.a, marginBottom: 6, filter: `drop-shadow(0 0 30px ${coin.glow})`}}>
        <path d="M20 8h2v6h4V8h2v6h1.5c8 0 13 3.3 13 10.2 0 4.6-2.3 7.3-5.6 8.6 4.3 1.2 7.4 4 7.4 9.4C44.3 50 39 54 30.5 54H29v6h-2v-6h-4v6h-2v-6h-9V50h4.2c1 0 1.5-.5 1.5-1.4V15.4c0-.9-.5-1.4-1.5-1.4H12V10h8V8Zm3.2 10.2v10.4h5.6c5 0 7.9-1.8 7.9-5.3 0-3.4-2.9-5.1-7.9-5.1h-5.6Zm0 16.6v11.6h6.5c5.7 0 8.9-2 8.9-5.9 0-3.9-3.2-5.7-8.9-5.7h-6.5Z" fill="currentColor" />
      </svg>
    );
  }
  if (coin.sol) {
    const grad = 'linear-gradient(90deg,#9945FF,#14F195)';
    return (
      <div style={{display: 'flex', gap: 10, marginBottom: 18}}>
        <div style={{width: 26, height: 120, borderRadius: 8, transform: 'skewX(-16deg)', background: grad, opacity: 1}} />
        <div style={{width: 26, height: 120, borderRadius: 8, transform: 'skewX(-16deg)', background: grad, opacity: 0.75}} />
        <div style={{width: 26, height: 120, borderRadius: 8, transform: 'skewX(-16deg)', background: grad, opacity: 0.5}} />
      </div>
    );
  }
  return (
    <div style={{
      fontSize: coin.glyph.length > 1 ? 92 : 150, fontWeight: 800, lineHeight: 1, marginBottom: 6,
      background: `linear-gradient(160deg, ${coin.a}, ${coin.b})`,
      WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent',
      filter: `drop-shadow(0 0 34px ${coin.glow})`,
    }}>{coin.glyph}</div>
  );
}

function CoinLayer({t, frame}) {
  const active = getActiveCoin(t);
  if (!active) return null;
  const {coin, localT} = active;

  const inT = clamp(localT / 0.4, 0, 1);
  const inE = easeOut(inT);
  const exitStart = coin.dur - 0.16;
  const outT = clamp((localT - exitStart) / 0.18, 0, 1);

  let rotY = lerp(70, 0, inE);
  let scale = lerp(0.8, 1, inE);
  let op = inE;
  const idle = Math.sin(localT * 1.3) * 4;
  rotY += idle * clamp((localT - 0.4) / 0.3, 0, 1);
  if (outT > 0) {
    rotY += outT * -55;
    scale *= 1 - outT * 0.15;
    op *= 1 - outT;
  }

  const ringOp = 0.22 * op * (1 - inT * 0.3);
  const ringScale = lerp(0.8, 1.05, inE);
  const sheenX = lerp(-90, 130, clamp(localT / 0.55, 0, 1));
  const textT = clamp((localT - 0.42) / 0.3, 0, 1);
  const lineOp = textT * (1 - outT);

  const glitchActive = outT > 0 && outT < 1;
  const glitchSeed = frame;

  return (
    <>
      <div key={`ring-${coin.name}`} style={{
        position: 'absolute', left: '50%', top: '44%', width: 440, height: 440, borderRadius: '50%',
        zIndex: 1, border: `1px solid ${coin.a}`, opacity: ringOp,
        transform: `translate(-50%,-50%) scale(${ringScale})`,
      }} />
      <div key={`card-${coin.name}`} style={{
        position: 'absolute', left: '50%', top: '44%', zIndex: 10, width: 380, height: 520,
        opacity: op, transform: `translate(-50%,-50%) rotateY(${rotY}deg) scale(${scale})`,
      }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 28, padding: 1.5,
          background: `linear-gradient(140deg, ${coin.a} 0%, transparent 30%, transparent 70%, ${coin.b} 100%)`,
        }}>
          <div style={{
            position: 'relative', width: '100%', height: '100%', borderRadius: 26.5, overflow: 'hidden',
            background: 'linear-gradient(160deg, rgba(18,18,28,.92), rgba(6,6,12,.96))',
            boxShadow: '0 30px 80px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              position: 'absolute', top: '-50%', left: `${sheenX}%`, width: '60%', height: '220%',
              background: 'linear-gradient(100deg, transparent 30%, rgba(255,255,255,.16) 48%, rgba(255,255,255,.28) 50%, rgba(255,255,255,.16) 52%, transparent 70%)',
              transform: 'rotate(18deg)',
            }} />
            <CardGlyph coin={coin} />
            <div style={{
              fontSize: 40, fontWeight: 800, letterSpacing: 6, color: '#fff',
              textShadow: `0 0 22px ${coin.glow}`,
            }}>{coin.name}</div>
          </div>
        </div>
      </div>
      <div key={`line-${coin.name}`} style={{
        position: 'absolute', left: 0, right: 0, top: '74%', zIndex: 20, textAlign: 'center',
      }}>
        <div style={{
          fontSize: 30, fontWeight: 300, letterSpacing: 3, color: 'rgba(255,255,255,.72)',
          textTransform: 'uppercase', opacity: lineOp,
          transform: `translateY(${lerp(10, 0, textT)}px)`,
        }}>{coin.sub}</div>
      </div>
      {glitchActive && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 45,
          opacity: rand(glitchSeed) * 0.5 * outT,
          background: rand(glitchSeed + 1) > 0.5
            ? `linear-gradient(90deg, transparent, ${coin.a}33, transparent)`
            : 'rgba(255,255,255,.05)',
          transform: `translateX(${(rand(glitchSeed + 2) - 0.5) * 14}px)`,
        }} />
      )}
    </>
  );
}

function BlackoutText({t}) {
  if (t < BLACKOUT_START - 0.3 || t > BLACKOUT_END + 0.1) return null;
  const textIn = clamp((t - BLACKOUT_TEXT_IN) / 0.35, 0, 1);
  const textOut = clamp((t - (BLACKOUT_END - 0.35)) / 0.35, 0, 1);
  const op = easeOut(textIn) * (1 - textOut);
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: op,
    }}>
      <span style={{
        fontSize: 34, fontWeight: 300, letterSpacing: 4, color: 'rgba(255,255,255,.85)', textTransform: 'uppercase',
      }}>SO&hellip; WHAT'S NEXT?</span>
    </div>
  );
}

function CatReveal({t}) {
  if (t < CAT_START - 0.1 || t > FINAL_TEXT_T + 3.2) return null;
  const localT = t - CAT_START;
  const fadeIn = clamp(localT / 1.0, 0, 1);
  const push = clamp(localT / 3.3, 0, 1);
  const zoom = lerp(1.7, 2.15, push);
  const cy = lerp(48, 46, push);
  const maskX = lerp(15, 62, push * push);
  const maskY = lerp(9, 42, push * push);
  const bright = lerp(0.05, 0.42, clamp((t - CAT_START) / (IMPACT_T + 0.6 - CAT_START), 0, 1));
  const maskImage = `radial-gradient(ellipse ${maskX}% ${maskY}% at 50% 48%, #fff 0%, rgba(255,255,255,.4) 55%, transparent 84%)`;
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: 15, opacity: fadeIn}}>
      <Img
        src={staticFile('meow_bg.png')}
        style={{
          position: 'absolute', left: '50%', top: `${cy}%`, width: 640, height: 'auto',
          transform: `translate(-50%,-50%) scale(${zoom})`,
          filter: `brightness(${bright}) contrast(1.3) saturate(1.05) blur(20px)`,
          WebkitMaskImage: maskImage, maskImage,
        }}
      />
    </div>
  );
}

function ImpactFlash({t}) {
  const localT = t - IMPACT_T;
  if (localT < -0.05 || localT > 0.5) return null;
  const op = localT < 0.05
    ? clamp(localT / 0.05, 0, 1) * 0.9
    : clamp(1 - (localT - 0.05) / 0.45, 0, 1) * 0.9;
  return <div style={{position: 'absolute', inset: 0, zIndex: 80, background: '#fff', opacity: op}} />;
}

function FinalReveal({t}) {
  if (t < FINAL_TEXT_T - 0.1) return null;
  const localT = t - FINAL_TEXT_T;

  const cardIn = clamp(localT / 0.4, 0, 1);
  const cardInE = easeOut(cardIn);
  const meowIn = easeOut(clamp(localT / 0.5, 0, 1));
  const kittehIn = clamp((localT - 0.25) / 0.5, 0, 1);
  const kittehInE = easeOut(kittehIn);

  const spinLocal = t - SPIN_T;
  let rotY = lerp(55, 0, cardInE);
  let scalePulse = lerp(0.82, 1, cardInE);
  if (spinLocal > 0 && spinLocal < 0.58) {
    const st = clamp(spinLocal / 0.58, 0, 1);
    const se = 1 - Math.pow(1 - st, 2);
    rotY = se * 360;
    scalePulse = 1 + Math.sin(st * Math.PI) * 0.08;
  } else if (spinLocal >= 0.58) {
    rotY = 0;
    scalePulse = 1;
  }

  const sigIn = clamp((t - SIGNATURE_T) / 0.8, 0, 1);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 25, opacity: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center', perspective: 1200,
    }}>
      <div style={{
        position: 'relative', width: 380, height: 280, borderRadius: 28,
        background: 'linear-gradient(160deg, rgba(10,22,16,.55), rgba(4,10,8,.72))',
        border: '1.5px solid rgba(255,200,90,.35)',
        boxShadow: '0 30px 90px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.08), 0 0 60px rgba(255,190,60,.18)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        transform: `rotateY(${rotY}deg) scale(${scalePulse})`,
      }}>
        <div style={{
          fontSize: 62, fontWeight: 900, letterSpacing: 1,
          background: 'linear-gradient(160deg, #fff8e1, #ffd76a 40%, #d4a017)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 30px rgba(255,196,60,.65)) drop-shadow(0 0 70px rgba(255,196,60,.35))',
          opacity: meowIn,
        }}>$MEOW</div>
        <div style={{
          fontSize: 20, fontWeight: 700, letterSpacing: 8, color: 'rgba(255,255,255,.88)',
          marginTop: 12, opacity: kittehInE, transform: `translateY(${lerp(6, 0, kittehIn)}px)`,
        }}>KITTEHCOIN</div>
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 56, textAlign: 'center', zIndex: 30,
        fontSize: 12, fontWeight: 500, letterSpacing: 4, color: 'rgba(255,255,255,.38)',
        textShadow: '0 0 14px rgba(255,255,255,.25)', opacity: sigIn * 0.85,
      }}>DESIGN&nbsp;BY&nbsp;NITRAEX</div>
    </div>
  );
}

function FadeToBlack({t}) {
  const f = t > FADE_START ? clamp((t - FADE_START) / (TOTAL_SECONDS - FADE_START), 0, 1) : 0;
  return <div style={{position: 'absolute', inset: 0, zIndex: 90, background: '#000', opacity: ease(f)}} />;
}

export const KittehTeaser = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <BgGlow t={t} />
      <CoinLayer t={t} frame={frame} />
      <BlackoutText t={t} />
      <CatReveal t={t} />
      <ImpactFlash t={t} />
      <FinalReveal t={t} />
      <div style={{
        position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,.55) 100%)',
      }} />
      <FadeToBlack t={t} />
      <Audio src={staticFile('score_mixed.wav')} />
    </AbsoluteFill>
  );
};
