import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    globals: true,
    env: {
      JWT_SECRET: 'test-secret-key-for-phase04',
    },
  },
});
