import { useCurrentFrame, useVideoConfig } from "remotion";

export type GlowVariant = "topRight" | "bottomLeft" | "center";

const POSITIONS: Record<GlowVariant, { readonly x: number; readonly y: number }> = {
  topRight: { x: 82, y: 18 },
  bottomLeft: { x: 14, y: 80 },
  center: { x: 50, y: 55 },
};

// A soft, slowly-drifting color blob behind the slide content - adds color
// and a sense of motion without competing with the text (low opacity, pure
// background layer). Which corner it sits in varies per slide (via
// `variant`) so consecutive slides don't feel identical, while every slide
// uses the exact same mechanism - consistent, not chaotic.
export const AccentGlow: React.FC<{
  readonly color: string;
  readonly variant: GlowVariant;
}> = ({ color, variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const { x, y } = POSITIONS[variant];

  const driftX = x + Math.sin(t * 0.3) * 4;
  const driftY = y + Math.cos(t * 0.25) * 4;
  const scale = 1 + Math.sin(t * 0.4) * 0.06;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${driftX}%`,
          top: `${driftY}%`,
          width: 760,
          height: 760,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
          opacity: 0.22,
          scale,
          translate: "-50% -50%",
        }}
      />
    </div>
  );
};
