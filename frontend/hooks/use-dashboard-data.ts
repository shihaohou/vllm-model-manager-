import useSWR from 'swr';
import type { GPUInfo, ServicesMap, SystemInfo } from '@/lib/types';
import { getApiUrl } from '@/lib/api-config';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('An error occurred while fetching the data.');
  }
  return res.json();
};

export function useServices() {
  return useSWR<ServicesMap>(getApiUrl('/api/services'), fetcher, {
    refreshInterval: 500,
  });
}

export function useGPU() {
  return useSWR<GPUInfo[]>(getApiUrl('/api/gpu'), fetcher, {
    refreshInterval: 500,
  });
}

export function useSystemInfo() {
  return useSWR<SystemInfo>(getApiUrl('/api/system'), fetcher, {
    refreshInterval: 500,
  });
}
