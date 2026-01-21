import useSWR from 'swr';
import type { GPUInfo, ServicesMap, SystemInfo } from '@/lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function useServices() {
  return useSWR<ServicesMap>('/api/services', fetcher, {
    refreshInterval: 5000,
  });
}

export function useGPU() {
  return useSWR<GPUInfo[]>('/api/gpu', fetcher, {
    refreshInterval: 5000,
  });
}

export function useSystemInfo() {
  return useSWR<SystemInfo>('/api/system', fetcher, {
    refreshInterval: 5000,
  });
}
