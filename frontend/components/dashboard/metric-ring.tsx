'use client';

import { cn } from '@/lib/utils';

interface MetricRingProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subLabel?: string;
  colorClass?: string;
  className?: string;
}

export function MetricRing({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  subLabel,
  colorClass = 'text-primary',
  className,
}: MetricRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const dashOffset = circumference - percentage * circumference;

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted/30"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          className={cn('transition-all duration-700 ease-out', colorClass)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono tracking-tighter">
          {value.toFixed(0)}%
        </span>
        {label && (
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide mt-1">
            {label}
          </span>
        )}
        {subLabel && (
          <span className="text-[10px] text-muted-foreground/70">{subLabel}</span>
        )}
      </div>
    </div>
  );
}
