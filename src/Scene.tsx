import React from 'react';
import {AbsoluteFill, Img, Sequence, Audio, interpolate, useCurrentFrame, staticFile} from 'remotion';

export const KenBurnsImage: React.FC<{
	src: string;
	fadeIn?: boolean;
	fadeOut?: boolean;
	durationInFrames: number;
	zoomFrom?: number;
	zoomTo?: number;
}> = ({src, fadeIn = true, fadeOut = true, durationInFrames, zoomFrom = 1.0, zoomTo = 1.08}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fadeFrames = 12;
	let opacity = 1;
	if (fadeIn) {
		opacity = Math.min(opacity, interpolate(frame, [0, fadeFrames], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	}
	if (fadeOut) {
		opacity = Math.min(
			opacity,
			interpolate(frame, [durationInFrames - fadeFrames, durationInFrames], [1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			}),
		);
	}
	return (
		<AbsoluteFill style={{backgroundColor: '#000', opacity}}>
			<Img
				src={staticFile(src)}
				style={{
					width: '100%',
					height: '100%',
					objectFit: 'cover',
					transform: `scale(${scale})`,
				}}
			/>
		</AbsoluteFill>
	);
};

export const SceneWithText: React.FC<{
	src: string;
	durationInFrames: number;
	fadeIn?: boolean;
	fadeOut?: boolean;
	zoomFrom?: number;
	zoomTo?: number;
	children?: React.ReactNode;
}> = ({src, durationInFrames, fadeIn, fadeOut, zoomFrom, zoomTo, children}) => {
	return (
		<AbsoluteFill>
			<KenBurnsImage
				src={src}
				durationInFrames={durationInFrames}
				fadeIn={fadeIn}
				fadeOut={fadeOut}
				zoomFrom={zoomFrom}
				zoomTo={zoomTo}
			/>
			{children}
		</AbsoluteFill>
	);
};

export const Hit: React.FC<{src: string; from: number; durationInFrames?: number; volume?: number}> = ({
	src,
	from,
	durationInFrames = 20,
	volume = 1,
}) => (
	<Sequence from={from} durationInFrames={durationInFrames} layout="none">
		<Audio src={staticFile(src)} volume={volume} />
	</Sequence>
);
