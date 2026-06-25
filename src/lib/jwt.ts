import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-not-for-production';

export function signToken(payload: { userId: string; outletId: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): { userId: string; outletId: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; outletId: string };
  } catch {
    throw new Error('Invalid token');
  }
}
