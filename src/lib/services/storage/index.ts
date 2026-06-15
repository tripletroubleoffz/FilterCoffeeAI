import { IStorageService } from './interface';
import { S3StorageService } from './s3';
import { MockStorageService } from './mock';

let instance: IStorageService | null = null;

const storageService = new Proxy({} as IStorageService, {
  get(target, prop) {
    if (!instance) {
      if (process.env.STORAGE_PROVIDER === 'mock' || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        instance = new MockStorageService();
      } else {
        instance = new S3StorageService();
      }
    }
    const val = (instance as any)[prop];
    return typeof val === 'function' ? val.bind(instance) : val;
  }
});

export { storageService };
export type { IStorageService };

