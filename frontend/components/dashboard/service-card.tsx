'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Square, FileText, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import type { ServiceInfo, GPUInfo, StartConfig } from '@/lib/types';
import { useState } from 'react';
import { toast } from 'sonner';
import { getApiUrl } from '@/lib/api-config';

interface ServiceCardProps {
  serviceKey: string;
  service: ServiceInfo;
  index: number;
  availableGpus?: GPUInfo[];
  onViewLogs: (serviceKey: string, serviceName: string) => void;
}

const getInitialConfig = (service: ServiceInfo, availableGpus: GPUInfo[]): StartConfig => {
  const dp = service.default_params;
  return {
    gpus: dp?.gpus || service.gpus || (availableGpus.length > 0 ? [availableGpus[0].index] : []),
    port: dp?.port || service.port,
    tensorParallelSize: dp?.tensor_parallel_size || 1,
    gpuUtil: dp?.gpu_memory_utilization || 0.9,
    maxModelLen: dp?.max_model_len || 4096,
    dtype: dp?.dtype || 'auto',
    saveAsDefault: false,
  };
};

export function ServiceCard({ serviceKey, service, index, availableGpus = [], onViewLogs }: ServiceCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<StartConfig>(() => getInitialConfig(service, availableGpus));
  const isRunning = service.status === 'running';

  const handleStartClick = () => {
    setConfig(getInitialConfig(service, availableGpus));
    setShowConfig(true);
  };

  const handleConfirmStart = async () => {
    if (config.gpus.length === 0) {
      toast.error('请至少选择一个GPU');
      return;
    }

    setShowConfig(false);
    setIsLoading(true);

    try {
      const response = await fetch(getApiUrl(`/api/service/${serviceKey}/start`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
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
    console.log('handleStop called for', serviceKey);
    setIsLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/service/${serviceKey}/stop`), { method: 'POST' });
      const result = await response.json();
      console.log('Stop result:', result);

      if (result.success) {
        toast.success('服务停止成功');
      } else {
        toast.error(`停止失败: ${result.message}`);
      }
    } catch (error) {
      console.error('Stop error:', error);
      toast.error(`停止失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Card className="hover:shadow-lg transition-shadow duration-300 bg-card border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-base font-bold font-display tracking-tight">{service.name}</span>
            <Badge
              variant={isRunning ? 'default' : 'secondary'}
              className={isRunning ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'}
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
                  <span className="font-mono text-foreground">{service.cpu_percent?.toFixed(1)}%</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground col-span-2">
                  <MemoryStick className="h-3 w-3" />
                  <span>内存:</span>
                  <span className="font-mono text-foreground">{service.memory_mb?.toFixed(0)}MB</span>
                  {service.gpu_memory_mb && (
                    <>
                      <span className="ml-2">GPU显存:</span>
                      <span className="font-mono text-foreground">{service.gpu_memory_mb.toFixed(0)}MB</span>
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
              className="flex-1 font-semibold"
              onClick={handleStartClick}
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

      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>启动配置 - {service.name}</DialogTitle>
            <DialogDescription>配置模型启动参数</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">GPU 选择</label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-md max-h-40 overflow-y-auto">
                {availableGpus.map((gpu) => (
                  <div key={gpu.index} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`gpu-${serviceKey}-${gpu.index}`}
                      checked={config.gpus.includes(gpu.index)}
                      onChange={(e) => {
                        setConfig((prev) => ({
                          ...prev,
                          gpus: e.target.checked
                            ? [...prev.gpus, gpu.index].sort((a, b) => a - b)
                            : prev.gpus.filter((g) => g !== gpu.index),
                        }));
                      }}
                      className="h-4 w-4 rounded border-primary"
                    />
                    <label htmlFor={`gpu-${serviceKey}-${gpu.index}`} className="text-xs cursor-pointer">
                      [{gpu.index}] {gpu.name}
                    </label>
                  </div>
                ))}
                {availableGpus.length === 0 && <span className="text-sm text-muted-foreground">未检测到GPU</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor={`tps-${serviceKey}`} className="text-sm font-medium">Tensor Parallel Size</label>
                <input
                  id={`tps-${serviceKey}`}
                  type="number"
                  min="1"
                  value={config.tensorParallelSize}
                  onChange={(e) => setConfig({ ...config, tensorParallelSize: parseInt(e.target.value) || 0 })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`port-${serviceKey}`} className="text-sm font-medium">端口</label>
                <input
                  id={`port-${serviceKey}`}
                  type="number"
                  value={config.port}
                  onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 0 })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label htmlFor={`gpuutil-${serviceKey}`} className="text-sm font-medium">GPU 显存占用率</label>
                <span className="text-sm text-muted-foreground">{config.gpuUtil}</span>
              </div>
              <input
                id={`gpuutil-${serviceKey}`}
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={config.gpuUtil}
                onChange={(e) => setConfig({ ...config, gpuUtil: parseFloat(e.target.value) })}
                className="w-full h-2 bg-secondary rounded-lg cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor={`mml-${serviceKey}`} className="text-sm font-medium">Max Model Len</label>
                <input
                  id={`mml-${serviceKey}`}
                  type="number"
                  value={config.maxModelLen}
                  onChange={(e) => setConfig({ ...config, maxModelLen: parseInt(e.target.value) || 0 })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`dtype-${serviceKey}`} className="text-sm font-medium">数据类型</label>
                <select
                  id={`dtype-${serviceKey}`}
                  value={config.dtype}
                  onChange={(e) => setConfig({ ...config, dtype: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                >
                  <option value="auto" className="bg-background">auto</option>
                  <option value="float16" className="bg-background">float16</option>
                  <option value="bfloat16" className="bg-background">bfloat16</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id={`save-default-${serviceKey}`}
                checked={config.saveAsDefault}
                onChange={(e) => setConfig({ ...config, saveAsDefault: e.target.checked })}
                className="h-4 w-4 rounded border-primary"
              />
              <label htmlFor={`save-default-${serviceKey}`} className="text-sm font-medium">
                保存为默认配置
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfig(false)}>取消</Button>
            <Button onClick={handleConfirmStart} disabled={isLoading}>
              {isLoading ? '启动中...' : '确认启动'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
