import {Composition} from 'remotion';
import {KittehTeaser, FPS, TOTAL_SECONDS} from './Video';
import {WoogiShort, WOOGI_FPS, woogiDuration} from './WoogiShort';
import {MeowCard, MEOWCARD_FPS, MEOWCARD_DURATION} from './MeowCard';
import {MeowVault, VAULT_FPS, VAULT_DURATION} from './MeowVault';
import {MeowSignal, SIGNAL_FPS, SIGNAL_DURATION} from './MeowSignal';
import {MeowGiant, GIANT_FPS, GIANT_DURATION} from './MeowGiant';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="KittehTeaser"
        component={KittehTeaser}
        durationInFrames={Math.round(TOTAL_SECONDS * FPS)}
        fps={FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="WoogiShort"
        component={WoogiShort}
        durationInFrames={woogiDuration('woogi-kosu')}
        fps={WOOGI_FPS}
        width={1080}
        height={1920}
        defaultProps={{slug: 'woogi-kosu'}}
        calculateMetadata={async ({props}) => ({
          durationInFrames: woogiDuration(props.slug),
        })}
      />
      <Composition
        id="MeowCard"
        component={MeowCard}
        durationInFrames={Math.round(MEOWCARD_DURATION * MEOWCARD_FPS)}
        fps={MEOWCARD_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="MeowVault"
        component={MeowVault}
        durationInFrames={Math.round(VAULT_DURATION * VAULT_FPS)}
        fps={VAULT_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="MeowSignal"
        component={MeowSignal}
        durationInFrames={Math.round(SIGNAL_DURATION * SIGNAL_FPS)}
        fps={SIGNAL_FPS}
        width={1080}
        height={1920}
      />
      <Composition
        id="MeowGiant"
        component={MeowGiant}
        durationInFrames={Math.round(GIANT_DURATION * GIANT_FPS)}
        fps={GIANT_FPS}
        width={1080}
        height={1920}
      />
    </>
  );
};
