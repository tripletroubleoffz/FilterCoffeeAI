import { IStorageService } from './interface';
import { MockStorageService } from './mock';
import { S3StorageService } from './s3';

const storageProvider = process.env.STORAGE_PROVIDER || 'mock';

let storageService: IStorageService;

if (storageProvider === 's3' && process.env.AWS_S3_BUCKET) {
  storageService = new S3StorageService();
} else {
  storageService = new MockStorageService();
}

export { storageService };
export type { IStorageService };
