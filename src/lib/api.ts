import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

export async function fetchBatch(batchId: string) {
  const { data } = await api.get(`/batch/${encodeURIComponent(batchId)}`);
  return data as {
    batchId: string;
    onchain: any;
    offchain: any;
    sensors: Array<{ temperature?: number; humidity?: number; gas?: number; createdAt: string }>;
  };
}

export async function fetchLatestBatches() {
  const { data } = await api.get('/batch');
  return data as { items: Array<{ batchId: string; product: string; farmer: string; location: string; price: number; createdAt: string }> };
}


