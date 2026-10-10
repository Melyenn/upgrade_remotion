# super_remotion

A [Remotion](https://www.remotion.dev/) project for generating short-form vertical videos (TikTok/Reels/Shorts style), with two kinds of compositions:

- **SlideShow** — an end-to-end pipeline that turns a single topic string into a fully-produced 1080x1920 data-explainer video: AI-written script (title/stat/quote/list/comparison/barChart/image/outro slides) + AI voiceover + auto-generated word-level captions, all rendered through Remotion.
- **CaptionedVideo** — drop in any video file and get TikTok-style auto-captions burned in, powered by Whisper.cpp.

## Setup

```console
npm i --loglevel=error
```

Copy `.env.example` to `.env` and fill in the keys you need:

```console
cp .env.example .env
```

| Variable | Required for | Notes |
| --- | --- | --- |
| `ELEVENLABS_API_KEY` | `generate-voiceover.mjs`, `create-video.mjs` | Get a key at [elevenlabs.io](https://elevenlabs.io). Free tier only allows "premade" voices (see `scripts/generate-voiceover.mjs` for the default voice ID). |
| `ANTHROPIC_API_KEY` | `generate-slide-content.mjs`, `create-video.mjs` | Optional — omit it to reuse your already-logged-in `claude` CLI session instead of a separate API key. |

## SlideShow: one-command video generation

Generate a complete slideshow video from a topic (content → voiceover/captions → render) in one step:

```console
node scripts/create-video.mjs "<topic>" [output-name] [--voice-id <id>] [--api-key <key>]
```

This runs the three steps below in sequence and writes the final video to `out/<output-name>.mp4`.

### Step by step

**1. Generate slide content** — calls the `claude` CLI to write an English script (5-7 slides, ~25-45s) following a hook → agitate → value → CTA structure, validated against the shared `slideShowSchema`:

```console
node scripts/generate-slide-content.mjs "<topic>" [output-name] [--api-key <key>]
```

Saves `content/<output-name>.json`.

**2. Generate voiceover + captions** — calls ElevenLabs TTS (`with-timestamps`) for each slide's `voiceover` line, saves per-slide MP3s to `public/voiceover/<name>/`, and derives word-level captions directly from ElevenLabs' character timestamps (no separate transcription step, so captions match the script exactly):

```console
node scripts/generate-voiceover.mjs content/<name>.json [--voice-id <id>] [--force]
```

Already-voiced slides are skipped on reruns unless `--force` is passed. Updates the same `content/<name>.json` in place with `audioSrc` + `captions`.

**3. Render**:

```console
npx remotion render SlideShow out/<name>.mp4 --props=content/<name>.json
```

### Preview slides in Studio

```console
npm run dev
```

Each slide type (`TitleSlide`, `StatSlide`, `ListSlide`, `BarChartSlide`, `QuoteSlide`, `ComparisonSlide`, `ImageSlide`, `OutroSlide`) is also registered standalone under the **Slides** folder in Remotion Studio for isolated tweaking, and the full `SlideShow` composition previews with the sample content baked into `src/Root.tsx`.

## CaptionedVideo: auto-caption any video

Replace `public/sample-video.mp4` with your own video, then caption everything in `public/` (or a specific file/folder) using Whisper.cpp:

```console
node sub.mjs                      # caption every video in public/
node sub.mjs <path-to-video-file> # caption one video
node sub.mjs <path-to-folder>     # caption one folder
```

The first run downloads Whisper.cpp and the ~1.5GB `medium.en` model. Configure which model is used in `whisper-config.mjs`. For non-English audio, change `WHISPER_MODEL` there to a model without the `.en` suffix.

Preview/render the result via the `CaptionedVideo` composition:

```console
npm run dev
npx remotion render CaptionedVideo out/captioned.mp4
```

## Other commands

```console
npm run dev       # remotion studio
npm run build     # remotion bundle
npm run upgrade   # remotion upgrade
npm run lint       # eslint + tsc
```

### What `npm run upgrade` does

Runs `remotion upgrade`, which bumps every `remotion` / `@remotion/*` package in `package.json` (currently pinned to `4.0.533`) to the latest matching release, then reinstalls so `package-lock.json` matches. Concretely it:

1. Checks npm for the latest published Remotion version.
2. Rewrites the version of `remotion` and all `@remotion/*` packages in `package.json` (`cli`, `google-fonts`, `layout-utils`, `media`, `media-utils`, `tailwind-v4`, `transitions`, `zod-types`, plus the dev-only `captions`, `eslint-config-flat`, `install-whisper-cpp`) to that version — they're kept in lockstep since mismatched Remotion package versions are unsupported.
3. Runs the package manager install step for you (no separate `npm i` needed).
4. Prints any relevant entries from Remotion's changelog/migration notes for the versions you crossed.

It does **not** touch unrelated deps like `react`, `tailwindcss`, or `zod` — bump those yourself if needed. After upgrading, run `npm run lint` and sanity-check `npm run dev` (both compositions) before committing, since major Remotion bumps occasionally require source changes (see Remotion's [upgrading guide](https://www.remotion.dev/docs/upgrading) for breaking-change notes between versions).

## Project structure

```
src/
  Root.tsx              # registers all compositions (CaptionedVideo, SlideShow, + standalone slide previews)
  CaptionedVideo/        # Whisper-caption overlay composition
  SlideShow/             # AI slideshow composition
    schema.mjs            # shared zod schema for slide content (used by the generator scripts too)
    SlideShow.tsx          # top-level composition, sequences slides + voiceover
    SlideChrome.tsx         # shared header/footer/background chrome around every slide
    slides/                # one component per slide type
    icons/                 # slide icon set
scripts/
  generate-slide-content.mjs  # topic -> content/<name>.json (Claude CLI)
  generate-voiceover.mjs      # content/<name>.json -> voiceover MP3s + captions (ElevenLabs)
  create-video.mjs            # runs the two scripts above + remotion render
content/                 # generated slide content JSON (gitignored)
public/voiceover/        # generated voiceover MP3s (gitignored)
out/                      # rendered videos (gitignored)
```

## Docs

- [Remotion fundamentals](https://www.remotion.dev/docs/the-fundamentals)
- [Remotion Discord](https://remotion.dev/discord)
- [File a Remotion issue](https://github.com/remotion-dev/remotion/issues/new)

## License

Note that for some entities a company license is needed for Remotion. [Read the terms here](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md).
# upgrade_remotion
