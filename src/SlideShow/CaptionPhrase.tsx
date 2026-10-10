import { TikTokPage } from "@remotion/captions";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { colors, sansFontFamily } from "./theme";

// Renders one caption phrase, pill-highlighting whichever word is being
// spoken right now - mixed-case, no stroke, positioned as a lower-third
// strip above the footer (not the big bold all-caps TikTok style).
export const CaptionPhrase: React.FC<{ readonly page: TikTokPage }> = ({
  page,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const timeInMs = (frame / fps) * 1000;

  const enter = spring({
    frame,
    fps,
    config: { damping: 200 },
    durationInFrames: 6,
  });

  return (
    <div
      className="absolute bottom-[96px] left-0 right-0 text-center text-[40px] font-bold leading-snug"
      style={{
        fontFamily: sansFontFamily,
        color: colors.ink,
        opacity: enter,
        translate: interpolate(enter, [0, 1], ["0px 14px", "0px 0px"]),
      }}
    >
      {page.tokens.map((t, index) => {
        const startRelativeToSequence = t.fromMs - page.startMs;
        const endRelativeToSequence = t.toMs - page.startMs;
        const active =
          startRelativeToSequence <= timeInMs &&
          endRelativeToSequence > timeInMs;

        return (
          <span
            key={`${t.fromMs}-${index}`}
            style={{
              display: "inline",
              whiteSpace: "pre",
              backgroundColor: active ? colors.teal : "transparent",
              color: active ? colors.onAccent : colors.ink,
              borderRadius: 8,
              padding: "4px 2px",
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone",
            }}
          >
            {t.text}
          </span>
        );
      })}
    </div>
  );
};
