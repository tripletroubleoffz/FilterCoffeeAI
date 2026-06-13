import { IStorageService } from './interface';
import { S3StorageService } from './s3';

let instance: IStorageService | null = null;

const storageService = new Proxy({} as IStorageService, {
  get(target, prop) {
    if (!instance) {
      instance = new S3StorageService();
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { storageService };
export type { IStorageService };
