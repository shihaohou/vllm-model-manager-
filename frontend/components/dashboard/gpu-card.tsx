'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Microchip, Thermometer, Zap, Activity } from 'lucide-react';
import type { GPUInfo, MetricPoint } from '@/lib/types';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';

interface GPUCardProps {
  gpu: GPUInfo;
  index: number;
}

export function GPUCard({ gpu, index }: GPUCardProps) {
  const [history, setHistory] = useState<MetricPoint[]>([]);
  const maxHistoryPoints = 20;

  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getMinutes()}:${now.getSeconds().toString().padStart(2, '0')}`;

    setHistory(prev => {
      const newHistory = [...prev, { timestamp: timeStr, value: gpu.utilization }];
      if (newHistory.length > maxHistoryPoints) {
        return newHistory.slice(newHistory.length - maxHistoryPoints);
      }
      return newHistory;
    });
  }, [gpu]);

  const memoryPercent = gpu.memory_total > 0 ? (gpu.memory_used / gpu.memory_total) * 100 : 0;

  const getTempColor = (temp: number) => {
    if (temp > 80) return 'text-destructive';
    if (temp > 70) return 'text-chart-3';
    return 'text-chart-2';
  };

  return (
    <Card className="overflow-hidden border border-border/50 shadow-md hover:shadow-xl transition-all duration-300 bg-card">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Microchip className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold font-display text-sm tracking-wide">GPU {gpu.index}</h3>
              <p className="text-xs text-muted-foreground font-mono truncate max-w-[120px]" title={gpu.name}>
                {gpu.name.replace('NVIDIA ', '').replace('GeForce ', '')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={`font-mono text-xs ${getTempColor(gpu.temperature)} border-border/50`}>
              <Thermometer className="h-3 w-3 mr-1" />
              {gpu.temperature}°C
            </Badge>
            <div className="flex items-center text-xs text-muted-foreground font-mono">
              <Zap className="h-3 w-3 mr-1" />
              {gpu.power_draw.toFixed(0)}W
            </div>
          </div>
        </div>

        <div className="h-20 w-full -mx-1 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id={`colorUtil-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="timestamp" hide />
              <YAxis hide domain={[0, 100]} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#colorUtil-${index})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Activity className="h-3 w-3" /> 利用率
            </span>
            <div className="text-xl font-mono font-bold text-foreground">
              {gpu.utilization.toFixed(1)}%
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">显存</span>
            <div className="text-sm font-mono font-bold text-foreground pt-1">
              {gpu.memory_used.toFixed(0)}
              <span className="text-muted-foreground font-normal text-xs"> / {gpu.memory_total.toFixed(0)} MB</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-chart-4 transition-all duration-500"
                style={{ width: `${memoryPercent}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
