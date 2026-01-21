'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, FileText, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import type { ServiceInfo } from '@/lib/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

interface ServiceCardProps {
  serviceKey: string;
  service: ServiceInfo;
  index: number;
  onViewLogs: (serviceKey: string, serviceName: string) => void;
}

export function ServiceCard({ serviceKey, service, index, onViewLogs }: ServiceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isRunning = service.status === 'running';

  const handleStart = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/service/${serviceKey}/start`, { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        toast.success('服务启动成功');
      } else {
        toast.error(`启动失败: ${result.message}`);
      }
    } catch (error) {
      toast.error(`启动失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/service/${serviceKey}/stop`, { method: 'POST' });
      const result = await response.json();

      if (result.success) {
        toast.success('服务停止成功');
      } else {
        toast.error(`停止失败: ${result.message}`);
      }
    } catch (error) {
      toast.error(`停止失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="glass relative overflow-hidden group hover:border-primary/50 transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-base">{service.name}</span>
            <Badge
              variant={isRunning ? 'default' : 'secondary'}
              className={isRunning ? 'bg-neon-cyan text-black' : ''}
            >
              {isRunning ? '运行中' : '已停止'}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <span>端口:</span>
              <span className="font-mono text-foreground">{service.port}</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <HardDrive className="h-3 w-3" />
              <span>GPU:</span>
              <span className="font-mono text-foreground">{service.gpus.join(', ')}</span>
            </div>

            {isRunning && (
              <>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>PID:</span>
                  <span className="font-mono text-foreground">{service.pid}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Cpu className="h-3 w-3" />
                  <span>CPU:</span>
                  <span className="font-mono text-neon-cyan">{service.cpu_percent?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                  <MemoryStick className="h-3 w-3" />
                  <span>内存:</span>
                  <span className="font-mono text-neon-magenta">{service.memory_mb?.toFixed(0)}MB</span>
                  {service.gpu_memory_mb && (
                    <>
                      <span className="ml-2">GPU显存:</span>
                      <span className="font-mono text-neon-yellow">{service.gpu_memory_mb.toFixed(0)}MB</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground col-span-2 text-[10px]">
                  <span>启动时间:</span>
                  <span className="font-mono">{service.uptime}</span>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="default"
              className="flex-1 bg-neon-cyan hover:bg-neon-cyan/80 text-black font-bold"
              onClick={handleStart}
              disabled={isRunning || isLoading}
            >
              <Play className="h-3 w-3 mr-1" />
              启动
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={handleStop}
              disabled={!isRunning || isLoading}
            >
              <Square className="h-3 w-3 mr-1" />
              停止
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onViewLogs(serviceKey, service.name)}
            >
              <FileText className="h-3 w-3 mr-1" />
              日志
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
