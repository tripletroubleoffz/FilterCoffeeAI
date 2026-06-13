import { IVectorService } from './interface';
import * as fs from 'fs';
import * as path from 'path';

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

interface MockPoint {
  id: string;
  vector: number[];
  payload: any;
}

export class MockVectorService implements IVectorService {
  private localVectorDbPath = path.join(process.cwd(), 'prisma', 'vector_db.json');

  private readLocalVectorDb(): MockPoint[] {
    try {
      if (fs.existsSync(this.localVectorDbPath)) {
        const data = fs.readFileSync(this.localVectorDbPath, 'utf-8');
        return JSON.parse(data);
      }
    } catch (error) {
      // ignore missing file errors
    }
    return [];
  }

  private writeLocalVectorDb(points: MockPoint[]) {
    try {
      const dir = path.dirname(this.localVectorDbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.localVectorDbPath, JSON.stringify(points, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error writing local vector DB:', error);
    }
  }

  async initCollection(): Promise<void> {
    if (!fs.existsSync(this.localVectorDbPath)) {
      this.writeLocalVectorDb([]);
    }
  }

  async upsertSignal(id: string, vector: number[], payload: any): Promise<void> {
    const points = this.readLocalVectorDb();
    const index = points.findIndex(p => p.id === id);
    const newPoint: MockPoint = { id, vector, payload };
    if (index >= 0) {
      points[index] = newPoint;
    } else {
      points.push(newPoint);
    }
    this.writeLocalVectorDb(points);
  }

  async searchSimilarSignals(
    vector: number[],
    limit = 5,
    scoreThreshold = 0.85
  ): Promise<Array<{ id: string; score: number; payload: any }>> {
    const points = this.readLocalVectorDb();
    const scored = points
      .map(p => {
        const score = cosineSimilarity(vector, p.vector);
        return {
          id: p.id,
          score,
          payload: p.payload,
        };
      })
      .filter(p => p.score >= scoreThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored;
  }

  async deleteSignal(id: string): Promise<void> {
    const points = this.readLocalVectorDb();
    const filtered = points.filter(p => p.id !== id);
    this.writeLocalVectorDb(filtered);
  }
}
