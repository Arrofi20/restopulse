import { app } from './app';

const PORT = process.env.PORT || 3000;

if (
  !process.env.JWT_SECRET ||
  process.env.JWT_SECRET === 'fallback-secret-not-for-production'
) {
  console.warn(
    'WARNING: JWT_SECRET is not properly configured. Set a strong secret in .env'
  );
}

if (!process.env.DATABASE_URL) {
  console.warn(
    'WARNING: DATABASE_URL is not set. Set it in .env (e.g., file:./prisma/dev.db for local dev)'
  );
}

const validDbProviders = ['sqlite', 'postgresql'];
if (
  !process.env.DB_PROVIDER ||
  !validDbProviders.includes(process.env.DB_PROVIDER)
) {
  console.warn(
    'WARNING: DB_PROVIDER is not set or is invalid. Must be "sqlite" or "postgresql"'
  );
}

app.listen(PORT, () => {
  console.log(`RestoPulse API running on port ${PORT}`);
});
