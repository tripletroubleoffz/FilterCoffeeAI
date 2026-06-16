import crypto from 'crypto';

export class EncryptionService {
  private static ALGORITHM = 'aes-256-gcm';

  private static getKey(): Buffer {
    const keyStr = process.env.ENCRYPTION_KEY || 'default-secret-key-32-chars-long!'; // 32 bytes
    if (keyStr.length >= 32) {
      return Buffer.from(keyStr.slice(0, 32));
    }
    return Buffer.alloc(32, keyStr); // pad with zeroes
  }

  static encrypt(text: string): string {
    try {
      const key = this.getKey();
      const iv = crypto.randomBytes(12);
      const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = (cipher as any).getAuthTag().toString('hex');

      return `${iv.toString('hex')}:${encrypted}:${authTag}`;
    } catch (err: any) {
      console.error('Encryption failed:', err);
      throw new Error('Encryption operation failed.');
    }
  }

  static decrypt(encryptedText: string): string {
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 3) {
        return encryptedText;
      }

      const key = this.getKey();
      const iv = Buffer.from(parts[0], 'hex');
      const ciphertext = parts[1];
      const authTag = Buffer.from(parts[2], 'hex');

      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      (decipher as any).setAuthTag(authTag);

      let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (err: any) {
      console.error('Decryption failed:', err);
      return encryptedText;
    }
  }
}
