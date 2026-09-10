import React from 'react';
import {AbsoluteFill, random, spring, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const FONT = "'Arial Black', Arial, sans-serif";
const GOLD = '#FFC94A';

const CatSilhouette: React.FC<{size: number; color: string; glow?: number}> = ({size, color, glow = 1}) => (
	<div style={{position: 'relative', width: size, height: size * 0.87}}>
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: size * 0.09,
				width: 0,
				height: 0,
				borderLeft: `${size * 0.15}px solid transparent`,
				borderRight: `${size * 0.15}px solid transparent`,
				borderBottom: `${size * 0.31}px solid ${color}`,
				transform: 'rotate(-18deg)',
				filter: `drop-shadow(0 0 ${18 * glow}px ${color})`,
			}}
		/>
		<div
			style={{
				position: 'absolute',
				top: 0,
				right: size * 0.09,
				width: 0,
				height: 0,
				borderLeft: `${size * 0.15}px solid transparent`,
				borderRight: `${size * 0.15}px solid transparent`,
				borderBottom: `${size * 0.31}px solid ${color}`,
				transform: 'rotate(18deg)',
				filter: `drop-shadow(0 0 ${18 * glow}px ${color})`,
			}}
		/>
		<div
			style={{
				position: 'absolute',
				bottom: 0,
				left: size * 0.03,
				width: size * 0.94,
				height: size * 0.79,
				borderRadius: '50%',
				background: color,
				filter: `drop-shadow(0 0 ${24 * glow}px ${color})`,
			}}
		/>
	</div>
);

// Deterministic twinkling starfield — no source image, pure generated dots.
const Starfield: React.FC<{count: number; seed: string}> = ({count, seed}) => {
	const frame = useCurrentFrame();
	const stars = new Array(count).fill(0).map((_, i) => {
		const x = random(`${seed}-x-${i}`) * 100;
		const y = random(`${seed}-y-${i}`) * 100;
		const r = 1 + random(`${seed}-r-${i}`) * 2;
		const phase = random(`${seed}-p-${i}`) * 100;
		const tw = 0.4 + 0.6 * Math.abs(Math.sin((frame + phase) / (8 + (i % 5))));
		return {x, y, r, tw};
	});
	return (
		<AbsoluteFill>
			{stars.map((s, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: `${s.x}%`,
						top: `${s.y}%`,
						width: s.r,
						height: s.r,
						borderRadius: '50%',
						background: '#fff',
						opacity: s.tw,
					}}
				/>
			))}
		</AbsoluteFill>
	);
};

// ===== 1) "2013" origin — cat silhouette forms out of scattering gold particles,
// a ring pulses outward, "2013" snaps in. Nothing here is a photo. =====
export const MemeOrigin2013: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const assemble = spring({frame, fps, config: {damping: 14, stiffness: 90}, durationInFrames: 40});
	const ringScale = interpolate(frame % 45, [0, 45], [0.6, 2.2]);
	const ringOpacity = interpolate(frame % 45, [0, 10, 45], [0, 0.5, 0]);
	const textE = spring({frame: frame - 20, fps, config: {damping: 12, stiffness: 170}, durationInFrames: 20});

	// particles converge into the cat's position
	const particles = new Array(40).fill(0).map((_, i) => {
		const angle = random(`ang-${i}`) * Math.PI * 2;
		const dist = 260 * (1 - assemble);
		const px = Math.cos(angle) * dist;
		const py = Math.sin(angle) * dist;
		return {px, py, o: interpolate(assemble, [0, 0.7], [1, 0])};
	});

	return (
		<AbsoluteFill style={{background: '#07080c', justifyContent: 'center', alignItems: 'center'}}>
			<Starfield count={70} seed="o2013" />
			<div
				style={{
					position: 'absolute',
					width: 300,
					height: 300,
					borderRadius: '50%',
					border: `2px solid ${GOLD}`,
					transform: `scale(${ringScale})`,
					opacity: ringOpacity,
				}}
			/>
			<div style={{position: 'relative'}}>
				{particles.map((p, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: p.px,
							top: p.py,
							width: 5,
							height: 5,
							borderRadius: '50%',
							background: GOLD,
							opacity: p.o,
						}}
					/>
				))}
				<div style={{opacity: interpolate(assemble, [0.3, 1], [0, 1])}}>
					<CatSilhouette size={150} color={GOLD} />
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 130,
					opacity: interpolate(textE, [0, 1], [0, 1]),
					transform: `scale(${interpolate(textE, [0, 1], [0.7, 1])})`,
					fontFamily: FONT,
					fontWeight: 900,
					fontSize: 64,
					color: GOLD,
					textShadow: `0 0 30px ${GOLD}`,
					letterSpacing: 3,
				}}
			>
				2013
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 90,
					opacity: interpolate(textE, [0, 1], [0, 1]),
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 20,
					color: '#c9c2b0',
					letterSpacing: 4,
				}}
			>
				WHERE IT BEGAN
			</div>
		</AbsoluteFill>
	);
};

// ===== 2) "TO THE MOON" — a coded ascending trail (particles + a streak), the cat
// riding it, bouncing text. No source image. =====
export const MemeToTheMoon: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const rise = interpolate(frame, [0, 90], [820, -260], {extrapolateRight: 'clamp'});
	const bounce = Math.sin(frame / 6) * 10;
	const textE = spring({frame, fps, config: {damping: 10, stiffness: 140}, durationInFrames: 18});

	const trail = new Array(28).fill(0).map((_, i) => {
		const t = i / 28;
		const wobble = Math.sin(frame / 10 + i) * 22;
		const y = rise + t * 300;
		const size = 10 - t * 7;
		return {x: 210 + wobble, y, size, o: 1 - t};
	});

	return (
		<AbsoluteFill style={{background: '#07080c', overflow: 'hidden'}}>
			<Starfield count={50} seed="moon" />
			{trail.map((p, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: p.x,
						top: p.y,
						width: p.size,
						height: p.size,
						borderRadius: '50%',
						background: GOLD,
						opacity: p.o * 0.9,
						filter: 'blur(0.5px)',
					}}
				/>
			))}
			<div style={{position: 'absolute', left: 210 - 75, top: rise - 90}}>
				<CatSilhouette size={150} color={GOLD} glow={1.4} />
			</div>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div
					style={{
						transform: `translateY(${bounce}px) scale(${interpolate(textE, [0, 1], [0.6, 1])})`,
						opacity: interpolate(textE, [0, 1], [0, 1]),
						textAlign: 'center',
					}}
				>
					<div
						style={{
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: 58,
							color: GOLD,
							textShadow: `0 0 30px ${GOLD}`,
							letterSpacing: 2,
						}}
					>
						$MEOW
					</div>
					<div style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: '#fff', marginTop: 6}}>TO THE MOON</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ===== 4) "BUY $MEOW" — purple moon-mission cut for new-user acquisition: a BUY
// button rides an ascending trail toward a coded moon, welcoming copy underneath.
// No source image, purple palette (distinct from the gold brand cut). =====
export const MemeBuyMoon: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const PURPLE = '#B084FF';
	const PURPLE_DEEP = '#7C3AED';

	const rise = interpolate(frame, [0, 90], [780, -180], {extrapolateRight: 'clamp'});
	const bounce = Math.sin(frame / 6) * 8;
	const buttonE = spring({frame, fps, config: {damping: 11, stiffness: 150}, durationInFrames: 16});
	const textE = spring({frame: frame - 14, fps, config: {damping: 12, stiffness: 150}, durationInFrames: 18});
	const moonPulse = 1 + 0.03 * Math.sin(frame / 14);

	const trail = new Array(26).fill(0).map((_, i) => {
		const t = i / 26;
		const wobble = Math.sin(frame / 9 + i) * 20;
		const y = rise + t * 280;
		const size = 9 - t * 6;
		return {x: 210 + wobble, y, size, o: 1 - t};
	});

	return (
		<AbsoluteFill style={{background: '#0c0714', overflow: 'hidden'}}>
			<Starfield count={55} seed="buymoon" />
			{/* coded moon, top of frame */}
			<div
				style={{
					position: 'absolute',
					top: -70,
					left: '50%',
					transform: `translateX(-50%) scale(${moonPulse})`,
					width: 220,
					height: 220,
					borderRadius: '50%',
					background: 'radial-gradient(circle at 38% 35%, #e8dcff 0%, #c9b6f2 45%, #9a86c9 100%)',
					boxShadow: `0 0 60px ${PURPLE}`,
				}}
			>
				{[
					{x: 60, y: 90, r: 14},
					{x: 130, y: 60, r: 9},
					{x: 100, y: 140, r: 11},
					{x: 160, y: 130, r: 7},
				].map((c, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: c.x,
							top: c.y,
							width: c.r,
							height: c.r,
							borderRadius: '50%',
							background: 'rgba(120,100,160,0.35)',
						}}
					/>
				))}
			</div>

			{trail.map((p, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: p.x,
						top: p.y,
						width: p.size,
						height: p.size,
						borderRadius: '50%',
						background: PURPLE,
						opacity: p.o * 0.9,
						filter: 'blur(0.5px)',
					}}
				/>
			))}

			{/* the BUY button riding the trail */}
			<div
				style={{
					position: 'absolute',
					left: 210,
					top: rise - 34,
					transform: `translateX(-50%) scale(${interpolate(buttonE, [0, 1], [0.5, 1])})`,
					opacity: interpolate(buttonE, [0, 1], [0, 1]),
					background: `linear-gradient(135deg, ${PURPLE}, ${PURPLE_DEEP})`,
					borderRadius: 999,
					padding: '10px 26px',
					fontFamily: FONT,
					fontWeight: 900,
					fontSize: 26,
					color: '#fff',
					letterSpacing: 1,
					boxShadow: `0 0 30px ${PURPLE_DEEP}`,
					whiteSpace: 'nowrap',
				}}
			>
				BUY $MEOW
			</div>

			<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 80}}>
				<div
					style={{
						transform: `translateY(${bounce}px) scale(${interpolate(textE, [0, 1], [0.7, 1])})`,
						opacity: interpolate(textE, [0, 1], [0, 1]),
						textAlign: 'center',
						padding: '0 40px',
					}}
				>
					<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 30, color: PURPLE, textShadow: `0 0 24px ${PURPLE_DEEP}`}}>
						NEW HERE?
					</div>
					<div style={{fontFamily: FONT, fontWeight: 700, fontSize: 20, color: '#e7ddff', marginTop: 8}}>
						JOIN THE RIDE — EVERYONE STARTS SOMEWHERE
					</div>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ===== 3) "THE SIGNAL RETURNS" — pulsing radar rings around the coded cat icon,
// no source image. =====
export const MemeSignal: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const textE = spring({frame, fps, config: {damping: 12, stiffness: 150}, durationInFrames: 18});
	const rings = [0, 16, 32].map((offset) => {
		const local = (frame + offset) % 48;
		return {
			scale: interpolate(local, [0, 48], [0.4, 2.6]),
			opacity: interpolate(local, [0, 8, 48], [0, 0.55, 0]),
		};
	});
	const pulse = 1 + 0.05 * Math.sin(frame / 10);

	return (
		<AbsoluteFill style={{background: '#07080c', justifyContent: 'center', alignItems: 'center'}}>
			<Starfield count={40} seed="signal" />
			{rings.map((r, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						width: 260,
						height: 260,
						borderRadius: '50%',
						border: `2px solid ${GOLD}`,
						transform: `scale(${r.scale})`,
						opacity: r.opacity,
					}}
				/>
			))}
			<div style={{transform: `scale(${pulse})`}}>
				<CatSilhouette size={170} color={GOLD} glow={1.3} />
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 110,
					opacity: interpolate(textE, [0, 1], [0, 1]),
					transform: `scale(${interpolate(textE, [0, 1], [0.7, 1])})`,
					textAlign: 'center',
				}}
			>
				<div style={{fontFamily: FONT, fontWeight: 900, fontSize: 34, color: GOLD, letterSpacing: 2}}>THE SIGNAL RETURNS</div>
			</div>
		</AbsoluteFill>
	);
};
