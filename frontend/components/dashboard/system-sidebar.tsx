'use client';

import type { SystemInfo } from '@/lib/types';
import { SystemStats } from './system-stats';
import { Separator } from '@/components/ui/separator';
import { Activity, Server } from 'lucide-react';

interface SystemSidebarProps {
  systemInfo: SystemInfo | undefined;
  loading: boolean;
}

export function SystemSidebar({ systemInfo, loading }: SystemSidebarProps) {
  return (
    <aside className="w-72 fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border p-6 flex flex-col z-30">
      <div className="flex items-center gap-3 mb-8">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Server className="h-6 w-6 text-primary" />
          <span className="absolute right-0 top-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary" />
          </span>
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight tracking-tight">
            vLLM
            <span className="block text-muted-foreground text-xs font-normal">Manager</span>
          </h1>
        </div>
      </div>

      <Separator className="bg-sidebar-border mb-6" />

      <div className="space-y-6 flex-1 overflow-y-auto pr-2">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold tracking-wide text-sidebar-foreground/80 uppercase">
            系统监控
          </h2>
        </div>
        <SystemStats info={systemInfo} loading={loading} />
      </div>

      <div className="mt-auto pt-6 text-xs text-muted-foreground font-mono border-t border-sidebar-border">
        <p className="flex justify-between">
          <span>刷新间隔</span>
          <span className="text-foreground">0.5s</span>
        </p>
        <p className="flex justify-between mt-1">
          <span>版本</span>
          <span className="text-foreground">0.1.0</span>
        </p>
      </div>
    </aside>
  );
}
