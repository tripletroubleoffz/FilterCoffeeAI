import { IVectorService } from './interface';
import { QdrantVectorService } from './qdrant';
import { MockVectorService } from './mock';

let instance: IVectorService | null = null;

const vectorService = new Proxy({} as IVectorService, {
  get(target, prop) {
    if (!instance) {
      if (process.env.VECTOR_PROVIDER === 'mock' || !process.env.QDRANT_URL || process.env.QDRANT_URL === 'mock') {
        instance = new MockVectorService();
      } else {
        instance = new QdrantVectorService();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { vectorService };
export type { IVectorService };

