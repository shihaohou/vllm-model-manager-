'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LogsViewerProps {
  serviceKey: string | null;
  serviceName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function LogsViewer({ serviceKey, serviceName, isOpen, onClose }: LogsViewerProps) {
  const [logs, setLogs] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && serviceKey) {
      setIsLoading(true);
      fetch(`/api/service/${serviceKey}/logs?lines=200`)
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setLogs(result.logs || '日志为空');
          } else {
            setLogs(`加载日志失败: ${result.message}`);
          }
        })
        .catch(error => {
          setLogs(`加载日志失败: ${error.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, serviceKey]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] glass">
        <DialogHeader>
          <DialogTitle className="text-glow-cyan">{serviceName} - 日志</DialogTitle>
        </DialogHeader>
        <div className="mt-4 bg-black/50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          ) : (
            <pre className="text-xs font-mono text-neon-cyan whitespace-pre-wrap">
              {logs}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
