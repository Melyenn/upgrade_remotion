// Gọi Claude Code CLI (lệnh `claude`) để sinh nội dung (JSON) cho video
// slideshow dựa trên 1 chủ đề: 5-7 slide với nhiều kiểu trình bày khác nhau
// (title/stat/quote/list/comparison/barChart/image/outro), mỗi slide có sẵn
// kịch bản lồng tiếng (`voiceover`). Nội dung được validate đúng shape bằng
// schema dùng chung với composition SlideShow, rồi lưu ra file JSON.
//
// Bước tiếp theo sau khi có file này: chạy
//   node scripts/generate-voiceover.mjs content/<ten-file>.json
// để tạo giọng đọc (ElevenLabs) + phụ đề cho từng slide, rồi mới render
// video.
//
// Mặc định dùng chung login/credit của CLI (không cần API key). Nếu có
// ANTHROPIC_API_KEY trong file .env (hoặc biến môi trường) thì tự dùng key
// đó thay vì login CLI; hoặc truyền --api-key <key> để ép dùng 1 key cụ thể.
//
// Dùng:
//   node scripts/generate-slide-content.mjs "<topic>" [ten-file] [--api-key <key>]

import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { slideShowSchema } from "../src/SlideShow/schema.mjs";

if (existsSync(path.join(process.cwd(), ".env"))) {
  process.loadEnvFile();
}

const rawArgs = process.argv.slice(2);
let apiKey = process.env.ANTHROPIC_API_KEY;
const args = [];
for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === "--api-key") {
    apiKey = rawArgs[++i];
    continue;
  }
  if (arg.startsWith("--api-key=")) {
    apiKey = arg.slice("--api-key=".length);
    continue;
  }
  args.push(arg);
}

const positional = args.filter((arg) => !arg.startsWith("--"));
const [topic, outputNameArg] = positional;

if (!topic) {
  console.error(
    'Cách dùng: node scripts/generate-slide-content.mjs "<chủ đề>" [ten-file] [--api-key <key>]',
  );
  process.exit(1);
}

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const outputName = outputNameArg ?? slugify(topic);

const stringProp = { type: "string" };
const stringArrayProp = { type: "array", items: { type: "string" } };
const accentProp = { type: "string", enum: ["teal", "orange"] };
const iconProp = {
  type: "string",
  enum: [
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
  ],
};
const glowProp = { type: "string", enum: ["topRight", "bottomLeft", "center"] };

// JSON Schema tương đương `slideSchema` (discriminated union) trong
// src/SlideShow/schema.mjs - trừ audioSrc/captions/durationInFrames, các
// trường được script generate-voiceover.mjs điền sau, không phải AI sinh ra.
// `accent`/`icon`/`glow` là optional trên mọi loại slide (slideBase).
const slideVariants = [
  {
    type: "object",
    properties: {
      type: { const: "title" },
      voiceover: stringProp,
      heading: stringProp,
      subheading: stringProp,
      accent: accentProp,
      icon: iconProp,
      glow: glowProp,
    },
    required: ["type", "voiceover", "heading", "subheading"],
  },
  {
    type: "object",
    properties: {
      type: { const: "stat" },
      voiceover: stringProp,
      heading: stringProp,
      subheading: stringProp,
      label: stringProp,
      value: stringProp,
      previousLabel: stringProp,
      previousValue: stringProp,
      delta: stringProp,
      accent: accentProp,
      icon: iconProp,
      glow: glowProp,
    },
    required: ["type", "voiceover", "heading", "subheading", "label", "value", "accent"],
  },
  {
    type: "object",
    properties: {
      type: { const: "quote" },
      voiceover: stringProp,
      quote: stringProp,
      author: stringProp,
      accent: accentProp,
      icon: iconProp,
      glow: glowProp,
    },
    required: ["type", "voiceover", "quote", "author", "accent"],
  },
  {
    type: "object",
    properties: {
      type: { const: "list" },
      voiceover: stringProp,
      heading: stringProp,
      subheading: stringProp,
      bullets: stringArrayProp,
      accent: accentProp,
      icon: iconProp,
      glow: glowProp,
    },
    required: ["type", "voiceover", "heading", "subheading", "bullets", "accent"],
  },
  {
    type: "object",
    properties: {
      type: { const: "comparison" },
      voiceover: stringProp,
      heading: stringProp,
      subheading: stringProp,
      topLabel: stringProp,
      topPoints: stringArrayProp,
      bottomLabel: stringProp,
      bottomPoints: stringArrayProp,
      accent: accentProp,
      icon: iconProp,
      glow: glowProp,
    },
    required: [
      "type",
      "voiceover",
      "heading",
      "subheading",
      "topLabel",
      "topPoints",
      "bottomLabel",
      "bottomPoints",
    ],
  },
  {
    type: "object",
    properties: {
      type: { const: "barChart" },
      voiceover: stringProp,
      heading: stringProp,
      subheading: stringProp,
      leftLabel: stringProp,
      leftValue: stringProp,
      leftPercent: stringProp,
      rightLabel: stringProp,
      rightValue: stringProp,
      rightPercent: stringProp,
      note: stringProp,
      accent: accentProp,
      icon: iconProp,
      glow: glowProp,
    },
    required: [
      "type",
      "voiceover",
      "heading",
      "subheading",
      "leftLabel",
      "leftValue",
      "leftPercent",
      "rightLabel",
      "rightValue",
      "rightPercent",
    ],
  },
  {
    type: "object",
    properties: {
      type: { const: "image" },
      voiceover: stringProp,
      heading: stringProp,
      subheading: stringProp,
      caption: stringProp,
      accent: accentProp,
      icon: iconProp,
      glow: glowProp,
    },
    required: ["type", "voiceover", "heading", "subheading", "caption"],
  },
  {
    type: "object",
    properties: {
      type: { const: "outro" },
      voiceover: stringProp,
      heading: stringProp,
      subheading: stringProp,
      accent: accentProp,
      icon: iconProp,
      glow: glowProp,
    },
    required: ["type", "voiceover", "heading", "subheading"],
  },
];

const jsonSchema = {
  type: "object",
  properties: {
    topic: stringProp,
    seriesLabel: stringProp,
    footnote: stringProp,
    slides: {
      type: "array",
      minItems: 5,
      maxItems: 7,
      items: { oneOf: slideVariants },
    },
  },
  required: ["topic", "seriesLabel", "footnote", "slides"],
};

const prompt = [
  `Topic: "${topic}".`,
  "",
  "Write an ENGLISH script for a short-form vertical video (TikTok/Reels/Shorts",
  "style data-explainer), 25-45 seconds total, 5-7 slides. All text fields",
  "(heading, subheading, labels, bullets, voiceover, etc.) must be in English.",
  "",
  "Follow this exact 4-act structure, mapped onto the 5-7 slides:",
  "",
  "1. HOOK (slide 1, type=title, ~10% of the video): state the problem, pain",
  "   point, or a curiosity-driving paradox head-on. It must be able to stop a",
  "   scroll in the first 1-2 seconds. NEVER just restate the topic as a title",
  '   (e.g. never write something as flat as "The 10-Minute Walk" or "About',
  '   Procrastination"). Instead pick ONE of these hook patterns, whichever',
  "   fits the topic best, and vary which one you pick across different topics:",
  '   - A contrarian/bold claim that contradicts common belief ("Multitasking',
  '     is making you slower, not faster.")',
  '   - A sharp question that implicates the viewer ("Why do smart people',
  '     still fall for this?")',
  '   - A shocking/surprising number or fact as the headline itself ("90% of',
  '     goals die by February. Here\'s why.")',
  '   - A "what if" or myth-busting reframe ("What if everything you know',
  '     about X is backwards?")',
  "   The subheading then adds the specific pain or stakes in one line - it",
  "   should make the viewer think 'wait, that's me' or 'I need to know this'.",
  "2. AGITATE / CONTEXT (slide 2, ~15% of the video, usually type=stat or",
  "   type=quote): briefly explain why this problem matters, or why the usual",
  "   approach fails. This is the one slide allowed to use a stat/quote purely",
  "   to build tension before the solution.",
  "3. VALUE / CORE STEPS (the next 2-4 slides, ~60% of the video): the actual",
  "   solution, process, or checklist. Each of these slides covers exactly ONE",
  "   idea or ONE step - never cram two ideas onto one slide. Mix list/stat/",
  "   comparison/barChart/image as fits the content.",
  "4. CONCLUSION & CTA (last slide, type=outro, ~15% of the video): heading is",
  "   the single most valuable takeaway, written as a punchy standalone line -",
  "   NOT a restatement of the slide 1 hook and not generic like 'In",
  "   Conclusion' or 'Thanks for Watching'. subheading MUST combine two things",
  "   in one short line: (a) a direct action on the content itself, AND (b) an",
  "   explicit channel-growth ask (follow/subscribe and/or share) - pick",
  "   whichever pairing reads most naturally for the topic, for example:",
  '   - "Save this, then follow for more [topic-area] tips."',
  '   - "Try it today - and share it with someone who needs this."',
  '   - "Comment your biggest takeaway, and follow for more like this."',
  '   - "Share this if it helped - follow for more [topic-area] breakdowns."',
  "   Never end on a bare, generic sign-off with no explicit action in it.",
  "",
  '`seriesLabel`: a short, uppercase show/series name (e.g. "LIFE HACKS, EXPLAINED"),',
  "shown persistently in the top corner of every slide - fits the general topic area,",
  "not the specific topic itself.",
  '`footnote`: a short uppercase citation/disclaimer line shown persistently at the',
  'bottom of every slide (e.g. "TOPIC / ILLUSTRATIVE EXAMPLE").',
  "",
  "CRITICAL - on-screen text budget: for every slide, the text that is actually",
  "displayed (heading + subheading + bullets/points/labels combined, NOT the",
  "voiceover) must add up to roughly 15-25 words total. A viewer skimming",
  "without sound must grasp the whole slide in 3-4 seconds. Write short phrases",
  "and fragments, not full paragraphs - favor bold keywords over sentences",
  "wherever the template allows it (e.g. list bullets, comparison points).",
  "",
  "Each slide is one of these 8 types (`type` field). ALL of them need their own",
  "`heading` + `subheading` (except quote), since every slide is a page with its own",
  "large serif title:",
  "",
  "- title: the HOOK slide (see hook patterns above). heading (max 6-8 words,",
  "  the hook itself - a claim, question, or number, never the plain topic",
  "  name) + subheading (max ~12 words, the specific pain/stakes).",
  "- stat: one attention-grabbing number/statistic, shown like a receipt card.",
  '  heading + subheading + label (short UPPERCASE description, e.g. "SURVEY / GROUP X")',
  '  + value (the headline number, e.g. "73%") + accent ("teal" or "orange" depending on',
  "  whether the number reads as positive or negative). Optionally add previousLabel +",
  "  previousValue (an earlier value, to animate a before/after reveal) and delta (a short",
  '  change tag, e.g. "+5 points"). Only use plausible illustrative figures - never invent',
  "  a specific real research source that doesn't exist.",
  '- quote: one quote/maxim related to the topic. quote (max ~15 words) + author',
  '  (can be "Unknown") + accent.',
  "- list: a short checklist. heading + subheading + bullets (exactly 3, each a short",
  "  phrase or fragment - not a full sentence) + accent.",
  "- comparison: a qualitative two-group contrast (do/don't, right/wrong...). heading +",
  "  subheading + topLabel + topPoints (2 short phrases) + bottomLabel + bottomPoints",
  "  (2 short phrases).",
  "- barChart: a QUANTITATIVE comparison of two numeric values as a bar chart. heading +",
  '  subheading + leftLabel + leftValue (a number, e.g. "92") + leftPercent (e.g. "+92%")',
  "  + rightLabel + rightValue + rightPercent + optional note (a formula/short caption).",
  "  Only use this when the topic genuinely has two comparable numbers.",
  "- image: one moment illustrated with an image. heading + subheading + caption (max",
  "  ~15 words).",
  "- outro: the CONCLUSION & CTA slide (see structure above - heading is the",
  "  takeaway, subheading is the combined content-action + channel-growth CTA,",
  "  up to ~16 words since it's doing double duty).",
  "",
  "Every slide may also set, all optional:",
  '- `accent` ("teal" or "orange"): which brand color its decorative background',
  "  glow and icon use. Even types that don't otherwise need a color choice",
  "  (title, comparison, barChart, image, outro) can set this for variety -",
  "  pick whichever reads as positive (teal) or negative/cautionary (orange)",
  "  for that specific slide's content.",
  '- `icon`: one of "lightbulb", "target", "chartUp", "chartDown", "check",',
  '  "cross", "clock", "star", "arrowRight", "rocket", "heart", "flag" - a',
  "  small generic line icon shown near the heading as a relevant visual",
  "  anchor. Pick one that genuinely fits the slide's specific point (e.g.",
  '  "clock" for a time-related step, "chartUp" for an improving stat,',
  '  "cross" for what NOT to do) rather than reusing the same icon on every',
  "  slide. Omit it on slides where no icon fits naturally - not every slide",
  "  needs one.",
  '- `glow`: "topRight", "bottomLeft", or "center" - leave this unset on',
  "  almost every slide (the renderer already alternates it automatically for",
  "  visual variety); only set it deliberately if one specific slide calls",
  "  for a different placement than the automatic rotation would give it.",
  "",
  "Every slide must also have a `voiceover` field: the spoken narration for that",
  "slide, written as one complete, natural-sounding sentence of roughly 10-18",
  "words (about 4-7 seconds spoken aloud at a brisk pace) - no more than one",
  "sentence, no markdown, no emoji. The target total video length is 25-45",
  "seconds (never exceed ~50s), so keep every line tight and let it drive",
  "straight at the point - no rambling, no filler words. For the outro slide",
  "specifically, the voiceover must say the CTA out loud too (not just show it",
  'as text) - e.g. "...so save this, and follow for more tips like this."',
  "",
  "Structure requirement: start with exactly one type=title slide (the hook),",
  "end with exactly one type=outro slide (conclusion + CTA), and use the slides",
  "in between for agitate + value/steps per the structure above, each covering",
  "one idea only, with no repeated ideas across slides. Only use barChart when",
  "the topic genuinely has two numbers worth comparing directly.",
].join("\n");

console.log(
  `Đang sinh nội dung cho chủ đề: "${topic}"... (${apiKey ? "dùng API key được truyền vào" : "dùng đăng nhập claude CLI hiện tại"})`,
);

const stdout = execFileSync(
  "claude",
  [
    "-p",
    prompt,
    "--output-format",
    "json",
    "--json-schema",
    JSON.stringify(jsonSchema),
  ],
  {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 10,
    env: apiKey ? { ...process.env, ANTHROPIC_API_KEY: apiKey } : process.env,
  },
);

const cliResult = JSON.parse(stdout);

if (cliResult.is_error) {
  console.error("Claude CLI báo lỗi:", cliResult.result);
  process.exit(1);
}

// Vẫn validate lại bằng chính schema của composition để chắc chắn khớp.
const content = slideShowSchema.parse(JSON.parse(cliResult.result));

const outDir = path.join(process.cwd(), "content");
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, `${outputName}.json`);
writeFileSync(outPath, JSON.stringify(content, null, 2));

console.log(`Đã lưu nội dung: ${path.relative(process.cwd(), outPath)} (${content.slides.length} slide)`);
if (typeof cliResult.total_cost_usd === "number") {
  console.log(`Chi phí: $${cliResult.total_cost_usd.toFixed(4)}`);
}

const relativeOutPath = path.relative(process.cwd(), outPath);
console.log(
  `Tiếp theo - tạo giọng đọc + phụ đề:\n  node scripts/generate-voiceover.mjs ${relativeOutPath}`,
);
