export interface IVectorService {
  initCollection(): Promise<void>;
  upsertSignal(id: string, vector: number[], payload: any): Promise<void>;
  searchSimilarSignals(vector: number[], limit?: number, scoreThreshold?: number): Promise<Array<{ id: string; score: number; payload: any }>>;
  deleteSignal(id: string): Promise<void>;
}
