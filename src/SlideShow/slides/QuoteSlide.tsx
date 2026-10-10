import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, colors, serifFontFamily, type Accent } from "../theme";
import { AnimatedWords } from "./AnimatedWords";
import { IconBadge } from "./IconBadge";
import type { IconName } from "../icons/Icon";

export type QuoteSlideProps = {
  readonly quote: string;
  readonly author: string;
  readonly accent: Accent;
  readonly icon?: IconName;
};

export const QuoteSlide: React.FC<QuoteSlideProps> = ({
  quote,
  author,
  accent,
  icon,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = accentColor(accent);

  const markProgress = interpolate(frame, [0, fps * 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const authorProgress = interpolate(frame, [fps * 0.8, fps * 1.2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div>
      {icon ? (
        <IconBadge name={icon} color={color} progress={markProgress} />
      ) : null}
      <div
        style={{
          fontFamily: serifFontFamily,
          color,
          fontSize: 160,
          lineHeight: 0.6,
          opacity: markProgress,
        }}
      >
        &ldquo;
      </div>
      <p
        style={{
          fontFamily: serifFontFamily,
          color: colors.ink,
          fontSize: 72,
          fontStyle: "italic",
          fontWeight: 700,
          lineHeight: 1.2,
          marginTop: 36,
        }}
      >
        <AnimatedWords text={quote} startFrame={fps * 0.25} />
      </p>
      <p
        style={{
          color: colors.ink,
          opacity: 0.6 * authorProgress,
          fontSize: 34,
          fontWeight: 700,
          marginTop: 32,
          translate: interpolate(authorProgress, [0, 1], ["0px 14px", "0px 0px"]),
        }}
      >
        — {author}
      </p>
    </div>
  );
};
