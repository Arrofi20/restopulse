// Vitest global setup — imported once before every test file.
//
// Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
// and exposes them via the global expect. jsdom provides the DOM
// environment (configured in vite.config.ts `test.environment`).

import '@testing-library/jest-dom/vitest';
