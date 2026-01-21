'use client';

import { Database, HardDrive } from 'lucide-react';
import type { SystemInfo } from '@/lib/types';
import { MetricRing } from './metric-ring';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemStatsProps {
  info?: SystemInfo;
  loading?: boolean;
}

export function SystemStats({ info, loading }: SystemStatsProps) {
  if (loading || !info) {
    return (
      <div className="space-y-6 flex flex-col items-center">
        <Skeleton className="h-32 w-32 rounded-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  const stats = [
    {
      labelCN: '内存',
      value: info.memory_percent,
      detail: `${info.memory_used_gb.toFixed(0)}/${info.memory_total_gb.toFixed(0)} GB`,
      icon: Database,
      color: 'text-chart-2',
      bgColor: 'bg-chart-2',
    },
    {
      labelCN: '磁盘',
      value: info.disk_percent,
      detail: `${info.disk_used_gb.toFixed(0)} GB 已用`,
      icon: HardDrive,
      color: 'text-chart-3',
      bgColor: 'bg-chart-3',
    },
  ];

  return (
    <div className="flex flex-col gap-8 items-center">
      <MetricRing
        value={info.cpu_percent}
        label="CPU"
        size={140}
        strokeWidth={10}
        colorClass="text-chart-1"
      />

      <div className="w-full space-y-4">
        {stats.map((stat) => (
          <div key={stat.labelCN} className="bg-sidebar-accent/50 p-3 rounded-lg border border-sidebar-border/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <stat.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{stat.labelCN}</span>
              </div>
              <span className={`font-mono font-bold ${stat.color}`}>{stat.value.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-sidebar-border rounded-full overflow-hidden">
              <div
                className={`h-full ${stat.bgColor} transition-all duration-500`}
                style={{ width: `${stat.value}%` }}
              />
            </div>
            {stat.detail && (
              <p className="text-[10px] text-right text-muted-foreground mt-1 font-mono">{stat.detail}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
