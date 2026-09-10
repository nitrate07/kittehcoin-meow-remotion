import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, interpolate, useCurrentFrame} from 'remotion';
import {SceneWithText, Hit} from './Scene';

const FONT = "'Arial Black', Arial, sans-serif";
const GOLD = '#FFC94A';

const HookText: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [10, 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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

const CtaText: React.FC = () => {
	const frame = useCurrentFrame();
	const opacity = interpolate(frame, [20, 45], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pulse = 1 + 0.03 * Math.sin(frame / 8);
	return (
		<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 140}}>
			<div
				style={{
					opacity,
					transform: `scale(${pulse})`,
					color: GOLD,
					fontFamily: FONT,
					fontSize: 96,
					fontWeight: 900,
					letterSpacing: 3,
					textShadow: '0 0 40px rgba(255,201,74,0.9), 0 4px 16px rgba(0,0,0,0.9)',
				}}
			>
				$MEOW
			</div>
			<div
				style={{
					opacity,
					marginTop: 24,
					color: '#fff',
					fontFamily: FONT,
					fontSize: 30,
					fontWeight: 700,
					letterSpacing: 1,
					textShadow: '0 2px 10px rgba(0,0,0,0.9)',
				}}
			>
				KITTEHCOIN
			</div>
		</AbsoluteFill>
	);
};

export const MeowStory: React.FC = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#000'}}>
			{/* ===== MUSIC BED =====
			   Intro (hook/vision/philosophy) boosted since the source track opens quiet;
			   tapers to natural volume once the card countdown starts, holds full through
			   the climax, and only fades in the last 0.5s (short tail, not a long fade-out
			   that would read as "the music stopping early"). */}
			<Sequence from={0} durationInFrames={1020} layout="none">
				<Audio
					src={staticFile('audio/teaser.mp3')}
					volume={(f) =>
						interpolate(f, [0, 270, 1005, 1020], [1.45, 1.05, 1.0, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})
					}
				/>
			</Sequence>
			{/* outro crossfades in early (32.5s) so there's no dead gap, holds full volume
			   through the CTA, and fades only in the closing ~0.8s */}
			<Sequence from={975} durationInFrames={225} layout="none">
				<Audio
					src={staticFile('audio/outro.wav')}
					volume={(f) => interpolate(f, [0, 30, 195, 225], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
				/>
			</Sequence>
			{/* portal riser tail, last 2s of the 12s file, ending right at the reveal cut (frame 720) */}
			<Sequence from={660} durationInFrames={60} layout="none">
				<Audio src={staticFile('audio/riser.wav')} startFrom={300} volume={0.55} />
			</Sequence>

			{/* ===== 0.0-3.0s HOOK ===== */}
			<Sequence from={0} durationInFrames={90} layout="none">
				<SceneWithText src="images/hook_rings.jpg" durationInFrames={90} fadeIn={false} zoomFrom={1.0} zoomTo={1.15}>
					<HookText />
				</SceneWithText>
			</Sequence>

			{/* ===== 3.0-5.75s VISION ===== */}
			<Sequence from={90} durationInFrames={82} layout="none">
				<SceneWithText src="images/vision.png" durationInFrames={82} zoomFrom={1.02} zoomTo={1.1} />
			</Sequence>

			{/* ===== 5.75-8.5s PHILOSOPHY ===== */}
			<Sequence from={172} durationInFrames={83} layout="none">
				<SceneWithText src="images/philosophy.png" durationInFrames={83} zoomFrom={1.0} zoomTo={1.08} />
			</Sequence>

			{/* ===== 8.5-9.5s BREATH / DARK REVEAL (hard cut, no fade) ===== */}
			<Sequence from={255} durationInFrames={30} layout="none">
				<SceneWithText src="images/dark_reveal.png" durationInFrames={30} fadeIn={false} fadeOut={false} zoomFrom={1.0} zoomTo={1.03} />
			</Sequence>

			{/* ===== 9.5-20.0s CARD COUNTDOWN (5 hard cuts, 63f each = 2.1s) ===== */}
			{[
				'images/card_bitcoin.png',
				'images/card_ethereum.png',
				'images/card_solana.png',
				'images/card_doge.png',
				'images/card_shiba.png',
			].map((src, i) => {
				const from = 285 + i * 63;
				return (
					<Sequence key={src} from={from} durationInFrames={63} layout="none">
						<SceneWithText src={src} durationInFrames={63} fadeIn={false} fadeOut={false} zoomFrom={1.0} zoomTo={1.06} />
					</Sequence>
				);
			})}
			{[0, 1, 2, 3, 4].map((i) => {
				const from = 285 + i * 63;
				return (
					<React.Fragment key={i}>
						<Hit src="audio/whoosh.mp3" from={from} durationInFrames={12} volume={0.7} />
						<Hit src="audio/impact.mp3" from={from + 8} durationInFrames={18} volume={0.65} />
					</React.Fragment>
				);
			})}

			{/* ===== 20.0-24.0s PORTAL / SIGNAL ===== */}
			<Sequence from={600} durationInFrames={120} layout="none">
				<SceneWithText src="images/portal_signal.png" durationInFrames={120} zoomFrom={1.0} zoomTo={1.12} />
			</Sequence>

			{/* ===== 24.0-27.0s MEOW REVEAL (hard hit) ===== */}
			<Sequence from={720} durationInFrames={90} layout="none">
				<SceneWithText src="images/card_meow.png" durationInFrames={90} fadeIn={false} zoomFrom={1.0} zoomTo={1.05} />
			</Sequence>

			{/* ===== 27.0-34.0s TITLE LOCK ===== */}
			<Sequence from={810} durationInFrames={210} layout="none">
				<SceneWithText src="images/title_lock.png" durationInFrames={210} fadeOut={false} zoomFrom={1.0} zoomTo={1.06} />
			</Sequence>

			{/* ===== 34.0-40.0s CLOSEUP / CTA ===== */}
			<Sequence from={1020} durationInFrames={180} layout="none">
				<SceneWithText src="images/closeup.png" durationInFrames={180} zoomFrom={1.0} zoomTo={1.1}>
					<CtaText />
				</SceneWithText>
			</Sequence>
		</AbsoluteFill>
	);
};
