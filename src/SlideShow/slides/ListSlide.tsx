import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, colors, serifFontFamily, type Accent } from "../theme";
import { AnimatedWords } from "./AnimatedWords";
import { IconBadge } from "./IconBadge";
import type { IconName } from "../icons/Icon";
import { FALLBACK_SLIDE_DURATION, paceReveal } from "./pacing";

export type ListSlideProps = {
  readonly heading: string;
  readonly subheading: string;
  readonly bullets: readonly string[];
  readonly accent: Accent;
  readonly icon?: IconName;
  readonly durationInFrames?: number;
};

export const ListSlide: React.FC<ListSlideProps> = ({
  heading,
  subheading,
  bullets,
  accent,
  icon,
  durationInFrames = FALLBACK_SLIDE_DURATION,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const color = accentColor(accent);

  const headingProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div>
      {icon ? (
        <IconBadge name={icon} color={color} progress={headingProgress} />
      ) : null}
      <h1
        style={{
          fontFamily: serifFontFamily,
          color: colors.ink,
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.06,
          opacity: headingProgress,
          translate: interpolate(headingProgress, [0, 1], ["0px 20px", "0px 0px"]),
        }}
      >
        <AnimatedWords text={heading} />
      </h1>
      <p
        style={{
          color: colors.ink,
          opacity: 0.75 * headingProgress,
          fontSize: 38,
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: 18,
        }}
      >
        {subheading}
      </p>

      <ul className="mt-20 flex flex-col gap-12">
        {bullets.map((bullet, index) => {
          const { start, revealWindow } = paceReveal(
            index,
            bullets.length,
            durationInFrames,
            fps,
          );
          const progress = interpolate(
            frame,
            [start, start + revealWindow],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          );

          return (
            <li
              key={bullet}
              className="flex items-start gap-7 text-[42px] font-bold leading-snug"
              style={{
                color: colors.ink,
                opacity: progress,
                translate: interpolate(progress, [0, 1], ["0px 26px", "0px 0px"]),
              }}
            >
              <span
                className="mt-2 flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[28px] font-extrabold"
                style={{ backgroundColor: color, color: colors.onAccent }}
              >
                {index + 1}
              </span>
              <span>{bullet}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
