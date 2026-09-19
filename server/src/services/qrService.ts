import QRCode from 'qrcode';
import crypto from 'crypto';

export class QRService {
  /**
   * Generates a cryptographically secure token for an appointment
   */
  public static generateToken(referenceNo: string, appointmentId: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHmac('sha256', process.env.JWT_SECRET || 'secret')
      .update(`${referenceNo}:${appointmentId}:${salt}`)
      .digest('hex')
      .substring(0, 32);
    return `RAVAN_PASS:${referenceNo}:${hash}`;
  }

  /**
   * Generates a Data URL (base64 image) of the QR code containing ONLY the secure token
   */
  public static async generateQRCodeDataUrl(token: string): Promise<string> {
    return QRCode.toDataURL(token, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 300,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  }
}
