import { useId } from 'react';
import { cx } from '../cx';
import { graphic, type Tone } from '../tones';

interface SparklineProps {
  data: readonly number[];
  /** Describes the trend for assistive tech, e.g. "Reviews, last 14 days: 2 to 6". */
  label: string;
  tone?: Tone;
  width?: number;
  height?: number;
  className?: string;
}

export function sparklinePoints(data: readonly number[], width: number, height: number, pad = 4) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  return data.map((v, i): [number, number] => [
    Math.round((i / Math.max(1, data.length - 1)) * (width - pad * 2) + pad),
    Math.round(height - pad - ((v - min) / span) * (height - pad * 2)),
  ]);
}

export function Sparkline({
  data,
  label,
  tone = 'accent',
  width = 132,
  height = 40,
  className,
}: SparklineProps) {
  const gradientId = useId();
  if (data.length === 0) return null;

  const points = sparklinePoints(data, width, height);
  const line = points.map((p) => p.join(',')).join(' ');
  const [lastX, lastY] = points[points.length - 1]!;
  const area = `M${points[0]![0]},${height} L${points.map((p) => p.join(',')).join(' L')} L${lastX},${height} Z`;

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cx('overflow-visible', graphic[tone], className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.28" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={3.5}
        fill="currentColor"
        className="stroke-raised"
        strokeWidth={2}
      />
    </svg>
  );
}
