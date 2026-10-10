import { Audio } from "@remotion/media";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { Sequence, staticFile, useVideoConfig, type CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { CaptionOverlay } from "./CaptionOverlay";
import { slideShowSchema } from "./schema.mjs";
import { SlideChrome } from "./SlideChrome";
import { AccentGlow, type GlowVariant } from "./slides/AccentGlow";
import { SlideContent } from "./slides/SlideContent";
import { accentColor } from "./theme";

export const FPS = 30;
// Each slide fades itself in/out (see SlideChrome) instead of crossfading
// into the next one - a crossfade keeps both slides' text on screen at once,
// which reads as a jumble for typography-heavy content. A clean, strictly
// sequential cut with a short self-fade on each side reads as "decisive"
// while guaranteeing zero overlap between outgoing and incoming text.
export const SLIDE_FADE_DURATION = Math.round(0.2 * FPS);

const MIN_SLIDE_DURATION = Math.round(2.5 * FPS);
const MAX_SLIDE_DURATION = Math.round(8 * FPS);
const END_PADDING_FRAMES = Math.round(0.4 * FPS);
const WORDS_PER_SECOND = 2.6;
const DEFAULT_BGM_VOLUME = 0.12;
// Reading-time floor for dense on-screen text (bullet lists, comparison
// panels), independent of voiceover length. The word count here is a plain
// whitespace split, which for Vietnamese counts syllables rather than true
// words (most Vietnamese words are themselves multi-syllable, space-
// separated compounds) - so the rate below is calibrated as a comfortable
// syllable-scan speed for short captions-style text, not an English words-
// per-minute figure.
const READING_WORDS_PER_SECOND = 4.4;
const READING_BUFFER_FRAMES = Math.round(0.4 * FPS);
const MAX_READING_DURATION = Math.round(10 * FPS);

// When a slide doesn't specify its own `glow` position, cycle through all
// three so consecutive slides never sit in the exact same spot - cohesive
// mechanism, varied placement, no AI input required.
const GLOW_CYCLE: readonly GlowVariant[] = ["topRight", "bottomLeft", "center"];

export { slideShowSchema };
export type SlideShowProps = z.infer<typeof slideShowSchema>;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

// Used only before a slide has a generated voiceover yet (e.g. previewing
// freshly AI-written content before running the voiceover script).
const estimateSpeechDurationFrames = (text: string) => {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const seconds = wordCount / WORDS_PER_SECOND;
  return clamp(
    Math.round(seconds * FPS) + END_PADDING_FRAMES,
    MIN_SLIDE_DURATION,
    MAX_SLIDE_DURATION,
  );
};

type SlideItem = SlideShowProps["slides"][number];

// The voiceover line is often a short summary, not a verbatim read-out of
// every bullet/panel on screen - so a slide's duration can't be driven by
// speech length alone, or information-dense slides fly by before the
// audience can read everything on them. This is a floor (not the final
// duration): the on-screen text's own reading time, independent of how long
// the voiceover for that slide happens to run.
const collectDisplayText = (slide: SlideItem): string => {
  switch (slide.type) {
    case "title":
    case "outro":
    case "stat":
      return `${slide.heading} ${slide.subheading}`;
    case "quote":
      return `${slide.quote} ${slide.author}`;
    case "list":
      return `${slide.heading} ${slide.subheading} ${slide.bullets.join(" ")}`;
    case "comparison":
      return `${slide.heading} ${slide.subheading} ${slide.topPoints.join(" ")} ${slide.bottomPoints.join(" ")}`;
    case "barChart":
      return `${slide.heading} ${slide.subheading} ${slide.note ?? ""}`;
    case "image":
      return `${slide.heading} ${slide.subheading} ${slide.caption}`;
    default:
      return "";
  }
};

const estimateReadingFrames = (slide: SlideItem): number => {
  const wordCount = collectDisplayText(slide)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const frames =
    Math.round((wordCount / READING_WORDS_PER_SECOND) * FPS) +
    READING_BUFFER_FRAMES;
  return clamp(frames, MIN_SLIDE_DURATION, MAX_READING_DURATION);
};

export const calculateSlideShowMetadata: CalculateMetadataFunction<
  SlideShowProps
> = async ({ props }) => {
  const slides = await Promise.all(
    props.slides.map(async (slide) => {
      const readingFloor = estimateReadingFrames(slide);

      if (slide.audioSrc) {
        const seconds = await getAudioDurationInSeconds(
          staticFile(slide.audioSrc),
        );
        const audioFrames = Math.round(seconds * FPS) + END_PADDING_FRAMES;
        return {
          ...slide,
          durationInFrames: Math.max(audioFrames, readingFloor),
        };
      }

      return {
        ...slide,
        durationInFrames: Math.max(
          estimateSpeechDurationFrames(slide.voiceover),
          readingFloor,
        ),
      };
    }),
  );

  const totalRaw = slides.reduce((sum, s) => sum + s.durationInFrames, 0);

  return {
    fps: FPS,
    durationInFrames: Math.max(totalRaw, FPS),
    props: { ...props, slides },
  };
};

export const SlideShow: React.FC<SlideShowProps> = ({
  seriesLabel,
  footnote,
  slides,
  bgmSrc,
  bgmVolume,
}) => {
  const { fps } = useVideoConfig();

  let cursor = 0;
  const children = slides.map((slide, index) => {
    const durationInFrames =
      slide.durationInFrames ?? estimateSpeechDurationFrames(slide.voiceover);
    const from = cursor;
    cursor += durationInFrames;

    return (
      <Sequence
        key={`slide-${index}`}
        name={`Slide ${index + 1} (${slide.type})`}
        from={from}
        durationInFrames={durationInFrames}
        premountFor={fps}
      >
        <SlideChrome
          seriesLabel={seriesLabel}
          index={index + 1}
          total={slides.length}
          footnote={slide.footnote ?? footnote}
          durationInFrames={durationInFrames}
          accentColor={accentColor(slide.accent)}
        >
          <AccentGlow
            color={accentColor(slide.accent)}
            variant={slide.glow ?? GLOW_CYCLE[index % GLOW_CYCLE.length]}
          />
          <SlideContent slide={slide} />
          {slide.audioSrc ? (
            <Audio src={staticFile(slide.audioSrc)} premountFor={fps} />
          ) : null}
          {slide.captions ? (
            <CaptionOverlay captions={slide.captions} />
          ) : null}
        </SlideChrome>
      </Sequence>
    );
  });

  return (
    <>
      {bgmSrc ? (
        <Audio
          src={staticFile(bgmSrc)}
          volume={bgmVolume ?? DEFAULT_BGM_VOLUME}
          loop
          premountFor={fps}
        />
      ) : null}
      {children}
    </>
  );
};
