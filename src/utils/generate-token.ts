import { randomBytes } from 'node:crypto';

export function generateToken() {
  return randomBytes(64).toString('hex');
}
