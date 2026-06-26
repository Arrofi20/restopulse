// RestoPulse Lighthouse Performance Audit (D-44)
//
// Purpose: Audit frontend performance of all 4 owner-facing pages
//          under simulated 4G conditions (DevTools throttling).
//
// D-48: Pages audited — login, dashboard, e-report, data-entry
//       (all owner-facing SPA pages; admin/injector excluded)
//
// NFR §9.3: Page load ≤4 detik (max 800KB total byte weight)
// NFR §9.1: Dashboard update ≤3 detik
//
// Approach:
//   Uses npx lighthouse CLI via child_process.execSync for each page.
//   All 4 pages share the same SPA bundle — bundle-level metrics
//   (total byte weight ≤800KB) are valid from any page measurement.
//   k6 (Task 1) covers API response times for authenticated endpoints.
//
// Output: JSON + HTML reports in lighthouse/reports/
//         Summary table in lighthouse/reports/summary.md
//
// Prerequisites:
//   1. Frontend Vite dev server:  cd frontend && npm run dev  (port 5173)
//   2. Backend Express server:    npm run dev                 (port 3000)
//   3. Chrome installed           (required by Lighthouse)
//
// Usage:  node lighthouse/audit.mjs

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPORTS_DIR = resolve(__dirname, 'reports');

// ── Ensure reports directory exists ─────────────────────────────────────
if (!existsSync(REPORTS_DIR)) {
  mkdirSync(REPORTS_DIR, { recursive: true });
}

// ── Pages to audit (D-48) ───────────────────────────────────────────────
const PAGES = [
  { name: 'login',      url: 'http://localhost:5173/login' },
  { name: 'dashboard',  url: 'http://localhost:5173/dashboard' },
  { name: 'e-report',   url: 'http://localhost:5173/e-report' },
  { name: 'data-entry', url: 'http://localhost:5173/data-entry' },
];

// ── Server health check ─────────────────────────────────────────────────
console.log('═══ RestoPulse Lighthouse Performance Audit ═══\n');
console.log('Checking prerequisites...');

let frontendOk = false;
try {
  const res = await fetch('http://localhost:5173/login');
  frontendOk = res.ok || res.status === 200 || res.status === 304;
  console.log(`  Frontend (port 5173): ${frontendOk ? '✅ RUNNING' : '⚠ UNEXPECTED STATUS ' + res.status}`);
} catch {
  console.warn('  Frontend (port 5173): ❌ NOT RUNNING');
  console.warn('    Start with: cd frontend && npm run dev');
}

let backendOk = false;
try {
  const res = await fetch('http://localhost:3000/health');
  backendOk = res.ok;
  console.log(`  Backend (port 3000):  ${backendOk ? '✅ RUNNING' : '⚠ UNEXPECTED STATUS ' + res.status}`);
} catch {
  console.warn('  Backend (port 3000):  ❌ NOT RUNNING');
  console.warn('    Start with: npm run dev');
}

if (!frontendOk || !backendOk) {
  console.warn('\n⚠ Servers not fully running — audit will fail to reach pages.');
  console.warn('  Bundle-level metrics require the frontend dev server on port 5173.\n');
}

// ── 4G throttling values (Lighthouse "Slow 4G" preset — RESEARCH A5) ───
const THROTTLE_FLAGS = [
  '--throttling-method=devtools',
  '--throttling.requestLatencyMs=150',
  '--throttling.downloadThroughputKbps=1600',
  '--throttling.uploadThroughputKbps=750',
  '--throttling.cpuSlowdownMultiplier=4',
].join(' ');

// ── Sniff: check if Puppeteer is available ──────────────────────────────
let hasPuppeteer = false;
try {
  await import('puppeteer');
  hasPuppeteer = true;
  console.log('  Puppeteer: ✅ available (pre-auth possible)');
} catch {
  console.warn('  Puppeteer: ❌ not available (login-only audit)');
}

console.log('');

// ── Results collection ──────────────────────────────────────────────────
const results = [];
const total = PAGES.length;

for (let i = 0; i < PAGES.length; i++) {
  const page = PAGES[i];
  const reportBase = resolve(REPORTS_DIR, page.name);

  console.log(`━━━ [${i + 1}/${total}] ${page.name} (${page.url}) ━━━`);

  // Build Lighthouse CLI command
  const cmd = [
    'npx',
    'lighthouse',
    page.url,
    `--output=json,html`,
    `--output-path=${reportBase}`,
    '--chrome-flags="--headless=new --disable-gpu --no-sandbox"',
    '--only-categories=performance,accessibility',
    THROTTLE_FLAGS,
    '--quiet',
  ].join(' ');

  try {
    console.log(`  Running Lighthouse...`);
    execSync(cmd, {
      stdio: 'pipe',
      timeout: 180_000,  // 3 minutes per page
      encoding: 'utf-8',
    });

    // Verify the JSON report was created
    const jsonPath = `${reportBase}.report.json`;
    if (existsSync(jsonPath)) {
      try {
        const raw = execSync(`type "${jsonPath}"`, {
          encoding: 'utf-8',
          maxBuffer: 50 * 1024 * 1024,
          windowsHide: true,
        });
        const report = JSON.parse(raw);

        const perf = report.categories?.performance?.score ?? 0;
        const a11y = report.categories?.accessibility?.score ?? 0;
        const audits = report.audits ?? {};

        const fcp  = audits['first-contentful-paint']?.displayValue || '—';
        const lcp  = audits['largest-contentful-paint']?.displayValue || '—';
        const tbt  = audits['total-blocking-time']?.displayValue || '—';
        const cls  = audits['cumulative-layout-shift']?.displayValue || '—';
        const si   = audits['speed-index']?.displayValue || '—';
        const tti  = audits['interactive']?.displayValue || '—';
        const totalBytes = audits['total-byte-weight']?.displayValue || '—';
        const totalBytesRaw = audits['total-byte-weight']?.numericValue || 0;

        results.push({
          name: page.name,
          url: page.url,
          performanceScore: Math.round(perf * 100),
          accessibilityScore: Math.round(a11y * 100),
          fcp, lcp, tbt, cls, si, tti,
          totalBytes,
          totalBytesRaw,
        });

        console.log(`  ✅ Perf: ${Math.round(perf * 100)} | FCP: ${fcp} | LCP: ${lcp} | Total: ${totalBytes}`);
      } catch (parseErr) {
        console.warn(`  ⚠ Could not parse report: ${parseErr.message}`);
        results.push(makeErrorResult(page, `Report parse error: ${parseErr.message}`));
      }
    } else {
      console.warn(`  ⚠ Report file not found: ${jsonPath}`);
      results.push(makeErrorResult(page, 'Report file not found'));
    }
  } catch (runErr) {
    // Known Windows issue: EPERM on temp dir cleanup after the audit succeeds
    const msg = runErr.message || String(runErr);
    if (msg.includes('EPERM') || msg.includes('Permission denied')) {
      console.warn(`  ⚠ Windows EPERM on temp cleanup (audit may have succeeded) — checking for report...`);
      // Check whether the report was actually written before the cleanup error
      const jsonPath = `${reportBase}.report.json`;
      if (existsSync(jsonPath)) {
        try {
          const raw = execSync(`type "${jsonPath}"`, {
            encoding: 'utf-8',
            maxBuffer: 50 * 1024 * 1024,
            windowsHide: true,
          });
          const report = JSON.parse(raw);
          const perf = report.categories?.performance?.score ?? 0;
          const a11y = report.categories?.accessibility?.score ?? 0;
          const audits = report.audits ?? {};

          results.push({
            name: page.name,
            url: page.url,
            performanceScore: Math.round(perf * 100),
            accessibilityScore: Math.round(a11y * 100),
            fcp: audits['first-contentful-paint']?.displayValue || '—',
            lcp: audits['largest-contentful-paint']?.displayValue || '—',
            tbt: audits['total-blocking-time']?.displayValue || '—',
            cls: audits['cumulative-layout-shift']?.displayValue || '—',
            si: audits['speed-index']?.displayValue || '—',
            tti: audits['interactive']?.displayValue || '—',
            totalBytes: audits['total-byte-weight']?.displayValue || '—',
            totalBytesRaw: audits['total-byte-weight']?.numericValue || 0,
          });
          console.log(`  ✅ Perf: ${Math.round(perf * 100)} | FCP: ${results[results.length-1].fcp} | LCP: ${results[results.length-1].lcp} | Total: ${results[results.length-1].totalBytes}`);
        } catch {
          console.warn(`  ⚠ Could not recover report after EPERM`);
          results.push(makeErrorResult(page, 'EPERM on temp cleanup, report unrecoverable'));
        }
      } else {
        console.warn(`  ⚠ No report file found after EPERM`);
        results.push(makeErrorResult(page, `Lighthouse failed: ${msg.substring(0, 200)}`));
      }
    } else if (msg.includes('DNS resolution failed') || msg.includes('ERR_CONNECTION') || msg.includes('ERR_NAME_NOT_RESOLVED')) {
      console.warn(`  ⚠ Connection refused — is the frontend running on port 5173?`);
      results.push(makeErrorResult(page, 'Connection refused — frontend server not running'));
    } else {
      console.warn(`  ❌ Lighthouse error: ${msg.substring(0, 300)}`);
      results.push(makeErrorResult(page, msg.substring(0, 300)));
    }
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────
function makeErrorResult(page, error) {
  return {
    name: page.name,
    url: page.url,
    performanceScore: null,
    accessibilityScore: null,
    fcp: '—', lcp: '—', tbt: '—', cls: '—', si: '—', tti: '—',
    totalBytes: '—',
    totalBytesRaw: 0,
    error,
  };
}

// ── Generate summary.md ─────────────────────────────────────────────────
function generateSummary() {
  let md = '# Lighthouse Performance Audit — RestoPulse\n\n';
  md += `**Generated:** ${new Date().toISOString()}\n\n`;

  md += '## Configuration\n\n';
  md += '- **Tool:** Lighthouse CLI v13.4.0 (Google Chrome)\n';
  md += '- **Throttling:** DevTools — Slow 4G (150ms RTT, 1.6Mbps down, 750Kbps up, 4× CPU slowdown)\n';
  md += '- **Categories:** Performance, Accessibility\n';
  md += '- **Target NFR:** Page load ≤4 detik, total byte weight ≤800KB (OPENCODE.md §9.3)\n';
  md += '- **Target NFR:** API latency ≤500ms @ 50 concurrent (OPENCODE.md §9.4, tested via k6)\n';
  md += `- **Frontend server:** ${frontendOk ? 'Running ✅' : 'Not running ❌'}\n`;
  md += `- **Backend server:** ${backendOk ? 'Running ✅' : 'Not running ❌'}\n`;
  md += `- **Pre-auth:** Puppeteer ${hasPuppeteer ? 'available' : 'not available'}\n\n`;

  // Check if any real reports were gathered
  const anyReal = results.some(r => !r.error && r.performanceScore !== null);
  const anyAccessible = results.some(r => !r.error);

  if (!anyReal && !anyAccessible) {
    md += '## ⚠ No Results Available\n\n';
    md += '**All audit attempts failed.** The most likely cause is that the prerequisite servers are not running.\n\n';
    md += '### To run the audit:\n\n';
    md += '1. Start the backend: `npm run dev` (from project root)\n';
    md += '2. Start the frontend: `cd frontend && npm run dev`\n';
    md += '3. Ensure `testuser` / `testpass123` exists (run dummy-injector if needed)\n';
    md += '4. Run: `node lighthouse/audit.mjs`\n\n';
  } else {
    md += '## Results\n\n';
    md += '| Page | Perf Score | A11y Score | FCP | LCP | TBT | CLS | Speed Index | TTI | Total Weight |\n';
    md += '|------|-----------|-----------|-----|-----|-----|-----|-------------|-----|-------------|\n';

    for (const r of results) {
      const perf = r.performanceScore !== null && !r.error ? `${r.performanceScore}` : (r.error ? 'ERR' : 'N/A');
      const a11y = r.accessibilityScore !== null && !r.error ? `${r.accessibilityScore}` : (r.error ? 'ERR' : 'N/A');
      md += `| ${r.name} | ${perf} | ${a11y} | ${r.fcp} | ${r.lcp} | ${r.tbt} | ${r.cls} | ${r.si} | ${r.tti} | ${r.totalBytes} |\n`;
    }

    md += '\n## NFR Verification\n\n';

    const validByteResult = results.find(r => !r.error && r.totalBytesRaw > 0);
    if (validByteResult) {
      const byteWeightKB = Math.round(validByteResult.totalBytesRaw / 1024);
      const passesWeight = validByteResult.totalBytesRaw <= 800 * 1024;
      md += `- **Total byte weight:** ${validByteResult.totalBytes} (${byteWeightKB}KB) on "${validByteResult.name}" — ${passesWeight ? '✅ ≤800KB NFR §9.3' : '❌ EXCEEDS 800KB NFR §9.3'}\n`;
    } else {
      md += '- **Total byte weight:** Could not determine from available reports (servers may not be running)\n';
    }

    const validPerfResult = results.find(r => !r.error && r.performanceScore !== null);
    if (validPerfResult) {
      md += `- **Performance score:** ${validPerfResult.performanceScore}/100 on "${validPerfResult.name}"\n`;
    }
  }

  md += '\n## Notes\n\n';
  md += '- All 4 pages share the same SPA bundle — bundle-level metrics (byte weight, FCP, LCP) are valid across all pages.\n';
  md += '- Authenticated page API latency is covered by k6 load test (Task 1 of Plan 04-02).\n';
  md += '- Accessibility scores are automated Lighthouse checks only — not comprehensive WCAG AA (see Plan 04-03).\n';
  md += '- Data-entry route may redirect to /dashboard if not yet implemented (Phase 3 scope).\n';

  if (!anyAccessible) {
    md += '\n## Errors Encountered\n\n';
    for (const r of results) {
      if (r.error) {
        md += `- **${r.name}:** ${r.error}\n`;
      }
    }
  }

  return md;
}

const summaryMd = generateSummary();
const summaryPath = resolve(REPORTS_DIR, 'summary.md');
writeFileSync(summaryPath, summaryMd, 'utf-8');
console.log(`\n✅ Summary written to: ${summaryPath}`);

// ── Print results table ─────────────────────────────────────────────────
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('  LIGHTHOUSE AUDIT SUMMARY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
for (const r of results) {
  if (r.error) {
    console.log(`  ${r.name.padEnd(14)} ❌ ${r.error.substring(0, 80)}`);
  } else {
    console.log(`  ${r.name.padEnd(14)} Perf: ${String(r.performanceScore).padStart(3)}  LCP: ${r.lcp}  Total: ${r.totalBytes}`);
  }
}
console.log('');
