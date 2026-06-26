// RestoPulse — Lighthouse Puppeteer Pre-Auth Script
//
// Purpose: Authenticate a headless Chrome browser so that Lighthouse
//          can audit protected SPA pages (dashboard, e-report, data-entry).
//
// Usage (standalone auth verification):
//   node lighthouse/auth-setup.mjs
//
// Integration with programmatic Lighthouse:
//   - Import launchAuthenticatedBrowser() in audit scripts
//   - Pass the returned browser + page to Lighthouse programmatic API
//
// Auth flow:
//   1. Launch headless Chrome
//   2. Navigate to /login
//   3. Fill credentials (testuser / testpass123)
//   4. Click "Masuk" button
//   5. Wait for redirect to /dashboard
//   6. Return the authenticated page
//
// Prerequisites:
//   - Backend running on http://localhost:3000 (for auth API)
//   - Frontend running on http://localhost:5173
//   - testuser/testpass123 exists in database

import puppeteer from 'puppeteer';

const FRONTEND_URL = 'http://localhost:5173';
const BACKEND_URL = 'http://localhost:3000';
const CREDENTIALS = {
  username: 'testuser',
  password: 'testpass123',
};

/**
 * Launch a headless Chrome browser, authenticate via the login page,
 * and return the Puppeteer browser + page instances.
 *
 * The returned page is at /dashboard and has a valid JWT in localStorage.
 */
export async function launchAuthenticatedBrowser() {
  console.log('Launching headless Chrome...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    // Step 1: Navigate to login page
    console.log(`Navigating to ${FRONTEND_URL}/login ...`);
    await page.goto(`${FRONTEND_URL}/login`, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    // Step 2: Fill in credentials
    console.log('Filling credentials...');

    // Try multiple selectors for the username field
    const usernameInput = await page.waitForSelector(
      'input[name="username"], input[type="text"], #username',
      { timeout: 10000 }
    );
    await usernameInput.click({ clickCount: 3 }); // Select all
    await usernameInput.type(CREDENTIALS.username);

    // Try multiple selectors for the password field
    const passwordInput = await page.waitForSelector(
      'input[name="password"], input[type="password"], #password',
      { timeout: 5000 }
    );
    await passwordInput.click({ clickCount: 3 });
    await passwordInput.type(CREDENTIALS.password);

    // Step 3: Click submit button
    console.log('Submitting login form...');
    const submitButton = await page.waitForSelector(
      'button[type="submit"], button:has-text("Masuk"), input[type="submit"]',
      { timeout: 5000 }
    );
    await submitButton.click();

    // Step 4: Wait for redirect to /dashboard
    console.log('Waiting for redirect to /dashboard...');
    await page.waitForURL(
      (url) => url.pathname === '/dashboard' || url.pathname === '/',
      { timeout: 15000 }
    );

    // Wait for dashboard content to load
    await page.waitForTimeout(2000);

    // Verify localStorage has the token
    const hasToken = await page.evaluate(() => {
      return localStorage.getItem('restopulse_token') !== null;
    });

    if (hasToken) {
      console.log('✅ Authentication successful — JWT in localStorage');
    } else {
      console.warn('⚠ JWT not found in localStorage after login');
    }

    console.log(`Current URL: ${page.url()}`);
    return { browser, page };
  } catch (err) {
    console.error('❌ Authentication failed:', err.message);
    await browser.close();
    throw err;
  }
}

/**
 * Standalone test: authenticate and print dashboard title.
 */
async function main() {
  console.log('═══ RestoPulse Puppeteer Pre-Auth Test ═══\n');

  try {
    const { browser, page } = await launchAuthenticatedBrowser();

    const pageTitle = await page.title();
    console.log(`\n📄 Dashboard page title: "${pageTitle}"`);

    // Check for dashboard content
    const hasDashboard = await page.evaluate(() => {
      return document.body.innerText.includes('Dasbor') ||
             document.body.innerText.includes('Dashboard') ||
             document.body.innerText.includes('Omset') ||
             document.querySelector('canvas') !== null;
    });

    console.log(`Dashboard content detected: ${hasDashboard ? '✅' : '⚠'}`);
    console.log('\n✅ Puppeteer pre-auth works! Authenticated browser ready for Lighthouse.');

    await browser.close();
  } catch (err) {
    console.error('\n❌ Auth setup test failed:', err.message);
    console.error('   Is the frontend running on port 5173?');
    console.error('   Is the backend running on port 3000?');
    console.error('   Does testuser/testpass123 exist?');
    process.exit(1);
  }
}

// Allow import OR direct execution
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('auth-setup.mjs') ||
  process.argv[1] === import.meta.url?.replace('file:///', '')
);

if (isMainModule) {
  main();
}
