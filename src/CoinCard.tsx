import React from 'react';
import {AbsoluteFill, Img, staticFile, interpolate, useCurrentFrame} from 'remotion';

const FONT = "'Arial Black', Arial, sans-serif";

const CatIcon: React.FC<{color: string}> = ({color}) => (
	<div style={{position: 'relative', width: 150, height: 130}}>
		{/* ears */}
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
		{/* head */}
		<div
			style={{
				position: 'absolute',
				bottom: 0,
				left: 5,
				width: 140,
				height: 118,
				borderRadius: '50%',
				background: color,
			}}
		/>
		{/* eyes */}
		<div style={{position: 'absolute', bottom: 55, left: 45, width: 14, height: 20, borderRadius: '50%', background: '#0b0d12'}} />
		<div style={{position: 'absolute', bottom: 55, right: 45, width: 14, height: 20, borderRadius: '50%', background: '#0b0d12'}} />
	</div>
);

const SolBars: React.FC = () => (
	<div style={{display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center'}}>
		{[0, 1, 2].map((i) => (
			<div
				key={i}
				style={{
					width: 140 - i * 8,
					height: 24,
					transform: `skewX(-20deg) translateX(${i * 6}px)`,
					background: 'linear-gradient(90deg, #14F1B2, #9945FF)',
					borderRadius: 4,
				}}
			/>
		))}
	</div>
);

export type CoinIconKind = 'btc' | 'eth' | 'sol' | 'doge' | 'shib' | 'meow';

const Icon: React.FC<{kind: CoinIconKind; color: string}> = ({kind, color}) => {
	if (kind === 'sol') return <SolBars />;
	if (kind === 'meow') return <CatIcon color={color} />;
	if (kind === 'shib') {
		return (
			<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 88, color, textShadow: `0 0 30px ${color}`}}>SHIB</div>
		);
	}
	const glyph = kind === 'btc' ? 'B' : kind === 'eth' ? 'Ξ' : 'Ð';
	return <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 140, color, textShadow: `0 0 30px ${color}`}}>{glyph}</div>;
};

export const CoinCard: React.FC<{
	kind: CoinIconKind;
	glow: string;
	borderColor: string;
	name: string;
	caption?: string;
	captionColor?: string;
	durationInFrames: number;
}> = ({kind, glow, borderColor, name, caption, captionColor = '#9aa0b4', durationInFrames}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.06], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill style={{background: '#050608'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 42%, ${glow} 0%, rgba(0,0,0,0) 62%)`,
					opacity: 0.5,
				}}
			/>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${scale})`}}>
				<div
					style={{
						width: 380,
						height: 540,
						borderRadius: 32,
						background: '#0b0d12',
						border: `2px solid ${borderColor}`,
						boxShadow: `0 0 70px ${glow}, inset 0 0 50px rgba(0,0,0,0.6)`,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: 28,
					}}
				>
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
				</div>
				{caption && (
					<div
						style={{
							marginTop: 56,
							color: captionColor,
							fontFamily: FONT,
							fontWeight: 700,
							fontSize: 26,
							letterSpacing: 3,
						}}
					>
						{caption}
					</div>
				)}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// Same outer shell (glow background, 380x540 card box, zoom) as CoinCard, but the card
// face is a real image (already has its own border/rounded-corner art baked in) instead
// of a coded icon — used for the MEOW reveal so it keeps the same "card" footprint as
// the other 5 coded cards instead of showing a full-bleed poster.
export const ImageCard: React.FC<{
	src: string;
	glow: string;
	caption?: string;
	captionColor?: string;
	durationInFrames: number;
}> = ({src, glow, caption, captionColor = '#9aa0b4', durationInFrames}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, durationInFrames], [1.0, 1.06], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill style={{background: '#050608'}}>
			<AbsoluteFill
				style={{
					background: `radial-gradient(circle at 50% 42%, ${glow} 0%, rgba(0,0,0,0) 62%)`,
					opacity: 0.5,
				}}
			/>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', transform: `scale(${scale})`}}>
				<div
					style={{
						width: 380,
						height: 540,
						borderRadius: 32,
						overflow: 'hidden',
						boxShadow: `0 0 70px ${glow}`,
					}}
				>
					<Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
				</div>
				{caption && (
					<div
						style={{
							marginTop: 56,
							color: captionColor,
							fontFamily: FONT,
							fontWeight: 700,
							fontSize: 26,
							letterSpacing: 3,
						}}
					>
						{caption}
					</div>
				)}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
