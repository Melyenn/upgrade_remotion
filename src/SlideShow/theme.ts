import { loadFont as loadSerifFont } from "@remotion/google-fonts/SourceSerif4";
import { loadFont as loadSansFont } from "@remotion/google-fonts/Inter";

// Dark-neon short-form palette: near-black background, off-white text, two
// bright neon accents (used consistently as "first side" / "second side" in
// dual comparisons, and as a selectable accent elsewhere). Key names (teal/
// orange) are kept from the earlier editorial palette even though the hex
// values are now lime/magenta, since `Accent` ("teal" | "orange") is used
// throughout the schema and content prompt as a positive/negative choice.
export const colors = {
  background: "#15161A",
  ink: "#F5F5F0",
  // Slightly-raised dark surface for cards/panels sitting on top of the
  // background (stat card, comparison panels, image placeholder).
  surface: "#1F2024",
  teal: "#D4FF3F",
  orange: "#FF3F8E",
  rule: "rgba(245, 245, 240, 0.16)",
  // Both accents are bright/light, so text drawn on top of an accent fill
  // (badges, pills, bars, highlighted captions) needs a dark color, not
  // white, to stay readable.
  onAccent: "#15161A",
} as const;

export type Accent = "teal" | "orange";

export const accentColor = (accent: Accent): string =>
  accent === "orange" ? colors.orange : colors.teal;

const serif = loadSerifFont("normal", {
  weights: ["700", "900"],
  subsets: ["latin", "vietnamese"],
});

const sans = loadSansFont("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin", "vietnamese"],
});

export const serifFontFamily = serif.fontFamily;
export const sansFontFamily = sans.fontFamily;

// Zigzag "torn receipt" bottom edge, expressed as a percentage-based
// clip-path so it works at any element size without measuring pixels.
const RECEIPT_TEETH = 22;
const RECEIPT_TOOTH_HEIGHT_PCT = 4;

export const receiptClipPath = (): string => {
  const points: string[] = ["0% 0%", "100% 0%", "100% 100%"];
  for (let i = RECEIPT_TEETH; i >= 0; i--) {
    const x = (i / RECEIPT_TEETH) * 100;
    const y = i % 2 === 0 ? 100 : 100 - RECEIPT_TOOTH_HEIGHT_PCT;
    points.push(`${x}% ${y}%`);
  }
  return `polygon(${points.join(", ")})`;
};
