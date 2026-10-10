import { Easing, interpolate, useCurrentFrame } from "remotion";

// Splits text into words and pops each one in with a short stagger, instead
// of fading the whole heading/quote in as one flat block - gives short-form
// text the "snappy caption reveal" energy viewers expect, without needing a
// fixed per-word timeline (driven purely by index, so any string works).
export const AnimatedWords: React.FC<{
  readonly text: string;
  readonly startFrame?: number;
  readonly staggerFrames?: number;
  readonly durationFrames?: number;
}> = ({ text, startFrame = 0, staggerFrames = 2.5, durationFrames = 16 }) => {
  const frame = useCurrentFrame();
  const words = text.split(" ");

  return (
    <>
      {words.map((word, index) => {
        const wordStart = startFrame + index * staggerFrames;
        const progress = interpolate(
          frame,
          [wordStart, wordStart + durationFrames],
          [0, 1],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        );

        return (
          <span
            key={index}
            style={{
              display: "inline-block",
              opacity: progress,
              translate: interpolate(progress, [0, 1], ["0px 14px", "0px 0px"]),
              scale: interpolate(progress, [0, 1], [0.88, 1], {
                output: "perceptual-scale",
              }),
              marginRight: "0.26em",
            }}
          >
            {word}
          </span>
        );
      })}
    </>
  );
};
