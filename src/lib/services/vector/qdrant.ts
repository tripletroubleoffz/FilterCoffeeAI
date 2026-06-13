import { QdrantClient } from '@qdrant/js-client-rest';
import { IVectorService } from './interface';

const COLLECTION_NAME = 'signals';

export class QdrantVectorService implements IVectorService {
  private client: QdrantClient;

  constructor() {
    const url = process.env.QDRANT_URL;
    if (!url || url === 'mock') {
      throw new Error('QDRANT_URL must be configured to use QdrantVectorService');
    }
    this.client = new QdrantClient({
      url,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });
  }

  async initCollection(): Promise<void> {
    const collections = await this.client.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
    if (!exists) {
      await this.client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536,
          distance: 'Cosine',
        },
      });
    }
  }

  async upsertSignal(id: string, vector: number[], payload: any): Promise<void> {
    await this.client.upsert(COLLECTION_NAME, {
      wait: true,
      points: [
        {
          id,
          vector,
          payload,
        },
      ],
    });
  }

  async searchSimilarSignals(
    vector: number[],
    limit = 5,
    scoreThreshold = 0.85
  ): Promise<Array<{ id: string; score: number; payload: any }>> {
    const results = await this.client.search(COLLECTION_NAME, {
      vector,
      limit,
      score_threshold: scoreThreshold,
      with_payload: true,
    });
    return results.map(r => ({
      id: r.id.toString(),
      score: r.score,
      payload: r.payload,
    }));
  }

  async deleteSignal(id: string): Promise<void> {
    await this.client.delete(COLLECTION_NAME, {
      points: [id],
    });
  }
}
