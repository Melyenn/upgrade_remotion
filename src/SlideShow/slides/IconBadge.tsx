import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Icon, type IconName } from "../icons/Icon";

// A small rounded badge around one of the original line icons, used near a
// slide's heading as a relevant visual anchor. Opacity still follows the
// caller's own heading entrance progress (0-1) so the fade stays in sync
// with the text around it, but the scale runs its own short spring - giving
// the badge a small, snappy "pop" (slight overshoot past 1 before settling)
// instead of a flat ease-in, without needing every caller to coordinate a
// bounce curve itself.
export const IconBadge: React.FC<{
  readonly name: IconName;
  readonly color: string;
  readonly progress: number;
}> = ({ name, color, progress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.6, stiffness: 180 },
  });

  return (
    <div
      className="mb-7 flex h-24 w-24 items-center justify-center rounded-2xl"
      style={{
        backgroundColor: `${color}1F`,
        opacity: progress,
        scale: interpolate(pop, [0, 1], [0.6, 1], {
          output: "perceptual-scale",
        }),
      }}
    >
      <Icon name={name} size={48} color={color} />
    </div>
  );
};
