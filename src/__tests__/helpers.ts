import request from 'supertest';
import type { Application } from 'express';
import { signToken } from '../lib/jwt';

/**
 * Returns a JWT token for the given user/outlet pair.
 */
export function getAuthToken(userId: string, outletId: string): string {
  return signToken({ userId, outletId });
}

/**
 * Returns the base supertest request bound to the Express app.
 */
export function apiRequest(app: Application) {
  return request(app);
}
