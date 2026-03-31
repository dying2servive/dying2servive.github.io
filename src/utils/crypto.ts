import CryptoJS from 'crypto-js';

export class CryptoUtils {
  private static getPaddedKeyAndIv(keyStr: string) {
    let keyHex = Array.from(new TextEncoder().encode(keyStr))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // pad to 64 hex chars (32 bytes)
    keyHex = keyHex.padEnd(64, '0').slice(0, 64);
    
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const iv = CryptoJS.enc.Hex.parse(keyHex.slice(0, 32)); // first 16 bytes
    
    return { key, iv };
  }

  static encrypt(payload: any, secret: string): string {
    const { key, iv } = this.getPaddedKeyAndIv(secret);
    const jsonStr = JSON.stringify(payload);
    
    const encrypted = CryptoJS.AES.encrypt(jsonStr, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    return encrypted.toString(); // base64
  }

  static decrypt(ciphertextBase64: string, secret: string): any {
    const { key, iv } = this.getPaddedKeyAndIv(secret);
    
    const decrypted = CryptoJS.AES.decrypt(ciphertextBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    const jsonStr = decrypted.toString(CryptoJS.enc.Utf8);
    if (!jsonStr) {
      throw new Error('Failed to decrypt payload');
    }
    return JSON.parse(jsonStr);
  }
}
