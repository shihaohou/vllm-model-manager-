'use client';

import { useServices, useGPU, useSystemInfo } from '@/hooks/use-dashboard-data';
import { GPUCard } from '@/components/dashboard/gpu-card';
import { SystemSidebar } from '@/components/dashboard/system-sidebar';
import { ServiceCard } from '@/components/dashboard/service-card';
import { LogsViewer } from '@/components/dashboard/logs-viewer';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';
import { Server, LayoutGrid } from 'lucide-react';

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
    <div className="min-h-screen bg-background flex">
      <SystemSidebar systemInfo={systemInfo} loading={systemLoading} />

      <main className="flex-1 ml-72 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-display font-bold text-foreground">GPU 集群</h2>
              </div>
              <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">
                实时刷新: 0.5s
              </span>
            </div>

            {gpusLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-xl" />
                ))}
              </div>
            ) : gpus && gpus.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {gpus.map((gpu, index) => (
                  <GPUCard key={gpu.index} gpu={gpu} index={index} />
                ))}
              </div>
            ) : (
              <div className="p-10 border border-dashed border-muted rounded-xl text-center text-muted-foreground">
                未检测到 GPU 资源
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <Server className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-display font-bold text-foreground">模型服务</h2>
            </div>

            {servicesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-xl" />
                ))}
              </div>
            ) : services ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(services).map(([key, service], index) => (
                  <ServiceCard
                    key={key}
                    serviceKey={key}
                    service={service}
                    index={index}
                    availableGpus={gpus || []}
                    onViewLogs={handleViewLogs}
                  />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </main>

      <LogsViewer
        serviceKey={logsState.serviceKey}
        serviceName={logsState.serviceName}
        isOpen={logsState.isOpen}
        onClose={handleCloseLogs}
      />

      <Toaster position="top-right" />
    </div>
  );
}
