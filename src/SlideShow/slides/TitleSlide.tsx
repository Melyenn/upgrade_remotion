import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, colors, serifFontFamily, type Accent } from "../theme";
import { AnimatedWords } from "./AnimatedWords";
import { IconBadge } from "./IconBadge";
import type { IconName } from "../icons/Icon";

export type TitleSlideProps = {
  readonly heading: string;
  readonly subheading: string;
  readonly icon?: IconName;
  readonly accent?: Accent;
};

export const TitleSlide: React.FC<TitleSlideProps> = ({
  heading,
  subheading,
  icon,
  accent = "teal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = interpolate(frame, [0, fps * 0.55], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        opacity: progress,
        translate: interpolate(progress, [0, 1], ["0px 24px", "0px 0px"]),
      }}
    >
      {icon ? (
        <IconBadge name={icon} color={accentColor(accent)} progress={progress} />
      ) : null}
      <h1
        style={{
          fontFamily: serifFontFamily,
          color: colors.ink,
          fontSize: 112,
          fontWeight: 700,
          lineHeight: 1.04,
        }}
      >
        <AnimatedWords text={heading} />
      </h1>
      <p
        style={{
          fontFamily: "inherit",
          color: colors.ink,
          opacity: 0.75,
          fontSize: 44,
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: 32,
        }}
      >
        {subheading}
      </p>
    </div>
  );
};
