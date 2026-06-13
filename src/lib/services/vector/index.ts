import { IVectorService } from './interface';
import { MockVectorService } from './mock';
import { QdrantVectorService } from './qdrant';

const vectorProvider = process.env.VECTOR_PROVIDER || 'mock';

let vectorService: IVectorService;

if (vectorProvider === 'qdrant' && process.env.QDRANT_URL && process.env.QDRANT_URL !== 'mock') {
  try {
    vectorService = new QdrantVectorService();
  } catch (e) {
    console.error('Failed to initialize Qdrant service, falling back to local file vector store:', e);
    vectorService = new MockVectorService();
  }
} else {
  vectorService = new MockVectorService();
}

export { vectorService };
export type { IVectorService };
