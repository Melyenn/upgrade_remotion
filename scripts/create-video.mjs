// Chạy toàn bộ pipeline tạo video thuyết trình chỉ bằng 1 lệnh:
//   topic (text) -> generate-slide-content -> generate-voiceover -> render -> out/<ten-file>.mp4
//
// Dùng:
//   node scripts/create-video.mjs "<topic>" [ten-file] [--voice-id <id>] [--api-key <key>]
//
// Đọc ANTHROPIC_API_KEY / ELEVENLABS_API_KEY từ file .env ở thư mục gốc dự
// án nếu có (không cần `export` thủ công). Xem .env.example để biết các
// biến cần thiết.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

if (existsSync(path.join(process.cwd(), ".env"))) {
  process.loadEnvFile();
}

const rawArgs = process.argv.slice(2);

// Extracts a `--flag value` or `--flag=value` pair, returning the raw
// tokens to forward as-is plus which argv indexes it consumed (so they
// don't get mistaken for the topic/output-name positional args below).
const takeFlag = (flagName) => {
  const eqPrefix = `${flagName}=`;
  const idx = rawArgs.findIndex((a) => a === flagName || a.startsWith(eqPrefix));
  if (idx === -1) return { tokens: [], consumed: new Set() };
  if (rawArgs[idx].startsWith(eqPrefix)) {
    return { tokens: [rawArgs[idx]], consumed: new Set([idx]) };
  }
  return { tokens: [rawArgs[idx], rawArgs[idx + 1]], consumed: new Set([idx, idx + 1]) };
};

const apiKeyFlag = takeFlag("--api-key");
const voiceIdFlag = takeFlag("--voice-id");
const consumed = new Set([...apiKeyFlag.consumed, ...voiceIdFlag.consumed]);

const positional = rawArgs.filter(
  (arg, index) => !consumed.has(index) && !arg.startsWith("--"),
);
const [topic, outputNameArg] = positional;

if (!topic) {
  console.error(
    'Cách dùng: node scripts/create-video.mjs "<topic>" [ten-file] [--voice-id <id>] [--api-key <key>]',
  );
  process.exit(1);
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.error(
    "Thiếu ELEVENLABS_API_KEY. Thêm vào file .env ở thư mục gốc dự án:\n" +
      "  ELEVENLABS_API_KEY=sk_...\n" +
      "hoặc export trực tiếp trước khi chạy lệnh này.",
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
const contentPath = path.join("content", `${outputName}.json`);
const outPath = path.join("out", `${outputName}.mp4`);

const run = (label, command, commandArgs) => {
  console.log(`\n=== ${label} ===`);
  execFileSync(command, commandArgs, { stdio: "inherit", env: process.env });
};

run("1/3 - Generating slide content", "node", [
  "scripts/generate-slide-content.mjs",
  topic,
  outputName,
  ...apiKeyFlag.tokens,
]);

run("2/3 - Generating voiceover + captions", "node", [
  "scripts/generate-voiceover.mjs",
  contentPath,
  ...voiceIdFlag.tokens,
]);

run("3/3 - Rendering video", "npx", [
  "remotion",
  "render",
  "SlideShow",
  outPath,
  `--props=${contentPath}`,
]);

console.log(`\nDone! Video: ${outPath}`);
