import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export class PhotoStorageService {
  private static uploadDir = config.storageUploadDir;

  public static ensureDirectory() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Saves a base64 encoded photo or buffer to the private vault
   */
  public static async savePhoto(base64DataOrBuffer: string | Buffer, originalMime = 'image/jpeg'): Promise<{
    filePath: string;
    mimeType: string;
    fileSize: number;
    sha256Hash: string;
  }> {
    this.ensureDirectory();

    let buffer: Buffer;
    let mimeType = originalMime;

    if (typeof base64DataOrBuffer === 'string') {
      const matches = base64DataOrBuffer.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        buffer = Buffer.from(matches[2], 'base64');
      } else {
        buffer = Buffer.from(base64DataOrBuffer, 'base64');
      }
    } else {
      buffer = base64DataOrBuffer;
    }

    // Security validation: Size limit 5MB
    if (buffer.length > 5 * 1024 * 1024) {
      throw new Error('Photo size exceeds maximum allowed limit of 5MB');
    }

    // Security validation: Allowed image MIME types only
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(mimeType)) {
      throw new Error('Invalid image type. Allowed: JPEG, PNG, WEBP');
    }

    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg';
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const fullPath = path.join(this.uploadDir, filename);

    await fs.promises.writeFile(fullPath, buffer);

    return {
      filePath: filename,
      mimeType,
      fileSize: buffer.length,
      sha256Hash
    };
  }

  /**
   * Generates a time-limited signed URL token for authorized access to a visitor photo
   */
  public static generateSignedPhotoToken(photoId: string, allowedUserId: string): string {
    return jwt.sign(
      { photoId, allowedUserId, purpose: 'PHOTO_VIEW' },
      config.jwtSecret,
      { expiresIn: '30m' }
    );
  }

  /**
   * Resolves the safe absolute file path for a stored photo
   */
  public static getPhotoFilePath(filename: string): string | null {
    // Path traversal check
    const safeFilename = path.basename(filename);
    const targetPath = path.join(this.uploadDir, safeFilename);

    if (fs.existsSync(targetPath)) {
      return targetPath;
    }
    return null;
  }
}
