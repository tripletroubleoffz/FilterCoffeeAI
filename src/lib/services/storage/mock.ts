import { IStorageService } from './interface';
import * as fs from 'fs';
import * as path from 'path';

export class MockStorageService implements IStorageService {
  private uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  constructor() {
    try {
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }
    } catch (e) {
      console.warn('Failed to initialize local uploads directory:', e);
    }
  }

  async uploadFile(key: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      const filePath = path.join(this.uploadsDir, key);
      const dir = path.dirname(filePath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, fileBuffer);
      return `/uploads/${key}`;
    } catch (err: any) {
      console.error('Local file upload failed:', err);
      throw new Error(`Local storage error: ${err.message}`);
    }
  }

  async getFileUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }
}
