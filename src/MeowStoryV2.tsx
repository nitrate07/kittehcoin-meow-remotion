import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame} from 'remotion';
import {useAudioData} from '@remotion/media-utils';
import {CoinCardV2, CoinIconKind} from './CoinCardV2';

const FONT = "'Arial Black', Arial, sans-serif";
const GOLD = '#FFC94A';

const TopBanner: React.FC<{until: number}> = ({until}) => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [0, 8, until - 10, until], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 90}}>
			<div
				style={{
					opacity,
					color: GOLD,
					fontFamily: FONT,
					fontWeight: 900,
					fontSize: 40,
					letterSpacing: 2,
					textShadow: '0 0 20px rgba(255,201,74,0.7), 0 3px 10px rgba(0,0,0,0.9)',
				}}
			>
				THE NEXT MEME COIN?
			</div>
		</AbsoluteFill>
	);
};

const CtaOverlay: React.FC<{hitFrame: number}> = ({hitFrame}) => {
	const frame = useCurrentFrame();
	const local = frame - hitFrame;
	const opacity = interpolate(local, [90, 105], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 40}}>
			<div
				style={{
					opacity,
					color: '#fff',
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 22,
					letterSpacing: 2,
					textShadow: '0 2px 8px rgba(0,0,0,0.9)',
				}}
			>
				$MEOW · KITTEHCOIN
			</div>
		</AbsoluteFill>
	);
};

const CARDS: {kind: CoinIconKind; glow: string; border: string; name: string; caption: string; progress: string}[] = [
	{kind: 'btc', glow: '#F7931A', border: '#F7931A', name: 'BITCOIN', caption: 'MISSED IT', progress: '1 / 3'},
	{kind: 'eth', glow: '#8C8CF9', border: '#8C8CF9', name: 'ETHEREUM', caption: 'MISSED IT AGAIN', progress: '2 / 3'},
	{kind: 'doge', glow: '#E7B33E', border: '#E7B33E', name: 'DOGE', caption: 'STILL MISSING IT?', progress: '3 / 3'},
];

const CARD_LEN = 69; // 2.3s each — hard cuts, spring entrance, no cross-fade
const CARDS_END = CARD_LEN * CARDS.length; // 207
const MEOW_LEN = 144; // 4.8s — the money frame, full impact package
export const MEOW_V2_TOTAL_FRAMES = CARDS_END + MEOW_LEN; // 351 = 11.7s
const TOTAL = MEOW_V2_TOTAL_FRAMES;

// Ground-up rebuild per two research passes: (1) retention research said the old
// cut was ~2x too long and ~3x too slow per beat, with a dead dark opener — cut to
// 3 recognizable coins at 2.3s each, open directly on the first card's own impact
// instead of a slow dark intro. (2) motion-craft research said the whole project
// was a slideshow (one linear zoom, nothing else) — this version adds spring-physics
// entrances, continuous drift, audio-reactive glow tied to the actual soundtrack,
// and a full shake/flash/chromatic-aberration/light-sweep package on the MEOW hit.
export const MeowStoryV2: React.FC = () => {
	const audioData = useAudioData(staticFile('audio/signal.wav'));

	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{/* ===== AUDIO ===== */}
			<Sequence from={0} durationInFrames={CARDS_END} layout="none">
				<Audio src={staticFile('audio/signal.wav')} volume={1.3} />
			</Sequence>
			{CARDS.map((c, i) => (
				<Sequence key={`dun-${c.name}`} from={i * CARD_LEN} durationInFrames={14} layout="none">
					<Audio src={staticFile('audio/dun.mp3')} volume={0.85} />
				</Sequence>
			))}
			<Sequence from={CARDS_END} durationInFrames={MEOW_LEN} layout="none">
				<Audio src={staticFile('audio/meow_stinger.wav')} volume={1.0} />
			</Sequence>

			{/* ===== 0-6.9s: BTC / ETH / DOGE, hard cuts, spring entrance on every hit ===== */}
			{CARDS.map((c, i) => (
				<Sequence key={c.name} from={i * CARD_LEN} durationInFrames={CARD_LEN} layout="none">
					<CoinCardV2
						kind={c.kind}
						glow={c.glow}
						borderColor={c.border}
						name={c.name}
						caption={c.caption}
						progress={c.progress}
						seed={c.name}
						hitFrame={0}
						audioData={audioData}
					/>
					<TopBanner until={CARD_LEN} />
				</Sequence>
			))}

			{/* ===== 6.9-11.7s: MEOW REVEAL — the video ends here, loop-friendly (gold flash
			   echoes the impact flash every card opened with) ===== */}
			<Sequence from={CARDS_END} durationInFrames={MEOW_LEN} layout="none">
				<CoinCardV2
					kind="meow"
					glow={GOLD}
					borderColor={GOLD}
					name="$MEOW"
					caption="DON'T MISS THIS ONE."
					captionColor={GOLD}
					imageSrc="images/meow_card_final.png"
					seed="meow"
					hitFrame={0}
					fullImpact
				/>
				<CtaOverlay hitFrame={0} />
			</Sequence>
		</AbsoluteFill>
	);
};
