import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { accentColor, colors, sansFontFamily, serifFontFamily, type Accent } from "../theme";
import { AnimatedWords } from "./AnimatedWords";
import { IconBadge } from "./IconBadge";
import type { IconName } from "../icons/Icon";
import { FALLBACK_SLIDE_DURATION, paceMoment, paceReveal } from "./pacing";

export type BarChartSlideProps = {
  readonly heading: string;
  readonly subheading: string;
  readonly leftLabel: string;
  readonly leftValue: string;
  readonly leftPercent: string;
  readonly rightLabel: string;
  readonly rightValue: string;
  readonly rightPercent: string;
  readonly note?: string;
  readonly icon?: IconName;
  readonly accent?: Accent;
  readonly durationInFrames?: number;
};

const CHART_HEIGHT = 480;
const MIN_BAR_HEIGHT = 160;
const BAR_WIDTH = 220;

const parseLeadingNumber = (text: string): number | null => {
  const match = text.match(/-?[\d.,]+/);
  if (!match) return null;
  const parsed = Number(match[0].replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

export const BarChartSlide: React.FC<BarChartSlideProps> = ({
  heading,
  subheading,
  leftLabel,
  leftValue,
  leftPercent,
  rightLabel,
  rightValue,
  rightPercent,
  note,
  icon,
  accent = "teal",
  durationInFrames = FALLBACK_SLIDE_DURATION,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const leftNum = parseLeadingNumber(leftValue);
  const rightNum = parseLeadingNumber(rightValue);
  const canCompare = leftNum !== null && rightNum !== null;
  const maxAbs = canCompare
    ? Math.max(Math.abs(leftNum!), Math.abs(rightNum!), 1)
    : 1;
  const heightFor = (value: number | null) => {
    if (value === null) return CHART_HEIGHT * 0.65;
    const ratio = Math.abs(value) / maxAbs;
    return MIN_BAR_HEIGHT + ratio * (CHART_HEIGHT - MIN_BAR_HEIGHT);
  };
  const showBaseline =
    canCompare &&
    leftNum! >= 50 &&
    leftNum! <= 160 &&
    rightNum! >= 50 &&
    rightNum! <= 160;
  const baselineFromBottom = showBaseline
    ? MIN_BAR_HEIGHT + (100 / maxAbs) * (CHART_HEIGHT - MIN_BAR_HEIGHT)
    : 0;

  // The bars are the headline numbers of this slide, so - like a stat
  // card's big value - they shouldn't finish growing before the voiceover
  // has actually gotten to them. Delay the start to a paced moment instead
  // of a fixed ~0.4s, then let the note follow after.
  const barsStart = paceMoment(durationInFrames, fps, 0.3, fps * 0.4);
  const noteBeat = paceReveal(1, 2, durationInFrames, fps, { startFrame: barsStart });

  const barProgress = interpolate(
    frame,
    [barsStart, barsStart + fps * 0.7],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  const noteProgress = interpolate(
    frame,
    [noteBeat.start, noteBeat.start + noteBeat.revealWindow],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  const bars = [
    { label: leftLabel, value: leftValue, percent: leftPercent, color: colors.teal },
    { label: rightLabel, value: rightValue, percent: rightPercent, color: colors.orange },
  ];
  const nums = [leftNum, rightNum];

  return (
    <div>
      {icon ? (
        <IconBadge name={icon} color={accentColor(accent)} progress={headingProgress} />
      ) : null}
      <h1
        style={{
          fontFamily: serifFontFamily,
          color: colors.ink,
          fontSize: 72,
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
          opacity: 0.6 * headingProgress,
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: 14,
        }}
      >
        {subheading}
      </p>

      {/* Percent labels sit above the fixed-height bar track (not inside
          it), so a full-height bar never pushes its label past the top of
          the chart into the subheading above. */}
      <div className="mt-20 flex justify-center gap-20" style={{ width: "100%" }}>
        {bars.map((bar) => (
          <div
            key={bar.label}
            className="text-center text-[38px] font-extrabold"
            style={{ width: BAR_WIDTH, color: bar.color, opacity: barProgress }}
          >
            {bar.percent}
          </div>
        ))}
      </div>

      <div
        className="relative mt-4 flex items-end justify-center gap-20"
        style={{ height: CHART_HEIGHT }}
      >
        {showBaseline ? (
          <div
            className="absolute left-0 right-0 border-t-2 border-dashed"
            style={{ bottom: baselineFromBottom, borderColor: colors.ink, opacity: 0.35 }}
          />
        ) : null}

        {bars.map((bar, index) => {
          const fullHeight = heightFor(nums[index]);
          const animatedHeight = fullHeight * barProgress;

          return (
            <div
              key={bar.label}
              className="flex items-start justify-center rounded-t-lg pt-5"
              style={{ width: BAR_WIDTH, height: animatedHeight, backgroundColor: bar.color }}
            >
              <span
                className="text-[38px] font-extrabold"
                style={{ opacity: barProgress, color: colors.onAccent }}
              >
                {bar.value}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex justify-center gap-20">
        {bars.map((bar) => (
          <div
            key={bar.label}
            className="text-center text-[30px] font-extrabold uppercase"
            style={{ width: BAR_WIDTH, color: bar.color }}
          >
            {bar.label}
          </div>
        ))}
      </div>

      {note ? (
        <p
          className="mt-12 text-center text-[28px] font-bold"
          style={{
            fontFamily: sansFontFamily,
            color: colors.ink,
            opacity: 0.6 * noteProgress,
          }}
        >
          {note}
        </p>
      ) : null}
    </div>
  );
};
