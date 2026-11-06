import type { JSX } from "react";

const WIDTH = 120;
const HEIGHT = 28;
const PADDING = 3;

interface Point {
  x: number;
  y: number;
}

interface LatencySparklineProps {
  values: readonly (number | null)[];
}

const _toSegments = (values: readonly (number | null)[]): Point[][] => {
  const measured = values.filter((value): value is number => value !== null);
  if (measured.length === 0) return [];
  const min = Math.min(...measured);
  const range = Math.max(...measured) - min || 1;
  const step = values.length > 1 ? WIDTH / (values.length - 1) : 0;

  const segments: Point[][] = [[]];
  values.forEach((value, index) => {
    if (value === null) {
      segments.push([]);
      return;
    }
    segments.at(-1)?.push({
      x: index * step,
      y: HEIGHT - PADDING - ((value - min) / range) * (HEIGHT - PADDING * 2),
    });
  });
  return segments.filter((segment) => segment.length > 0);
};

const _toPolyline = (segment: readonly Point[]): string =>
  segment
    .map((point) => `${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(" ");

export const LatencySparkline = ({
  values,
}: LatencySparklineProps): JSX.Element => (
  <svg
    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
    width={WIDTH}
    height={HEIGHT}
    className="h-7 w-full max-w-30 text-primary"
    aria-hidden="true"
  >
    {_toSegments(values).map((segment) => {
      const [first] = segment;
      if (segment.length === 1 && first) {
        return (
          <circle
            key={first.x}
            cx={first.x}
            cy={first.y}
            r={1.5}
            fill="currentColor"
          />
        );
      }
      return (
        <polyline
          key={segment[0]?.x}
          points={_toPolyline(segment)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      );
    })}
  </svg>
);
