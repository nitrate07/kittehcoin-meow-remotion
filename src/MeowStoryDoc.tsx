import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame} from 'remotion';
import {SceneWithText} from './Scene';
import {CoinCard, CoinIconKind, ImageCard} from './CoinCard';

const FONT = "'Arial Black', Arial, sans-serif";
const GOLD = '#FFC94A';

const HookText: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [8, 25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
			<div
				style={{
					opacity,
					color: GOLD,
					fontFamily: FONT,
					fontSize: 64,
					fontWeight: 900,
					textAlign: 'center',
					textShadow: '0 0 30px rgba(255,201,74,0.8), 0 4px 12px rgba(0,0,0,0.9)',
					letterSpacing: 2,
					lineHeight: 1.1,
					padding: '0 60px',
				}}
			>
				THE NEXT
				<br />
				MEME COIN?
			</div>
		</AbsoluteFill>
	);
};

const CARDS: {kind: CoinIconKind; glow: string; border: string; name: string; caption: string}[] = [
	{kind: 'btc', glow: '#F7931A', border: '#F7931A', name: 'BITCOIN', caption: 'DID YOU MISS IT?'},
	{kind: 'eth', glow: '#8C8CF9', border: '#8C8CF9', name: 'ETHEREUM', caption: 'DID YOU MISS IT?'},
	{kind: 'sol', glow: '#9945FF', border: '#14F1B2', name: 'SOLANA', caption: 'DID YOU MISS IT?'},
	{kind: 'doge', glow: '#E7B33E', border: '#E7B33E', name: 'DOGE', caption: 'TOO LATE?'},
	{kind: 'shib', glow: '#FF5A3D', border: '#FF5A3D', name: 'SHIBA', caption: 'MISSED THIS ONE TOO?'},
];

const CARD_LEN = 144; // 4.8s each, documentary-paced hold
const OPEN_LEN = 45; // 1.5s dark open
const CARDS_START = OPEN_LEN;
const CARDS_END = CARDS_START + CARD_LEN * CARDS.length; // 45 + 720 = 765
const MEOW_LEN = 200; // 6.67s — long enough for the stretched stinger to ring out fully
const MEOW_START = CARDS_END; // 765, straight cut, no portal scene
const TOTAL = MEOW_START + MEOW_LEN; // 965 = 32.17s

// One continuous music bed (teaser.mp3, unbroken start to finish — no track switch),
// a short "dun" hit under every card cut, and a single long time-stretched stinger
// under the MEOW reveal that the whole video ends on (no portal scene, no separate
// outro track, no CTA tail after it — the stretched hit + the fading music are the ending).
export const MeowStoryDoc: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{/* ===== AUDIO =====
			   Flat (non-animated) volumes per segment, not a long per-frame interpolate —
			   Remotion bakes a function-volume into a discrete ffmpeg expression per sampled
			   frame, and past a few hundred frames that expression overflows ffmpeg's parser
			   and silently fails (this was the root cause of an earlier "fade doesn't apply"
			   bug). Fades are instead applied reliably in the post-render ffmpeg encode pass.
			   Bed swapped to the atmospheric "Mysterious" signal-drone track (was the hype/epic
			   teaser cue) — its own 24s runs under the dark-open+card span and is allowed to
			   run out ~1.5s before the reveal, leaving a deliberate held-silence beat before
			   the stinger hits, rather than being topped up or looped. */}
			<Sequence from={0} durationInFrames={CARDS_END} layout="none">
				<Audio src={staticFile('audio/signal.wav')} volume={1.3} />
			</Sequence>
			{/* bridges the ~1.5s gap after signal.wav runs out — a quiet build-up riser
			   (its own peak zone) leading straight into the stinger, so the pause reads as
			   rising tension rather than a hard silence dropout */}
			<Sequence from={MEOW_START - 75} durationInFrames={75} layout="none">
				<Audio src={staticFile('audio/riser.wav')} startFrom={285} volume={0.35} />
			</Sequence>
			{/* short "dun" hit at every card cut */}
			{CARDS.map((c, i) => (
				<Sequence key={`dun-${c.name}`} from={CARDS_START + i * CARD_LEN} durationInFrames={18} layout="none">
					<Audio src={staticFile('audio/dun.mp3')} volume={0.8} />
				</Sequence>
			))}
			{/* the same hit, time-stretched into a long ringing "daaaaunnn" under the MEOW reveal */}
			<Sequence from={MEOW_START} durationInFrames={MEOW_LEN} layout="none">
				<Audio src={staticFile('audio/meow_stinger.wav')} volume={1.0} />
			</Sequence>

			{/* ===== 0-1.5s DARK OPEN ===== */}
			<Sequence from={0} durationInFrames={OPEN_LEN} layout="none">
				<SceneWithText src="images/hook_rings.jpg" durationInFrames={OPEN_LEN} fadeIn={false} zoomFrom={1.0} zoomTo={1.08}>
					<HookText />
				</SceneWithText>
			</Sequence>

			{/* ===== 1.5-25.5s CARD "CASE STUDIES" — 5 cards, 4.8s each ===== */}
			{CARDS.map((c, i) => {
				const from = CARDS_START + i * CARD_LEN;
				return (
					<Sequence key={c.name} from={from} durationInFrames={CARD_LEN} layout="none">
						<CoinCard kind={c.kind} glow={c.glow} borderColor={c.border} name={c.name} caption={c.caption} durationInFrames={CARD_LEN} />
					</Sequence>
				);
			})}

			{/* ===== 25.5-32.17s MEOW REVEAL — straight cut from SHIBA, the video ends here.
			   Same card-box footprint as the other 5 (glow bg + 380x540 card), but the card
			   face is the cropped ChatGPT MEOW art instead of a coded icon. ===== */}
			<Sequence from={MEOW_START} durationInFrames={MEOW_LEN} layout="none">
				<ImageCard
					src="images/meow_card_final.png"
					glow="#FFC94A"
					caption="THIS TIME, DON'T MISS IT."
					captionColor="#FFC94A"
					durationInFrames={MEOW_LEN}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};
