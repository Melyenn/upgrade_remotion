import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, colors, serifFontFamily, type Accent } from "../theme";
import { AnimatedWords } from "./AnimatedWords";
import { IconBadge } from "./IconBadge";
import type { IconName } from "../icons/Icon";

export type OutroSlideProps = {
  readonly heading: string;
  readonly subheading: string;
  readonly icon?: IconName;
  readonly accent?: Accent;
};

export const OutroSlide: React.FC<OutroSlideProps> = ({
  heading,
  subheading,
  icon,
  accent = "teal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = accentColor(accent);

  const progress = interpolate(frame, [0, fps * 0.6], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.spring({ damping: 200 }),
  });

  const subProgress = interpolate(frame, [fps * 0.5, fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div>
      {icon ? (
        <IconBadge name={icon} color={color} progress={progress} />
      ) : null}
      <div
        className="h-2 w-32 rounded-full"
        style={{
          backgroundColor: color,
          opacity: progress,
          scale: interpolate(progress, [0, 1], [0, 1], {
            output: "perceptual-scale",
          }),
        }}
      />
      <h1
        style={{
          fontFamily: serifFontFamily,
          color: colors.ink,
          fontSize: 112,
          fontWeight: 700,
          lineHeight: 1.04,
          marginTop: 36,
        }}
      >
        <AnimatedWords text={heading} />
      </h1>
      <p
        style={{
          color: colors.ink,
          opacity: 0.75 * subProgress,
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: 28,
          translate: interpolate(subProgress, [0, 1], ["0px 18px", "0px 0px"]),
        }}
      >
        {subheading}
      </p>
    </div>
  );
};
