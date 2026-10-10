import {
  CanvasImage,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { accentColor, colors, serifFontFamily, type Accent } from "../theme";
import { AnimatedWords } from "./AnimatedWords";
import { IconBadge } from "./IconBadge";
import type { IconName } from "../icons/Icon";

export type ImageSlideProps = {
  readonly heading: string;
  readonly subheading: string;
  readonly imageSrc?: string;
  readonly caption: string;
  readonly icon?: IconName;
  readonly accent?: Accent;
};

export const ImageSlide: React.FC<ImageSlideProps> = ({
  heading,
  subheading,
  imageSrc,
  caption,
  icon,
  accent = "teal",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headingProgress = interpolate(frame, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const imageProgress = interpolate(frame, [fps * 0.3, fps * 0.9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const captionProgress = interpolate(frame, [fps * 1, fps * 1.4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const imageStyle: React.CSSProperties = {
    opacity: imageProgress,
    scale: interpolate(imageProgress, [0, 1], [0.95, 1], {
      output: "perceptual-scale",
    }),
  };

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
          opacity: 0.75 * headingProgress,
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.3,
          marginTop: 16,
        }}
      >
        {subheading}
      </p>

      <div className="mt-14 flex justify-center">
        {imageSrc ? (
          <CanvasImage
            src={imageSrc}
            premountFor={fps}
            style={{
              ...imageStyle,
              width: 880,
              height: 680,
              objectFit: "cover",
              borderRadius: 24,
            }}
          />
        ) : (
          <div
            className="flex h-[680px] w-[880px] items-center justify-center rounded-2xl text-[32px] font-bold"
            style={{
              ...imageStyle,
              opacity: imageProgress * 0.55,
              backgroundColor: colors.surface,
              color: colors.ink,
              border: `1px solid ${colors.rule}`,
            }}
          >
            Hình ảnh của bạn ở đây
          </div>
        )}
      </div>

      <p
        className="mt-12 text-[36px] font-bold leading-snug"
        style={{
          color: colors.ink,
          opacity: 0.8 * captionProgress,
          translate: interpolate(captionProgress, [0, 1], ["0px 16px", "0px 0px"]),
        }}
      >
        {caption}
      </p>
    </div>
  );
};
