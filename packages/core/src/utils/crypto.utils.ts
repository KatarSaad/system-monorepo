import * as crypto from 'crypto';

export class CryptoUtils {
  static hash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  static hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return crypto.createHmac(algorithm, secret).update(data).digest('hex');
  }

  static randomBytes(size: number): Buffer {
    return crypto.randomBytes(size);
  }

  static randomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  static encrypt(text: string, key: string): { encrypted: string; iv: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key).subarray(0, 32), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { encrypted, iv: iv.toString('hex') };
  }

  static decrypt(encryptedData: { encrypted: string; iv: string }, key: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key).subarray(0, 32), Buffer.from(encryptedData.iv, 'hex'));
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  static generateKeyPair(): { publicKey: string; privateKey: string } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    return { publicKey, privateKey };
  }

  static sign(data: string, privateKey: string): string {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    return sign.sign(privateKey, 'hex');
  }

  static verify(data: string, signature: string, publicKey: string): boolean {
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    return verify.verify(publicKey, signature, 'hex');
  }
}