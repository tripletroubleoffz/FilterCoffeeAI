import { IVectorService } from './interface';
import { QdrantVectorService } from './qdrant';

let instance: IVectorService | null = null;

const vectorService = new Proxy({} as IVectorService, {
  get(target, prop) {
    if (!instance) {
      instance = new QdrantVectorService();
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { vectorService };
export type { IVectorService };
