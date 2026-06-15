import { IVectorService } from './interface';
import * as fs from 'fs/promises';
import * as path from 'path';

interface VectorPoint {
  id: string;
  vector: number[];
  payload: any;
}

export class MockVectorService implements IVectorService {
  private filePath: string;

  constructor() {
    this.filePath = path.join(process.cwd(), 'prisma', 'vector_db.json');
  }

  private async readDB(): Promise<VectorPoint[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (e) {
      return [];
    }
  }

  private async writeDB(points: VectorPoint[]): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify(points, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Mock Vector] Write failed:', e);
    }
  }

  async initCollection(): Promise<void> {
    const points = await this.readDB();
    if (points.length === 0) {
      await this.writeDB([]);
    }
  }

  async upsertSignal(id: string, vector: number[], payload: any): Promise<void> {
    const points = await this.readDB();
    const existingIndex = points.findIndex(p => p.id === id);
    const newPoint = { id, vector, payload };
    if (existingIndex >= 0) {
      points[existingIndex] = newPoint;
    } else {
      points.push(newPoint);
    }
    await this.writeDB(points);
  }

  async searchSimilarSignals(
    vector: number[],
    limit = 5,
    scoreThreshold = 0.85
  ): Promise<Array<{ id: string; score: number; payload: any }>> {
    const points = await this.readDB();
    if (!vector || vector.length === 0) return [];
    
    const results = points.map(p => {
      let dotProduct = 0;
      let normA = 0;
      let normB = 0;
      const len = Math.min(vector.length, p.vector.length);
      for (let i = 0; i < len; i++) {
        dotProduct += vector[i] * p.vector[i];
        normA += vector[i] * vector[i];
        normB += p.vector[i] * p.vector[i];
      }
      const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) || 1);
      return {
        id: p.id,
        score: similarity,
        payload: p.payload,
      };
    });

    return results
      .filter(r => r.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async deleteSignal(id: string): Promise<void> {
    const points = await this.readDB();
    const filtered = points.filter(p => p.id !== id);
    await this.writeDB(filtered);
  }
}
