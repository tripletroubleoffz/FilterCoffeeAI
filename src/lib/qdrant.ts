import { QdrantClient } from '@qdrant/js-client-rest';
import * as fs from 'fs';
import * as path from 'path';
import { cosineSimilarity } from './embeddings';

const COLLECTION_NAME = 'signals';

let qdrantClient: QdrantClient | null = null;

if (process.env.QDRANT_URL && process.env.QDRANT_URL !== 'mock') {
  try {
    qdrantClient = new QdrantClient({
      url: process.env.QDRANT_URL,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });
  } catch (error) {
    console.error('Failed to parse Qdrant Client credentials, falling back to offline DB:', error);
  }
}

const localVectorDbPath = path.join(process.cwd(), 'prisma', 'vector_db.json');

interface MockPoint {
  id: string;
  vector: number[];
  payload: any;
}

function readLocalVectorDb(): MockPoint[] {
  try {
    if (fs.existsSync(localVectorDbPath)) {
      const data = fs.readFileSync(localVectorDbPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    // Return empty list if file doesn't exist
  }
  return [];
}

function writeLocalVectorDb(points: MockPoint[]) {
  try {
    const dir = path.dirname(localVectorDbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localVectorDbPath, JSON.stringify(points, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing local vector DB:', error);
  }
}

export async function initCollection() {
  if (qdrantClient) {
    try {
      const collections = await qdrantClient.getCollections();
      const exists = collections.collections.some(c => c.name === COLLECTION_NAME);
      if (!exists) {
        await qdrantClient.createCollection(COLLECTION_NAME, {
          vectors: {
            size: 1536,
            distance: 'Cosine',
          },
        });
      }
      return;
    } catch (error) {
      console.error('Failed to initialize real Qdrant collection, fallback to local file DB:', error);
    }
  }

  // Local file-based mock init
  if (!fs.existsSync(localVectorDbPath)) {
    writeLocalVectorDb([]);
  }
}

export async function upsertSignal(id: string, vector: number[], payload: any) {
  if (qdrantClient) {
    try {
      await qdrantClient.upsert(COLLECTION_NAME, {
        wait: true,
        points: [
          {
            id,
            vector,
            payload,
          },
        ],
      });
      return;
    } catch (error) {
      console.error('Error upserting to Qdrant, falling back to local file DB:', error);
    }
  }

  // Local file-based mock
  const points = readLocalVectorDb();
  const index = points.findIndex(p => p.id === id);
  const newPoint: MockPoint = { id, vector, payload };
  if (index >= 0) {
    points[index] = newPoint;
  } else {
    points.push(newPoint);
  }
  writeLocalVectorDb(points);
}

export async function searchSimilarSignals(vector: number[], limit = 5, scoreThreshold = 0.85) {
  if (qdrantClient) {
    try {
      const results = await qdrantClient.search(COLLECTION_NAME, {
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
    } catch (error) {
      console.error('Error searching Qdrant, falling back to local file DB:', error);
    }
  }

  // Local file-based search
  const points = readLocalVectorDb();
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

export async function deleteSignal(id: string) {
  if (qdrantClient) {
    try {
      await qdrantClient.delete(COLLECTION_NAME, {
        points: [id],
      });
      return;
    } catch (error) {
      console.error('Error deleting from Qdrant, falling back to local file DB:', error);
    }
  }

  const points = readLocalVectorDb();
  const filtered = points.filter(p => p.id !== id);
  writeLocalVectorDb(filtered);
}
