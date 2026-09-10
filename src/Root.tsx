import {Composition} from 'remotion';
import {MeowStory} from './MeowStory';
import {MeowStoryDoc} from './MeowStoryDoc';
import {MeowStoryV2, MEOW_V2_TOTAL_FRAMES} from './MeowStoryV2';
import {MemeOrigin2013, MemeToTheMoon, MemeSignal, MemeBuyMoon} from './MemeGifs';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="MeowStory"
				component={MeowStory}
				durationInFrames={1200}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="MeowStoryDoc"
				component={MeowStoryDoc}
				durationInFrames={965}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="MeowStoryV2"
				component={MeowStoryV2}
				durationInFrames={MEOW_V2_TOTAL_FRAMES}
				fps={30}
				width={1080}
				height={1920}
			/>
			<Composition
				id="MemeOrigin2013"
				component={MemeOrigin2013}
				durationInFrames={90}
				fps={30}
				width={420}
				height={746}
			/>
			<Composition
				id="MemeToTheMoon"
				component={MemeToTheMoon}
				durationInFrames={90}
				fps={30}
				width={420}
				height={746}
			/>
			<Composition
				id="MemeSignal"
				component={MemeSignal}
				durationInFrames={90}
				fps={30}
				width={420}
				height={746}
			/>
			<Composition
				id="MemeBuyMoon"
				component={MemeBuyMoon}
				durationInFrames={90}
				fps={30}
				width={420}
				height={746}
			/>
		</>
	);
};
