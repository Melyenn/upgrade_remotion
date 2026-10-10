// Spreads a sequence of on-screen reveals (bullets, comparison panels, a
// stat's before/after switch...) across a slide's ACTUAL spoken duration
// (derived from real TTS audio via `durationInFrames`), instead of fixed
// frame offsets. Fixed offsets made every point finish appearing within the
// first ~2s regardless of how long the voiceover for that slide actually
// runs - on a longer line, the text would all be visible well before the
// narration got there (or vice versa on a short line), reading as
// disconnected from what's being said. Spacing reveals out across the
// slide's own duration keeps "something new appears" roughly in step with
// "something new is being said", without needing exact word-level mapping.
export const FALLBACK_SLIDE_DURATION = 120;

// A single reveal moment (not a sequence) whose timing scales with the
// slide's actual duration - for a lone element (a big stat number, a bar
// chart's values) that shouldn't reveal within the first ~0.5-0.8s
// regardless of how long the voiceover line is. `fraction` is roughly
// "how far into the spoken line this is usually mentioned" (e.g. 0.3 for a
// number that comes after a short lead-in clause).
export const paceMoment = (
  durationInFrames: number,
  fps: number,
  fraction: number,
  minFrame = fps * 0.3,
): number => Math.max(minFrame, durationInFrames * fraction);

export const paceReveal = (
  index: number,
  count: number,
  durationInFrames: number,
  fps: number,
  options?: { readonly startFrame?: number; readonly endPaddingSeconds?: number },
): { readonly start: number; readonly revealWindow: number } => {
  const startFrame = options?.startFrame ?? fps * 0.6;
  const endPadding = (options?.endPaddingSeconds ?? 0.6) * fps;
  const bodyEnd = Math.max(startFrame + fps * 0.5, durationInFrames - endPadding);
  const step = count > 0 ? (bodyEnd - startFrame) / count : 0;
  const start = startFrame + index * step;
  const revealWindow = Math.min(Math.max(step, fps * 0.3), fps * 0.6);
  return { start, revealWindow };
};
