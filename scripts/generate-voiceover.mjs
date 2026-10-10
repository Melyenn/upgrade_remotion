// Với 1 file nội dung đã sinh bởi generate-slide-content.mjs: gọi ElevenLabs
// TTS (endpoint `with-timestamps`) để tạo giọng đọc cho từng slide (dùng
// trường `voiceover` của slide), lưu mp3 vào public/voiceover/<ten-file>/.
//
// Phụ đề (Caption[]) được ghép trực tiếp từ timestamp từng ký tự mà
// ElevenLabs trả về cùng lúc tạo audio - khớp 100% với đúng chữ đã viết
// trong `voiceover`, KHÔNG qua bước transcribe lại bằng Whisper (vốn hay
// đoán sai nội dung tiếng Việt). Cập nhật lại chính file JSON content với
// `audioSrc` + `captions` cho mỗi slide.
//
// Lưu ý: ElevenLabs free tier CHỈ cho gọi API với giọng "premade" (có sẵn
// trong mọi tài khoản). Mọi giọng khác - kể cả giọng tiếng Việt thật trong
// thư viện, kể cả sau khi "Add to my voices" - đều bị chặn bằng lỗi
// `paid_plan_required` (đã kiểm chứng). Google Cloud TTS có giọng Việt thật
// miễn phí nhưng bắt buộc liên kết thẻ/billing account cho project (dù
// không bị trừ tiền trong hạn mức free) - nếu muốn tránh liên kết thẻ thì
// đây (ElevenLabs premade) là lựa chọn còn lại không cần thẻ.
//
// Dùng:
//   node scripts/generate-voiceover.mjs content/<ten-file>.json [--voice-id <id>] [--force]
//
// Mặc định BỎ QUA slide đã có sẵn audioSrc + file mp3 tương ứng (để chạy lại
// sau khi lỗi/timeout không tốn thêm quota ElevenLabs cho slide đã xong).
// Dùng --force để tạo lại toàn bộ kể cả slide đã có audio.
//
// Yêu cầu biến môi trường ELEVENLABS_API_KEY.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { slideShowSchema } from "../src/SlideShow/schema.mjs";

if (existsSync(path.join(process.cwd(), ".env"))) {
  process.loadEnvFile();
}

// ElevenLabs "Daniel" - a premade voice available on free-tier accounts
// without needing to add it to "My Voices" first (unlike shared Voice
// Library voices, e.g. the old default "Rachel", which free accounts can't
// call via the API - see the `paid_plan_required` error if that regresses).
// Override with --voice-id if you have a preferred voice already in your
// account (GET https://api.elevenlabs.io/v1/voices lists what qualifies).
const DEFAULT_VOICE_ID = "onwK4e9ZLuTAKqWW03F9";

const args = process.argv.slice(2);
const voiceIdIndex = args.indexOf("--voice-id");
const voiceId = voiceIdIndex !== -1 ? args[voiceIdIndex + 1] : DEFAULT_VOICE_ID;
const force = args.includes("--force");
const positional = args.filter(
  (arg, index) =>
    !arg.startsWith("--") && (voiceIdIndex === -1 || index !== voiceIdIndex + 1),
);
const [contentPath] = positional;

if (!contentPath) {
  console.error(
    "Cách dùng: node scripts/generate-voiceover.mjs content/<ten-file>.json [--voice-id <id>] [--force]",
  );
  process.exit(1);
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.error(
    "Thiếu biến môi trường ELEVENLABS_API_KEY. Lấy key tại https://elevenlabs.io rồi:\n" +
      "  export ELEVENLABS_API_KEY=...",
  );
  process.exit(1);
}

const parsed = slideShowSchema.parse(
  JSON.parse(readFileSync(contentPath, "utf8")),
);

const slug = path.basename(contentPath, ".json");
const voiceoverDir = path.join(process.cwd(), "public", "voiceover", slug);
mkdirSync(voiceoverDir, { recursive: true });

// Groups ElevenLabs' per-character alignment into word-level Caption objects
// (matching the @remotion/captions `Caption` type) - each word keeps a
// leading space (except the first), same convention as Whisper's
// split-on-word output, so `createTikTokStyleCaptions` joins them with
// spaces instead of running words together.
const alignmentToCaptions = (alignment) => {
  const { characters, character_start_times_seconds, character_end_times_seconds } =
    alignment;
  const captions = [];
  let currentWord = "";
  let wordStartSeconds = null;
  let pendingSpace = false;

  const pushWord = (endSeconds) => {
    if (currentWord.length === 0) return;
    captions.push({
      text: currentWord,
      startMs: Math.round(wordStartSeconds * 1000),
      endMs: Math.round(endSeconds * 1000),
      timestampMs: null,
      confidence: null,
    });
    currentWord = "";
    wordStartSeconds = null;
  };

  characters.forEach((char, index) => {
    if (/\s/.test(char)) {
      pushWord(character_end_times_seconds[index - 1]);
      pendingSpace = true;
      return;
    }
    if (wordStartSeconds === null) {
      wordStartSeconds = character_start_times_seconds[index];
    }
    if (pendingSpace) {
      currentWord += " ";
      pendingSpace = false;
    }
    currentWord += char;
  });
  pushWord(character_end_times_seconds[character_end_times_seconds.length - 1]);

  return captions;
};

const updatedSlides = [...parsed.slides];

const writeProgress = () => {
  const content = slideShowSchema.parse({ ...parsed, slides: updatedSlides });
  writeFileSync(contentPath, JSON.stringify(content, null, 2));
};

for (let i = 0; i < parsed.slides.length; i++) {
  const slide = parsed.slides[i];
  const fileBaseName = `slide-${String(i + 1).padStart(2, "0")}`;
  const mp3Path = path.join(voiceoverDir, `${fileBaseName}.mp3`);

  if (
    !force &&
    slide.audioSrc &&
    slide.captions &&
    existsSync(path.join(process.cwd(), "public", slide.audioSrc))
  ) {
    console.log(
      `[${i + 1}/${parsed.slides.length}] (${slide.type}) Đã có sẵn, bỏ qua.`,
    );
    continue;
  }

  console.log(
    `[${i + 1}/${parsed.slides.length}] (${slide.type}) Đang tạo giọng đọc + timestamp...`,
  );

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
    {
      method: "POST",
      headers: {
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: slide.voiceover,
        model_id: "eleven_multilingual_v2",
        // speed 1.1 keeps the narration brisk/energetic (short-form best
        // practice is ~1.1x-1.15x normal pace) - ElevenLabs accepts 0.7-1.2.
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          speed: 1.1,
        },
      }),
    },
  );

  if (!response.ok) {
    console.error(
      `Lỗi ElevenLabs cho slide ${i + 1}:`,
      await response.text(),
    );
    process.exit(1);
  }

  const data = await response.json();
  writeFileSync(mp3Path, Buffer.from(data.audio_base64, "base64"));

  const captions = alignmentToCaptions(data.alignment);

  updatedSlides[i] = {
    ...slide,
    audioSrc: `voiceover/${slug}/${fileBaseName}.mp3`,
    captions,
  };

  // Save after every slide, not just at the end, so a crash/timeout keeps
  // whatever slides finished instead of losing all progress to a final
  // write that never happens.
  writeProgress();
}

console.log(`Đã cập nhật voiceover + phụ đề vào: ${contentPath}`);
console.log(
  `Render: npx remotion render SlideShow out/${slug}.mp4 --props=${contentPath}`,
);
