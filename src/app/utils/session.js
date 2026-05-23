import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

export function encryptSession(data, secret) {
  if (!secret) throw new Error('Missing SESSION_SECRET');
  
  // Create a 32-byte key from the secret
  const key = crypto.scryptSync(secret, 'salt', 32);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptSession(text, secret) {
  if (!text || !secret) return null;
  
  try {
    const key = crypto.scryptSync(secret, 'salt', 32);
    const [ivHex, encryptedHex] = text.split(':');
    if (!ivHex || !encryptedHex) return null;
    
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (err) {
    console.error('[Session Decrypt Error]:', err.message);
    return null;
  }
}
