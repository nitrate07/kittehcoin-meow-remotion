import {random, spring, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Spring-physics entrance: card snaps in with a slight overshoot (underdamped),
// instead of a linear fade/zoom. Returns scale/translateY/opacity to apply.
export const useEntrance = (hitFrame: number) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const local = frame - hitFrame;
	const e = spring({frame: local, fps, config: {damping: 11, stiffness: 170, mass: 0.9}, durationInFrames: 20});
	const scale = interpolate(e, [0, 1], [0.8, 1]);
	const translateY = interpolate(e, [0, 1], [70, 0]);
	const opacity = interpolate(local, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return {scale, translateY, opacity, local};
};

// Continuous slow drift so nothing is ever perfectly still — different seed per
// layer gives a cheap parallax feel even with no camera movement.
export const useDrift = (seed: string, ampX = 6, ampY = 4, ampRot = 0.6) => {
	const frame = useCurrentFrame();
	const o = Math.floor(random(seed) * 1000);
	const x = Math.sin((frame + o) / 45) * ampX;
	const y = Math.cos((frame + o) / 60) * ampY;
	const rot = Math.sin((frame + o) / 90) * ampRot;
	return {x, y, rot};
};

// Decaying screen-shake around a hit frame — exponential falloff, deterministic
// per-frame randomness (no jitter between renders).
export const useShake = (hitFrame: number, amp = 14, lifeFrames = 14) => {
	const frame = useCurrentFrame();
	const local = frame - hitFrame;
	if (local < 0 || local > lifeFrames) return {x: 0, y: 0};
	const decay = Math.exp(-local / (lifeFrames / 3.5));
	const x = (random(`shx-${hitFrame}-${local}`) * 2 - 1) * amp * decay;
	const y = (random(`shy-${hitFrame}-${local}`) * 2 - 1) * amp * decay;
	return {x, y};
};

// Short white flash + chromatic-aberration ghost offset, both decaying — returns
// values to compose into overlay opacity / ghost-copy transforms.
export const useImpactFX = (hitFrame: number, lifeFrames = 10) => {
	const frame = useCurrentFrame();
	const local = frame - hitFrame;
	if (local < 0 || local > lifeFrames) return {flash: 0, aberration: 0};
	const t = local / lifeFrames;
	const flash = interpolate(local, [0, 2, lifeFrames], [0, 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const aberration = interpolate(t, [0, 1], [7, 0], {easing: (x) => 1 - Math.pow(1 - x, 3)});
	return {flash, aberration};
};
