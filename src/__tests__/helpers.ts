import request from 'supertest';
import { app } from '../app';
import { signToken } from '../lib/jwt';

export function authRequest(userId: string, outletId: string) {
  const token = signToken({ userId, outletId });
  return request(app).set('Authorization', `Bearer ${token}`);
}

export function apiRequest() {
  return request(app);
}
