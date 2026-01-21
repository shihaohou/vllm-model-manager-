'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, MemoryStick, HardDrive } from 'lucide-react';
import type { SystemInfo } from '@/lib/types';
import { motion } from 'framer-motion';

interface SystemStatsProps {
  info: SystemInfo;
}

export function SystemStats({ info }: SystemStatsProps) {
  const stats = [
    {
      icon: Cpu,
      label: 'CPU 使用率',
      value: info.cpu_percent,
      unit: '%',
      color: 'text-neon-cyan',
    },
    {
      icon: MemoryStick,
      label: '内存使用率',
      value: info.memory_percent,
      unit: '%',
      color: 'text-neon-magenta',
      detail: `${info.memory_used_gb.toFixed(1)}GB / ${info.memory_total_gb.toFixed(1)}GB`,
    },
    {
      icon: HardDrive,
      label: '磁盘使用率',
      value: info.disk_percent,
      unit: '%',
      color: 'text-neon-yellow',
      detail: `${info.disk_used_gb.toFixed(0)}GB / ${info.disk_total_gb.toFixed(0)}GB`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass neon-border-cyan hover:neon-border-magenta transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <span className={`text-lg font-bold font-mono ${stat.color}`}>
                  {stat.value.toFixed(1)}{stat.unit}
                </span>
              </div>
              <Progress value={stat.value} className="h-1.5 mb-2" aria-label={stat.label} />
              {stat.detail && (
                <p className="text-[10px] text-muted-foreground font-mono text-right">
                  {stat.detail}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
