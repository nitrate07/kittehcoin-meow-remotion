import {AbsoluteFill, Audio, Video, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';

export const WOOGI_FPS = 30;
export const BRAND = '#6C4EF5';

// same data as ffbuild/encode.py GAMES — the source of truth for trim/crop/title per clip
export const GAMES = {
  'woogi-kosu': {title: 'Woogi Koşusu', trimStart: 6.0, len: 7.5, bbox: {x: 16, y: 183, w: 508, h: 508}},
  'motor-yarisi': {title: 'Gece Motor Yarışı', trimStart: 5.0, len: 7.5, bbox: {x: 16, y: 199, w: 508, h: 740}},
  'tekne-yarisi': {title: 'Tekne Yarışı', trimStart: 1.5, len: 6.8, bbox: {x: 16, y: 201, w: 508, h: 740}},
  'labirent': {title: 'Altın Labirenti', trimStart: 4.0, len: 7.5, bbox: {x: 16, y: 176, w: 508, h: 508}},
  'muzik-calgi': {
    title: 'Woogi Müzik Çalgısı', trimStart: 0.5, len: 7.5,
    bbox: {x: 30, y: 120, w: 480, h: 206.328125}, pad: {t: 70, r: 10, b: 10, l: 10}, pulse: true,
  },
};

const NATIVE_W = 540;
const NATIVE_H = 960;

export const woogiDuration = (slug) => Math.round(GAMES[slug].len * WOOGI_FPS);

export const WoogiShort = ({slug = 'woogi-kosu'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cfg = GAMES[slug];
  const pad = cfg.pad || {t: 0, r: 0, b: 0, l: 0};

  const x = Math.max(0, cfg.bbox.x - pad.l);
  const y = Math.max(0, cfg.bbox.y - pad.t);
  const w = cfg.bbox.w + pad.l + pad.r;
  const h = cfg.bbox.h + pad.t + pad.b;

  const scale = 1080 / w;
  const cropH = h * scale;
  const topOffset = (1920 - cropH) / 2;

  const t = frame / fps;
  const fadeIn = interpolate(t, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(t, [cfg.len - 0.5, cfg.len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const audioVolume = Math.min(fadeIn, fadeOut);

  const pulseFilter = cfg.pulse
    ? `brightness(${1 + 0.045 * Math.sin((2 * Math.PI * t) / 0.55)}) saturate(1.12)`
    : 'none';

  return (
    <AbsoluteFill style={{background: BRAND}}>
      <div style={{
        position: 'absolute', left: 0, top: topOffset, width: 1080, height: cropH, overflow: 'hidden',
        filter: pulseFilter,
      }}>
        <Video
          src={staticFile(`woogi/${slug}.webm`)}
          startFrom={Math.round(cfg.trimStart * WOOGI_FPS)}
          endAt={Math.round((cfg.trimStart + cfg.len) * WOOGI_FPS)}
          style={{
            position: 'absolute', left: -x * scale, top: -y * scale,
            width: NATIVE_W * scale, height: NATIVE_H * scale,
          }}
        />
      </div>

      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1080, height: 170,
        background: BRAND, opacity: 0.92,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          fontSize: 64, fontWeight: 700, color: '#fff', textAlign: 'center',
          textShadow: '2px 2px 4px rgba(0,0,0,.5)', fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}>{cfg.title}</div>
      </div>

      <Audio src={staticFile('woogi/music.mp3')} volume={audioVolume} />
    </AbsoluteFill>
  );
};
