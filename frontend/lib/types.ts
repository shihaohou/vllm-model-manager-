export interface GPUInfo {
  index: number;
  name: string;
  temperature: number;
  utilization: number;
  memory_used: number;
  memory_total: number;
  power_draw: number;
  power_limit: number;
}

export interface ServiceInfo {
  name: string;
  port: number;
  gpus: number[];
  status: 'running' | 'stopped' | 'error';
  pid?: number;
  cpu_percent?: number;
  memory_mb?: number;
  gpu_memory_mb?: number;
  uptime?: string;
  message?: string;
}

export interface SystemInfo {
  cpu_percent: number;
  memory_percent: number;
  memory_used_gb: number;
  memory_total_gb: number;
  disk_percent: number;
  disk_used_gb: number;
  disk_total_gb: number;
}

export interface ServicesMap {
  [key: string]: ServiceInfo;
}
