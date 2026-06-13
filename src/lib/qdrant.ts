import { vectorService } from './services/vector';

export async function initCollection() {
  return vectorService.initCollection();
}

export async function upsertSignal(id: string, vector: number[], payload: any) {
  return vectorService.upsertSignal(id, vector, payload);
}

export async function searchSimilarSignals(vector: number[], limit = 5, scoreThreshold = 0.85) {
  return vectorService.searchSimilarSignals(vector, limit, scoreThreshold);
}

export async function deleteSignal(id: string) {
  return vectorService.deleteSignal(id);
}

