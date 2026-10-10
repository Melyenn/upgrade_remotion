import { z } from "zod";

// Plain .mjs (not .tsx) so this same schema can be imported both by the
// Remotion composition and by plain Node.js scripts (content/voiceover
// generation) without a TSX/JSX toolchain.

const captionSchema = z.object({
  text: z.string(),
  startMs: z.number(),
  endMs: z.number(),
  timestampMs: z.number().nullable(),
  confidence: z.number().nullable(),
  pageBreakAfter: z.boolean().optional(),
});

// Single-accent slides pick which of the two brand colors to use (e.g. a
// cautionary stat vs. a positive one). Dual-sided slides (comparison,
// barChart) always use teal for their left/first side and orange for their
// right/second side, so they don't take this field.
const accentSchema = z.enum(["teal", "orange"]).default("teal");

// A small set of original, generic line icons (see src/SlideShow/icons/
// Icon.tsx) a slide can show next to its heading as a relevant visual
// anchor - keeps slides from feeling like plain text cards without needing
// photos or illustrated characters.
const iconSchema = z
  .enum([
    "lightbulb",
    "target",
    "chartUp",
    "chartDown",
    "check",
    "cross",
    "clock",
    "star",
    "arrowRight",
    "rocket",
    "heart",
    "flag",
  ])
  .optional();

// Which corner the slide's soft background color glow drifts in (see
// AccentGlow.tsx) - varies per slide so consecutive slides don't feel
// visually identical, while every slide uses the same underlying mechanism.
const glowVariantSchema = z.enum(["topRight", "bottomLeft", "center"]).optional();

// Fields every slide type carries, regardless of its visual template.
// `voiceover` is the narration script - generated up front by the content
// script. `audioSrc` + `captions` are filled in later by the voiceover
// generation script (TTS + transcription) and are absent until then.
// `durationInFrames` is filled in by calculateMetadata at render/preview
// time (from the audio, or estimated from `voiceover` before audio exists) -
// never authored by hand or by the content-generation script. `footnote`
// overrides the video-level default footer text for this slide only - use
// it on slides whose numbers are illustrative/hypothetical rather than the
// real sourced figures the rest of the video cites.
const slideBase = {
  voiceover: z.string(),
  audioSrc: z.string().optional(),
  captions: z.array(captionSchema).optional(),
  durationInFrames: z.number().optional(),
  footnote: z.string().optional(),
  icon: iconSchema,
  glow: glowVariantSchema,
  // Shared by every slide type so the decorative icon/glow always has a
  // color to use, even on types (title, comparison, barChart, image, outro)
  // that don't otherwise need a teal/orange choice for their own content.
  accent: accentSchema,
};

export const titleSlideSchema = z.object({
  type: z.literal("title"),
  ...slideBase,
  heading: z.string(),
  subheading: z.string(),
});

export const statSlideSchema = z.object({
  type: z.literal("stat"),
  ...slideBase,
  heading: z.string(),
  subheading: z.string(),
  value: z.string(),
  label: z.string(),
  // Optional "last year -> this year" style reveal: when both are present,
  // the stat card shows previousValue first, then counts up/changes to
  // value. Omit for a single static stat.
  previousValue: z.string().optional(),
  previousLabel: z.string().optional(),
  // Small accent-colored delta tag shown under the big value, e.g. "+5%".
  delta: z.string().optional(),
});

export const quoteSlideSchema = z.object({
  type: z.literal("quote"),
  ...slideBase,
  quote: z.string(),
  author: z.string(),
});

export const listSlideSchema = z.object({
  type: z.literal("list"),
  ...slideBase,
  heading: z.string(),
  subheading: z.string(),
  bullets: z.array(z.string()),
});

export const comparisonSlideSchema = z.object({
  type: z.literal("comparison"),
  ...slideBase,
  heading: z.string(),
  subheading: z.string(),
  topLabel: z.string(),
  topPoints: z.array(z.string()),
  bottomLabel: z.string(),
  bottomPoints: z.array(z.string()),
});

export const barChartSlideSchema = z.object({
  type: z.literal("barChart"),
  ...slideBase,
  heading: z.string(),
  subheading: z.string(),
  leftLabel: z.string(),
  leftValue: z.string(),
  leftPercent: z.string(),
  rightLabel: z.string(),
  rightValue: z.string(),
  rightPercent: z.string(),
  note: z.string().optional(),
});

export const imageSlideSchema = z.object({
  type: z.literal("image"),
  ...slideBase,
  heading: z.string(),
  subheading: z.string(),
  caption: z.string(),
  imageSrc: z.string().optional(),
});

export const outroSlideSchema = z.object({
  type: z.literal("outro"),
  ...slideBase,
  heading: z.string(),
  subheading: z.string(),
});

export const slideSchema = z.discriminatedUnion("type", [
  titleSlideSchema,
  statSlideSchema,
  quoteSlideSchema,
  listSlideSchema,
  comparisonSlideSchema,
  barChartSlideSchema,
  imageSlideSchema,
  outroSlideSchema,
]);

export const slideShowSchema = z.object({
  topic: z.string(),
  // Small uppercase eyebrow label shown top-left of every slide, e.g.
  // "MONEY, EXPLAINED" - the series/show name, not the specific topic.
  seriesLabel: z.string(),
  // Default small footer citation/disclaimer shown bottom of every slide
  // unless a slide sets its own `footnote`.
  footnote: z.string(),
  // Short-form hook/agitate/value/CTA structure: 5-7 slides total (see
  // scripts/generate-slide-content.mjs for the structure this maps to).
  slides: z.array(slideSchema).min(5).max(7),
  // Optional background music, mixed quietly under the voiceover for the
  // whole video. Path relative to public/ (use with staticFile()). Omit for
  // no BGM. Volume defaults to 12% (within the 10-15% guideline) unless
  // bgmVolume overrides it.
  bgmSrc: z.string().optional(),
  bgmVolume: z.number().min(0).max(1).optional(),
});
