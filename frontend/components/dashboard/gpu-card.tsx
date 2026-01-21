'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Cpu, Thermometer, Zap } from 'lucide-react';
import type { GPUInfo } from '@/lib/types';
import { motion } from 'framer-motion';

interface GPUCardProps {
  gpu: GPUInfo;
  index: number;
}

export function GPUCard({ gpu, index }: GPUCardProps) {
  const memoryPercent = gpu.memory_total > 0 ? (gpu.memory_used / gpu.memory_total) * 100 : 0;
  const powerPercent = gpu.power_limit > 0 ? (gpu.power_draw / gpu.power_limit) * 100 : 0;

  const getTempColor = (temp: number) => {
    if (temp > 80) return 'text-destructive';
    if (temp > 70) return 'text-neon-yellow';
    return 'text-neon-cyan';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass neon-border-cyan relative overflow-hidden group hover:neon-border-magenta transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <span className="text-glow-cyan flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              GPU {gpu.index}
            </span>
            <Badge variant="outline" className={getTempColor(gpu.temperature)}>
              <Thermometer className="h-3 w-3 mr-1" />
              {gpu.temperature}°C
            </Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground font-mono">{gpu.name}</p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">GPU 利用率</span>
              <span className="text-glow-cyan font-mono">{gpu.utilization.toFixed(1)}%</span>
            </div>
            <Progress value={gpu.utilization} className="h-2" aria-label="GPU 利用率" />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">显存使用</span>
              <span className="text-glow-magenta font-mono">
                {gpu.memory_used.toFixed(0)}MB / {gpu.memory_total.toFixed(0)}MB
              </span>
            </div>
            <Progress value={memoryPercent} className="h-2" aria-label="显存使用率" />
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Zap className="h-3 w-3" />
              功耗
            </div>
            <span className="font-mono text-neon-yellow">
              {gpu.power_draw.toFixed(1)}W / {gpu.power_limit.toFixed(1)}W
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
