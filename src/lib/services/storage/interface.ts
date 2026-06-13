export interface IStorageService {
  uploadFile(key: string, fileBuffer: Buffer, mimeType: string): Promise<string>;
  getFileUrl(key: string): Promise<string>;
}
