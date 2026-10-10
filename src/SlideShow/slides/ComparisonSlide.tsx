import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, colors, serifFontFamily, type Accent } from "../theme";
import { AnimatedWords } from "./AnimatedWords";
import { IconBadge } from "./IconBadge";
import type { IconName } from "../icons/Icon";
import { FALLBACK_SLIDE_DURATION, paceReveal } from "./pacing";

export type ComparisonSlideProps = {
  readonly heading: string;
  readonly subheading: string;
  readonly topLabel: string;
  readonly topPoints: readonly string[];
  readonly bottomLabel: string;
  readonly bottomPoints: readonly string[];
  readonly icon?: IconName;
  readonly accent?: Accent;
  readonly durationInFrames?: number;
};

const Panel: React.FC<{
  readonly accent: string;
  readonly tint: string;
  readonly label: string;
  readonly points: readonly string[];
  readonly delayFrames: number;
  readonly revealWindow: number;
}> = ({ accent, tint, label, points, delayFrames, revealWindow }) => {
  const frame = useCurrentFrame();

  const panelProgress = interpolate(frame, [delayFrames, delayFrames + revealWindow], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      className="flex-1 rounded-2xl p-11"
      style={{
        backgroundColor: tint,
        border: `1px solid ${colors.rule}`,
        opacity: panelProgress,
        translate: interpolate(panelProgress, [0, 1], ["0px 20px", "0px 0px"]),
      }}
    >
      <div
        className="inline-block w-fit rounded-full px-6 py-3 text-[28px] font-extrabold"
        style={{ backgroundColor: accent, color: colors.onAccent }}
      >
        {label}
      </div>
      <ul className="mt-8 flex flex-col gap-5">
        {points.map((point) => (
          <li
            key={point}
            className="text-[36px] font-bold leading-snug"
            style={{ color: colors.ink }}
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ComparisonSlide: React.FC<ComparisonSlideProps> = ({
  heading,
  subheading,
  topLabel,
  topPoints,
  bottomLabel,
  bottomPoints,
  icon,
  accent = "teal",
  durationInFrames = FALLBACK_SLIDE_DURATION,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panel1 = paceReveal(0, 2, durationInFrames, fps);
  const panel2 = paceReveal(1, 2, durationInFrames, fps);

  const headingProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div>
      {icon ? (
        <IconBadge name={icon} color={accentColor(accent)} progress={headingProgress} />
      ) : null}
      <h1
        style={{
          fontFamily: serifFontFamily,
          color: colors.ink,
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.08,
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
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: 16,
        }}
      >
        {subheading}
      </p>

      <div className="mt-14 flex flex-col gap-9">
        <Panel
          accent={colors.teal}
          tint="rgba(212, 255, 63, 0.1)"
          label={topLabel}
          points={topPoints}
          delayFrames={panel1.start}
          revealWindow={panel1.revealWindow}
        />
        <Panel
          accent={colors.orange}
          tint="rgba(255, 63, 142, 0.1)"
          label={bottomLabel}
          points={bottomPoints}
          delayFrames={panel2.start}
          revealWindow={panel2.revealWindow}
        />
      </div>
    </div>
  );
};
