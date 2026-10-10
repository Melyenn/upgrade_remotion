import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import {
  accentColor,
  colors,
  receiptClipPath,
  sansFontFamily,
  serifFontFamily,
  type Accent,
} from "../theme";
import { AnimatedWords } from "./AnimatedWords";
import { IconBadge } from "./IconBadge";
import type { IconName } from "../icons/Icon";
import { FALLBACK_SLIDE_DURATION, paceMoment, paceReveal } from "./pacing";

export type StatSlideProps = {
  readonly heading: string;
  readonly subheading: string;
  readonly value: string;
  readonly label: string;
  readonly previousValue?: string;
  readonly previousLabel?: string;
  readonly delta?: string;
  readonly accent: Accent;
  readonly icon?: IconName;
  readonly durationInFrames?: number;
};

export const StatSlide: React.FC<StatSlideProps> = ({
  heading,
  subheading,
  value,
  label,
  previousValue,
  previousLabel,
  delta,
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

  const cardProgress = interpolate(frame, [fps * 0.3, fps * 0.8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // The headline number is the whole point of this slide, so it shouldn't
  // land before the voiceover has actually built up to it - reveal it at a
  // paced moment (roughly a third into the line, after a short lead-in)
  // rather than the instant the card chrome fades in.
  const valueStart = paceMoment(durationInFrames, fps, 0.3, fps * 0.5);
  const valueProgress = interpolate(frame, [valueStart, valueStart + fps * 0.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // When a previous value is given, the big number switches from the old
  // value to the new one partway through the card's entrance (a simple
  // "count up" reveal rather than interpolating the digits themselves,
  // since values can be arbitrary formatted strings like "$3,150"). The
  // switch point is paced off the slide's actual spoken duration so it
  // lands near the middle of the narration instead of always at a fixed
  // ~1s, regardless of how long this slide's voiceover line runs.
  const switchFrame = paceReveal(1, 2, durationInFrames, fps, {
    startFrame: valueStart,
  }).start;
  const showsPrevious = Boolean(previousValue) && frame < switchFrame;
  const displayedValue = showsPrevious ? previousValue : value;

  const deltaProgress = interpolate(
    frame,
    [switchFrame + fps * 0.1, switchFrame + fps * 0.4],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    },
  );

  return (
    <div>
      {icon ? (
        <IconBadge name={icon} color={color} progress={headingProgress} />
      ) : null}
      <h1
        style={{
          fontFamily: serifFontFamily,
          color: colors.ink,
          fontSize: 80,
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

      <div
        className="mt-16"
        style={{
          opacity: cardProgress,
          scale: interpolate(cardProgress, [0, 1], [0.95, 1], {
            output: "perceptual-scale",
          }),
          backgroundColor: colors.surface,
          border: `1px solid ${colors.rule}`,
          clipPath: receiptClipPath(),
          padding: "56px 56px 80px",
        }}
      >
        <div
          className="text-[26px] font-bold uppercase tracking-wide"
          style={{ color: colors.ink, opacity: 0.55 }}
        >
          {label}
        </div>
        <div className="mt-6 h-px w-full" style={{ backgroundColor: colors.rule }} />

        {previousValue ? (
          <div
            className="mt-8 flex items-baseline justify-between"
            style={{
              opacity: valueProgress,
              translate: interpolate(valueProgress, [0, 1], ["0px 12px", "0px 0px"]),
            }}
          >
            <span
              style={{ fontFamily: sansFontFamily, color: colors.ink, opacity: 0.6, fontSize: 32, fontWeight: 700 }}
            >
              {previousLabel ?? "Trước đó"}
            </span>
            <span
              style={{ fontFamily: sansFontFamily, color: colors.ink, fontSize: 36, fontWeight: 800 }}
            >
              {previousValue}
            </span>
          </div>
        ) : null}

        <div
          className="mt-10"
          style={{
            fontFamily: sansFontFamily,
            color,
            fontSize: 150,
            fontWeight: 800,
            lineHeight: 1,
            opacity: valueProgress,
            translate: interpolate(valueProgress, [0, 1], ["0px 16px", "0px 0px"]),
          }}
        >
          {displayedValue}
        </div>

        {delta ? (
          <div
            className="mt-7 inline-block rounded-md px-5 py-3 text-[30px] font-extrabold"
            style={{
              backgroundColor: color,
              color: colors.onAccent,
              opacity: deltaProgress,
              translate: interpolate(deltaProgress, [0, 1], ["0px 10px", "0px 0px"]),
            }}
          >
            {delta}
          </div>
        ) : null}
      </div>
    </div>
  );
};
