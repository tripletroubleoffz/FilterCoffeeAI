import { IStorageService } from './interface';
import * as fs from 'fs/promises';
import * as path from 'path';

export class MockStorageService implements IStorageService {
  async uploadFile(key: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, key);
      await fs.writeFile(filePath, fileBuffer);
      return `/uploads/${key}`;
    } catch (e) {
      console.error('[Mock Storage] Local write failed, returning mock URL:', e);
      return `/uploads/${key}`;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }
}
