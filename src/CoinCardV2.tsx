import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {visualizeAudio, AudioData} from '@remotion/media-utils';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {useEntrance, useDrift, useShake, useImpactFX} from './motion';

const FONT = "'Arial Black', Arial, sans-serif";

const CatIcon: React.FC<{color: string}> = ({color}) => (
	<div style={{position: 'relative', width: 150, height: 130}}>
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 14,
				width: 0,
				height: 0,
				borderLeft: '22px solid transparent',
				borderRight: '22px solid transparent',
				borderBottom: `46px solid ${color}`,
				transform: 'rotate(-18deg)',
			}}
		/>
		<div
			style={{
				position: 'absolute',
				top: 0,
				right: 14,
				width: 0,
				height: 0,
				borderLeft: '22px solid transparent',
				borderRight: '22px solid transparent',
				borderBottom: `46px solid ${color}`,
				transform: 'rotate(18deg)',
			}}
		/>
		<div style={{position: 'absolute', bottom: 0, left: 5, width: 140, height: 118, borderRadius: '50%', background: color}} />
		<div style={{position: 'absolute', bottom: 55, left: 45, width: 14, height: 20, borderRadius: '50%', background: '#0b0d12'}} />
		<div style={{position: 'absolute', bottom: 55, right: 45, width: 14, height: 20, borderRadius: '50%', background: '#0b0d12'}} />
	</div>
);

export type CoinIconKind = 'btc' | 'eth' | 'doge' | 'meow';

const Icon: React.FC<{kind: CoinIconKind; color: string}> = ({kind, color}) => {
	if (kind === 'meow') return <CatIcon color={color} />;
	const glyph = kind === 'btc' ? 'B' : kind === 'eth' ? 'Ξ' : 'Ð';
	return <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 140, color, textShadow: `0 0 30px ${color}`}}>{glyph}</div>;
};

/**
 * A coin card with: spring entrance (overshoot snap-in instead of a fade), a
 * per-frame drift so the frame is never perfectly still, a shake+flash hit on
 * entrance, and — when audioData is supplied — a glow that visibly pulses with
 * the track's low end.
 */
export const CoinCardV2: React.FC<{
	kind: CoinIconKind;
	glow: string;
	borderColor: string;
	name: string;
	caption?: string;
	captionColor?: string;
	progress?: string;
	hitFrame?: number;
	seed: string;
	audioData?: AudioData | null;
	imageSrc?: string;
	fullImpact?: boolean; // full chromatic-aberration + bigger shake, for the MEOW reveal only
}> = ({
	kind,
	glow,
	borderColor,
	name,
	caption,
	captionColor = '#9aa0b4',
	progress,
	hitFrame = 0,
	seed,
	audioData,
	imageSrc,
	fullImpact = false,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const {scale, translateY, opacity} = useEntrance(hitFrame);
	const drift = useDrift(seed, 5, 3, 0.4);
	const bgDrift = useDrift(seed + '-bg', 10, 6, 0);
	const shake = useShake(hitFrame, fullImpact ? 22 : 10, fullImpact ? 18 : 10);
	const {flash, aberration} = useImpactFX(hitFrame, fullImpact ? 16 : 8);

	let glowBoost = 1;
	if (audioData) {
		const vis = visualizeAudio({audioData, frame, fps, numberOfSamples: 16});
		const low = (vis[1] + vis[2] + vis[3]) / 3;
		glowBoost = 1 + Math.min(low * 3, 1.1);
	}

	const cardInner = imageSrc ? (
		<Img src={staticFile(imageSrc)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
	) : (
		<>
			<Icon kind={kind} color={glow} />
			<div
				style={{
					color: '#fff',
					fontFamily: FONT,
					fontWeight: 900,
					fontSize: 42,
					letterSpacing: 4,
					textShadow: `0 0 20px ${glow}`,
				}}
			>
				{name}
			</div>
		</>
	);

	return (
		<AbsoluteFill style={{background: '#050608', transform: `translate(${shake.x}px, ${shake.y}px)`}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 42%, ${glow} 0%, rgba(0,0,0,0) ${62 * glowBoost}%)`,
					opacity: 0.5 * glowBoost,
					transform: `translate(${bgDrift.x}px, ${bgDrift.y}px)`,
				}}
			/>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div
					style={{
						position: 'relative',
						transform: `translate(${drift.x}px, ${drift.y + translateY}px) scale(${scale}) rotate(${drift.rot}deg)`,
						opacity,
					}}
				>
					{/* chromatic aberration ghosts (reveal only) */}
					{fullImpact && aberration > 0.3 && (
						<>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									transform: `translateX(${aberration}px)`,
									mixBlendMode: 'screen',
									opacity: 0.6,
								}}
							>
								<CardShell imageSrc={imageSrc} glow={glow} borderColor={borderColor} tint="#ff0040">
									{cardInner}
								</CardShell>
							</div>
							<div
								style={{
									position: 'absolute',
									inset: 0,
									transform: `translateX(${-aberration}px)`,
									mixBlendMode: 'screen',
									opacity: 0.6,
								}}
							>
								<CardShell imageSrc={imageSrc} glow={glow} borderColor={borderColor} tint="#00d4ff">
									{cardInner}
								</CardShell>
							</div>
						</>
					)}
					<CardShell imageSrc={imageSrc} glow={glow} borderColor={borderColor} glowBoost={glowBoost}>
						{cardInner}
					</CardShell>
					{/* light sweep glint */}
					{fullImpact && (
						<div
							style={{
								position: 'absolute',
								inset: 0,
								borderRadius: 32,
								overflow: 'hidden',
								pointerEvents: 'none',
							}}
						>
							<LightSweep hitFrame={hitFrame} />
						</div>
					)}
				</div>
				{caption && (
					<div
						style={{
							marginTop: 56,
							color: captionColor,
							fontFamily: FONT,
							fontWeight: 700,
							fontSize: 30,
							letterSpacing: 3,
							transform: `translateY(${drift.y * 0.5}px)`,
						}}
					>
						{caption}
					</div>
				)}
				{progress && (
					<div
						style={{
							position: 'absolute',
							bottom: 90,
							color: '#5a6070',
							fontFamily: FONT,
							fontWeight: 700,
							fontSize: 22,
							letterSpacing: 4,
						}}
					>
						{progress}
					</div>
				)}
			</AbsoluteFill>
			{/* impact flash */}
			{flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
		</AbsoluteFill>
	);
};

const CardShell: React.FC<{
	imageSrc?: string;
	glow: string;
	borderColor: string;
	tint?: string;
	glowBoost?: number;
	children: React.ReactNode;
}> = ({imageSrc, glow, borderColor, tint, glowBoost = 1, children}) => (
	<div
		style={{
			width: 380,
			height: 540,
			borderRadius: 32,
			background: tint ?? '#0b0d12',
			border: `2px solid ${tint ?? borderColor}`,
			boxShadow: `0 0 ${70 * glowBoost}px ${glow}, inset 0 0 50px rgba(0,0,0,0.6)`,
			display: imageSrc ? 'block' : 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'center',
			gap: 28,
			overflow: 'hidden',
		}}
	>
		{children}
	</div>
);

const LightSweep: React.FC<{hitFrame: number}> = ({hitFrame}) => {
	const frame = useCurrentFrame();
	const local = frame - hitFrame;
	if (local < 4 || local > 34) return null;
	const t = (local - 4) / 30;
	const pos = interpolate(t, [0, 1], [-60, 160]);
	return (
		<div
			style={{
				position: 'absolute',
				top: '-20%',
				left: `${pos}%`,
				width: '30%',
				height: '140%',
				background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent)',
				transform: 'rotate(0deg)',
			}}
		/>
	);
};

function interpolate(t: number, range: [number, number], out: [number, number]) {
	const [i0, i1] = range;
	const [o0, o1] = out;
	const clamped = Math.max(0, Math.min(1, (t - i0) / (i1 - i0)));
	return o0 + (o1 - o0) * clamped;
}
