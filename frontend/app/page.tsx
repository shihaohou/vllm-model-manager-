'use client';

import { useServices, useGPU, useSystemInfo } from '@/hooks/use-dashboard-data';
import { GPUCard } from '@/components/dashboard/gpu-card';
import { ServiceCard } from '@/components/dashboard/service-card';
import { SystemStats } from '@/components/dashboard/system-stats';
import { LogsViewer } from '@/components/dashboard/logs-viewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';
import { Activity, Server, Cpu } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  const { data: services, isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: gpus, isLoading: gpusLoading, error: gpusError } = useGPU();
  const { data: systemInfo, isLoading: systemLoading, error: systemError } = useSystemInfo();

  const [logsState, setLogsState] = useState<{
    serviceKey: string | null;
    serviceName: string;
    isOpen: boolean;
  }>({
    serviceKey: null,
    serviceName: '',
    isOpen: false,
  });

  const handleViewLogs = (serviceKey: string, serviceName: string) => {
    setLogsState({
      serviceKey,
      serviceName,
      isOpen: true,
    });
  };

  const handleCloseLogs = () => {
    setLogsState(prev => ({ ...prev, isOpen: false }));
  };

  if (servicesError || gpusError || systemError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">连接失败</h2>
          <p className="text-muted-foreground">
            无法连接到后端 API 服务器，请检查 Flask 服务是否正在运行。
          </p>
          <p className="text-xs font-mono text-muted-foreground">
            默认地址: http://localhost:9000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 relative z-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-glow-cyan tracking-wider">
            vLLM MODEL MANAGER
          </h1>
          <p className="text-sm text-muted-foreground font-mono">
            自动刷新间隔: 5秒
          </p>
        </div>

        <Separator className="bg-primary/30" />

        {/* System Info */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-neon-cyan" />
            <h2 className="text-xl font-bold text-glow-cyan">系统资源</h2>
          </div>
          {systemLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          ) : systemInfo ? (
            <SystemStats info={systemInfo} />
          ) : null}
        </section>

        {/* GPU Status */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="h-5 w-5 text-neon-magenta" />
            <h2 className="text-xl font-bold text-glow-magenta">GPU 状态</h2>
          </div>
          {gpusLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : gpus && gpus.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gpus.map((gpu, index) => (
                <GPUCard key={gpu.index} gpu={gpu} index={index} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">无GPU信息</p>
          )}
        </section>

        {/* Services */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-neon-yellow" />
            <h2 className="text-xl font-bold text-neon-yellow">模型服务</h2>
          </div>
          {servicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : services ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(services).map(([key, service], index) => (
                <ServiceCard
                  key={key}
                  serviceKey={key}
                  service={service}
                  index={index}
                  onViewLogs={handleViewLogs}
                />
              ))}
            </div>
          ) : null}
        </section>
      </div>

      {/* Logs Modal */}
      <LogsViewer
        serviceKey={logsState.serviceKey}
        serviceName={logsState.serviceName}
        isOpen={logsState.isOpen}
        onClose={handleCloseLogs}
      />

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}
