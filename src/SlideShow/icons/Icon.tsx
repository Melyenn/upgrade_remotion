export type IconName =
  | "lightbulb"
  | "target"
  | "chartUp"
  | "chartDown"
  | "check"
  | "cross"
  | "clock"
  | "star"
  | "arrowRight"
  | "rocket"
  | "heart"
  | "flag";

// A small set of original, generic line icons (universal UI shapes - a
// lightbulb, a target, a checkmark... not tied to any specific character or
// brand) used to give each slide a relevant visual anchor without needing
// photos or illustrated characters.
export const Icon: React.FC<{
  readonly name: IconName;
  readonly size?: number;
  readonly color: string;
}> = ({ name, size = 56, color }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (name) {
    case "lightbulb":
      return (
        <svg {...common}>
          <path d="M24 6a13 13 0 0 0-7 24c1.4 1 2 2.4 2 4v2h10v-2c0-1.6.6-3 2-4a13 13 0 0 0-7-24Z" />
          <line x1={19} y1={41} x2={29} y2={41} />
          <line x1={20} y1={44} x2={28} y2={44} />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx={24} cy={24} r={17} />
          <circle cx={24} cy={24} r={10} />
          <circle cx={24} cy={24} r={3} fill={color} />
        </svg>
      );
    case "chartUp":
      return (
        <svg {...common}>
          <polyline points="6,34 18,22 26,28 42,10" />
          <polyline points="30,10 42,10 42,22" />
        </svg>
      );
    case "chartDown":
      return (
        <svg {...common}>
          <polyline points="6,14 18,26 26,20 42,38" />
          <polyline points="42,26 42,38 30,38" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <circle cx={24} cy={24} r={18} />
          <polyline points="15,25 21,31 33,17" />
        </svg>
      );
    case "cross":
      return (
        <svg {...common}>
          <circle cx={24} cy={24} r={18} />
          <line x1={17} y1={17} x2={31} y2={31} />
          <line x1={31} y1={17} x2={17} y2={31} />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx={24} cy={24} r={18} />
          <polyline points="24,14 24,24 32,29" />
        </svg>
      );
    case "star":
      return (
        <svg {...common}>
          <path d="M24 6 29.5 18.5 43 20 33 29 36 43 24 35.5 12 43 15 29 5 20 18.5 18.5Z" />
        </svg>
      );
    case "arrowRight":
      return (
        <svg {...common}>
          <line x1={6} y1={24} x2={38} y2={24} />
          <polyline points="27,13 38,24 27,35" />
        </svg>
      );
    case "rocket":
      return (
        <svg {...common}>
          <path d="M24 6c6 4 9 11 9 18 0 5-2 9-2 9l-7 3-7-3s-2-4-2-9c0-7 3-14 9-18Z" />
          <circle cx={24} cy={21} r={3.5} />
          <path d="M16 27l-6 10 10-4" />
          <path d="M32 27l6 10-10-4" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M24 41S6 29 6 17a9 9 0 0 1 18-2 9 9 0 0 1 18 2c0 12-18 24-18 24Z" />
        </svg>
      );
    case "flag":
      return (
        <svg {...common}>
          <line x1={10} y1={6} x2={10} y2={42} />
          <path d="M10 8h24l-6 9 6 9H10Z" />
        </svg>
      );
    default:
      return null;
  }
};
