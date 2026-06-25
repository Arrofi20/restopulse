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

app.listen(PORT, () => {
  console.log(`RestoPulse API running on port ${PORT}`);
});
