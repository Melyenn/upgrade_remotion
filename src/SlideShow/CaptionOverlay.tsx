import { Caption, createTikTokStyleCaptions } from "@remotion/captions";
import { useMemo } from "react";
import { Sequence, useVideoConfig } from "remotion";
import { CaptionPhrase } from "./CaptionPhrase";

// How many captions should be displayed at a time.
const SWITCH_CAPTIONS_EVERY_MS = 1200;

export const CaptionOverlay: React.FC<{ readonly captions: Caption[] }> = ({
  captions,
}) => {
  const { fps } = useVideoConfig();

  const { pages } = useMemo(
    () =>
      createTikTokStyleCaptions({
        combineTokensWithinMilliseconds: SWITCH_CAPTIONS_EVERY_MS,
        captions,
      }),
    [captions],
  );

  return (
    <>
      {pages.map((page, index) => {
        const startFrame = Math.round((page.startMs / 1000) * fps);
        // Use the page's own duration (ends right where the next page's
        // first word starts) rather than a fixed window - clamping to
        // SWITCH_CAPTIONS_EVERY_MS would hide the caption for the tail end
        // of any page that runs a bit longer than that threshold.
        const durationInFrames = Math.round((page.durationMs / 1000) * fps);
        if (durationInFrames <= 0) {
          return null;
        }

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={durationInFrames}
          >
            <CaptionPhrase page={page} />
          </Sequence>
        );
      })}
    </>
  );
};
