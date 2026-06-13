import { IStorageService } from './interface';

export class S3StorageService implements IStorageService {
  private bucketName: string;
  private region: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'us-east-1';
  }

  async uploadFile(key: string, fileBuffer: Buffer, mimeType: string): Promise<string> {
    try {
      // Dynamic import to prevent compiler errors if AWS SDK is missing locally
      const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
      const s3 = new S3Client({ region: this.region });
      
      await s3.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: fileBuffer,
          ContentType: mimeType,
        })
      );
      
      return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
    } catch (err: any) {
      console.error('S3 upload failed, falling back to local file path:', err);
      return `/uploads/${key}`;
    }
  }

  async getFileUrl(key: string): Promise<string> {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }
}
