import { z } from 'zod';

export const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Username harus diisi')
    .max(50, 'Username maksimal 50 karakter'),
  password: z
    .string()
    .min(6, 'Password minimal 6 karakter')
    .max(128, 'Password maksimal 128 karakter'),
});

export const loginSchema = z.object({
  username: z.string().min(1, 'Username harus diisi'),
  password: z.string().min(1, 'Password harus diisi'),
});
