import { Easing, interpolate, useCurrentFrame } from "remotion";
import { colors, sansFontFamily } from "./theme";

export type SlideChromeProps = {
  readonly seriesLabel: string;
  readonly index: number;
  readonly total: number;
  readonly footnote: string;
  readonly children: React.ReactNode;
  // When provided, the whole frame fades/lifts itself in on mount and back
  // out before its Sequence ends, so adjacent slides in a strictly
  // sequential cut never show overlapping text (see SlideShow.tsx). Preview
  // compositions render a single slide standing alone and omit these, so the
  // slide just appears without a self-transition.
  readonly durationInFrames?: number;
  readonly accentColor?: string;
};

// ~0.2s at 30fps - long enough to read as an intentional fade, short enough
// to stay "decisive" for short-form pacing.
const SELF_FADE_FRAMES = 6;

// Safe-zone margins for a 1080x1920 short-form video, so nothing important
// ends up hidden behind a platform's own UI once uploaded: top 150px (search
// bar), bottom 300px (platform caption + sound title), right 120px
// (like/comment/save/share button column). All header/body/footer content
// lives inside the box these paddings carve out of the full-bleed
// background - the margins themselves stay empty except for the bg color.
const SAFE_TOP = 150;
const SAFE_BOTTOM = 300;
const SAFE_RIGHT = 120;
const SAFE_LEFT = 64;

// Shared header (eyebrow label + slide counter + rule) and footer
// (citation/disclaimer) that every slide renders inside, matching the
// editorial explainer reference: a persistent "show chrome" framing whatever
// content the slide itself contributes.
export const SlideChrome: React.FC<SlideChromeProps> = ({
  seriesLabel,
  index,
  total,
  footnote,
  children,
  durationInFrames,
  accentColor,
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, SELF_FADE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.ease),
  });
  const fadeOut =
    durationInFrames === undefined
      ? 1
      : interpolate(
          frame,
          [durationInFrames - SELF_FADE_FRAMES, durationInFrames],
          [1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.in(Easing.ease),
          },
        );
  const selfTransition = Math.min(fadeIn, fadeOut);

  const timeProgress =
    durationInFrames === undefined
      ? 0
      : interpolate(frame, [0, durationInFrames], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        backgroundColor: colors.background,
        fontFamily: sansFontFamily,
        paddingTop: SAFE_TOP,
        paddingBottom: SAFE_BOTTOM,
        paddingLeft: SAFE_LEFT,
        paddingRight: SAFE_RIGHT,
        opacity: selfTransition,
        translate: interpolate(selfTransition, [0, 1], ["0px 10px", "0px 0px"]),
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between">
          <span
            className="text-[22px] font-bold uppercase tracking-wider"
            style={{ color: colors.ink }}
          >
            {seriesLabel}
          </span>
          <span
            className="text-[22px] font-bold"
            style={{ color: colors.ink, opacity: 0.55 }}
          >
            {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="relative mt-5 h-px w-full" style={{ backgroundColor: colors.rule }}>
          {accentColor && durationInFrames !== undefined ? (
            <div
              className="absolute left-0 top-0 h-full"
              style={{
                width: `${timeProgress * 100}%`,
                backgroundColor: accentColor,
                opacity: 0.8,
              }}
            />
          ) : null}
        </div>
      </div>
      <div className="relative flex flex-1 flex-col justify-center py-8">
        {children}
      </div>
      <div>
        <span
          className="text-[18px] font-bold uppercase tracking-wide"
          style={{ color: colors.ink, opacity: 0.45 }}
        >
          {footnote}
        </span>
      </div>
    </div>
  );
};
