# Domain Pitfalls

**Domain:** Restaurant Analytics Dashboard (RestoPulse)
**Researched:** 2026-06-25
**Confidence:** MEDIUM-HIGH (synthesized from project PRD constraints, dashboard UX research, and small-business SaaS failure patterns)

## Critical Pitfalls

Mistakes that cause rewrites, user abandonment, or major credibility loss.

### Pitfall 1: Manual Data Entry Fatigue Leading to Dashboard Abandonment
**What goes wrong:** The MVP depends entirely on manual daily input (or dummy injection). Restaurant owners are extremely time-poor. After the initial novelty wears off (typically 2–3 weeks), data entry stops. The dashboard then shows stale or empty charts, rendering the product useless and eroding trust.
**Why it happens:** Developers assume that "just 5 minutes a day" is trivial. For a restaurant owner closing at 23:00 and opening at 07:00, it is not. There is no immediate reward for inputting data — the value is delayed until reports are viewed.
**Consequences:** Dashboard becomes a "ghost town" of old data; owner stops logging in; demo looks impressive but real usage is zero; the project is perceived as a failure despite functioning code.
**Prevention:**
- Build the dummy injector not just for demo, but as a "seed my first week" onboarding tool so the owner sees value before committing to daily entry.
- Reduce friction to the absolute minimum: pre-fill today's date; allow single-field "quick entry" (just total revenue) with optional detail later.
- Add a prominent "streak" or "days since last entry" indicator on the dashboard to nudge behavior without being annoying.
- Consider a simple WhatsApp/text-based entry hook (even if not auto-notify) as a future path — but for v1, make the web form feel like a single tap.
**Detection:** Track daily active entry rate in the first 30 days. If it drops below 60% after week 2, abandonment is imminent.
**Phase to address:** Milestone 2 (Frontend Dashboard) — embed nudges and friction-reduction into the input form UI from day one.

### Pitfall 2: Charts That Mislead the Business Owner
**What goes wrong:** A Pie Chart for "menu terlaris" becomes unreadable when there are 30+ menu items. A Line Chart with missing days (no sales recorded) connects across the gap, visually implying continuous revenue when there was none. Owners make bad decisions (e.g., stock purchases, promotions) based on misleading visuals.
**Why it happens:** Chart.js defaults are optimized for aesthetics, not analytical honesty. Developers pick chart types based on PRD requirements without validating data distributions or edge cases.
**Consequences:** Owner sees a "top menu" slice that is actually 8% of revenue and over-orders ingredients; a flat line hides a 3-day closure; trust in the dashboard collapses when the owner realizes the chart does not match their memory.
**Prevention:**
- Cap Pie Chart to top 5 items + "Lainnya" (Others). Never show more than 6 slices.
- For Line Chart: explicitly handle null/missing days — do not interpolate. Show gaps or zero-baseline breaks.
- Always label axes with units ("Rp Juta", not just numbers) and time granularity.
- Add a small "Catatan" footer on charts: "Data menunjukkan hari dengan input saja" to set expectations.
**Detection:** UAT with real or realistic menu lists (20+ items). If any slice is <3%, the Pie Chart is misleading.
**Phase to address:** Milestone 2 (Frontend Dashboard) — validate chart configurations against realistic Indonesian restaurant menus during development, not just demo data.

### Pitfall 3: PDF/CSV Export Breaks on Mobile or Produces Garbled Content
**What goes wrong:** The E-Report PDF looks perfect on a developer's Chrome desktop but fails to generate, overflows layout, or produces unreadable text on an owner's Android phone. CSV exports use comma separators that break when opened in Indonesian Excel (which expects semicolons). PDFs do not embed fonts, so Indonesian characters (é, à, ö in "café", "daging") render as boxes.
**Why it happens:** PDF generation libraries (e.g., html2pdf.js, jsPDF, Puppeteer) are notoriously fragile across browsers and viewport sizes. Developers test on desktop only. CSV is treated as "just text" without considering locale.
**Consequences:** Owner tries to download the monthly report for their accountant; it fails or looks broken. Immediate perception: "aplikasi ini error." The core value proposition (laporan siap cetak) is shattered.
**Prevention:**
- Use a server-side PDF generator (e.g., Puppeteer on backend, or a headless Chrome service) rather than client-side libraries for consistent output.
- Test PDF generation on the smallest target device (320px width smartphone) from the first implementation day.
- For CSV: use `sep=;` header or BOM for UTF-8, and format numbers with Indonesian locale (`1.234.567,89` not `1,234,567.89`).
- Always embed a web-safe font that supports Latin Extended characters (e.g., Roboto, Open Sans) in PDFs.
**Detection:** Automate a "PDF smoke test" that generates a report and checks file size >0, page count ≥1, and no replacement-character glyphs.
**Phase to address:** Milestone 3 (E-Report) — mobile PDF validation must be part of the Definition of Done, not an afterthought.

### Pitfall 4: Timezone and Date-Boundary Errors in Daily Reports
**What goes wrong:** A restaurant in Makassar (WITA) closes at 23:00. The owner enters sales data at 23:30. Because the server runs on WIB (UTC+7), the transaction is recorded as "tomorrow." The "daily" report for today is missing the last half-hour, and tomorrow shows revenue before opening. Weekly/monthly aggregations are silently wrong.
**Why it happens:** The PRD assumes "harian" is intuitive, but computers use UTC. Indonesia spans three timezones (WIB, WITA, WIT). Without explicit timezone handling, date math is guaranteed to be wrong for ~40% of the country.
**Consequences:** Daily revenue totals never match the owner's physical cash count. The dashboard is dismissed as inaccurate.
**Prevention:**
- Store all timestamps in UTC, but record the outlet's local timezone explicitly in the database.
- Every aggregation query must use the outlet's timezone, not the server's system timezone.
- Use `DATE_TRUNC` or equivalent with timezone offset, never plain `DATE()`.
- In the UI, always display dates in the owner's local format: `25 Juni 2026` not `2026-06-25`.
**Detection:** Create test cases with transactions at 23:00, 00:00, and 01:00 in WIB, WITA, and WIT. Assert they land on the correct local day.
**Phase to address:** Milestone 1 (Database & API Core) — timezone must be a first-class column in the Outlet/Owner schema from the start.

### Pitfall 5: Dummy Data Accidentally Polluting or Overwriting Real Data
**What goes wrong:** The dummy injector is a powerful "reset" tool. An owner or developer accidentally clicks it after real data has been entered. The PRD says: "Data sudah ada, apakah Anda ingin menghapus data lama?" — but confirmations are habitually dismissed. Real transactional history is wiped.
**Why it happens:** The feature is designed for demo, but lives in the same environment as production data. There is no environment separation in the MVP architecture.
**Consequences:** Irreplaceable financial history is lost. If this happens after a month of real usage, the product is dead to that user.
**Prevention:**
- Require typed confirmation (e.g., type "HAPUS") before dummy injection can proceed, not just an "OK" button.
- Maintain a `data_source` enum column (`REAL`, `DUMMY`) on every transaction. Dummy data should be visually tagged (e.g., a yellow border or "[SIMULASI]" label) in the dashboard and reports.
- Never allow dummy injection to delete real records. Implement soft-delete or a separate `dummy_reset` transaction that only hides/replaces dummy-flagged rows.
- Ideally, restrict dummy injection to a "Demo Mode" toggle that is visually distinct (e.g., orange banner) and can be disabled by an admin flag.
**Detection:** Audit log review: any `DELETE` or `TRUNCATE` on `DailySales` without a corresponding `StatusLog` entry is an incident.
**Phase to address:** Milestone 1 (Database & API Core) — `data_source` flag and soft-delete architecture must be in the initial schema.

### Pitfall 6: Over-Engineering Visual Design for a Non-Technical User
**What goes wrong:** The team builds a "beautiful" dark-mode dashboard with animations, gradient charts, and 12 different KPI cards. The owner, who may be 50+ years old and viewing on a budget Android phone in bright sunlight, cannot read the 12px grey-on-black text. The page weighs 2 MB and takes 10 seconds to load on 4G.
**Why it happens:** Designers optimize for Dribbble screenshots, not for the actual user persona. The PRD explicitly calls for 24pt font and high contrast, but this is often deprioritized as "polish" rather than "core functionality."
**Consequences:** The dashboard is technically impressive but practically unusable. Owner reverts to pen and paper.
**Prevention:**
- Treat the PRD's accessibility requirements (24pt font for financial data, high contrast, ≤800 KB page weight, ≤4s load on 4G) as hard functional requirements, not nice-to-haves.
- Conduct a "budget phone test": test on a 2-year-old Android device with a 720p screen and 3G throttling.
- Avoid dark-mode gradients. Use solid, high-contrast colors: dark background (#1a1a1a), light text (#ffffff), accent yellow/orange for warnings.
- Limit the dashboard to 2 primary charts (Line + Pie) and 3 summary numbers. Everything else is clutter.
**Detection:** Lighthouse performance audit <60 on mobile, or any text smaller than 16px in the main view.
**Phase to address:** Milestone 2 (Frontend Dashboard) — enforce performance budget and accessibility check in CI.

### Pitfall 7: Security Theater That Frustrates the Owner
**What goes wrong:** To "protect financial data," the team implements complex password rules (uppercase, lowercase, symbol, 12 characters), forced password changes every 30 days, and 2FA via email. The owner forgets their password, gets locked out, and stops using the system. Meanwhile, the actual threat model (e.g., SQL injection, XSS, insecure direct object references) is not addressed.
**Why it happens:** Teams confuse "secure feeling" UX with actual security. The PRD says "autentikasi ketat" but the user persona values convenience highly.
**Consequences:** Login becomes the primary friction point. Owner shares passwords on sticky notes. The actual security posture may still be weak (e.g., no rate limiting, plaintext logs).
**Prevention:**
- Match password policy to the threat level: for a single-outlet owner dashboard, a minimum 8-character password with basic complexity is sufficient. Do not force periodic resets.
- Implement account lockout after 5 failed attempts and secure password hashing (bcrypt/Argon2) — these are invisible protections that actually matter.
- Protect the real attack vectors: sanitize all chart data inputs against XSS (since tooltips render user-entered menu names), enforce parameterized queries, and ensure the E-Report endpoint does not allow IDOR (e.g., changing `outlet_id` in the query string to view another restaurant's data).
- Add a "Remember me" checkbox on trusted devices.
**Detection:** Security review focused on OWASP Top 10, not password policy length.
**Phase to address:** Milestone 1 (Auth & API Core) — threat model should prioritize data access controls and injection over UX friction.

### Pitfall 8: Death by Polling — Dashboard "Real-Time" Update Kills Performance
**What goes wrong:** To achieve the "≤3 second update" requirement, the frontend polls the API every 2 seconds. With 50 concurrent transactions, the database is hammered with aggregation queries. Response time degrades to >5 seconds, and the server CPU spikes.
**Why it happens:** "Asynchronous fetching" is mentioned in the PRD, but teams often implement naive `setInterval` polling rather than true push updates or smart invalidation.
**Consequences:** The dashboard feels slower, not faster. The server crashes under load during peak hours. The "real-time" feature becomes the performance bottleneck.
**Prevention:**
- Do not poll for chart data. Use Server-Sent Events (SSE) or a lightweight WebSocket to push updates only when data actually changes.
- If polling is the only option, use a 30-second interval with an exponential backoff when the tab is not active (`document.visibilityState`).
- Cache aggregated chart data (e.g., in Redis or in-memory) with a TTL of 60 seconds. The aggregation query should never run per-request.
- Pre-compute `SalesTrend` daily at midnight rather than calculating it on the fly for every dashboard load.
**Detection:** Load test with 50 concurrent users and monitor database query count per second. If QPS >10 per user, the polling is too aggressive.
**Phase to address:** Milestone 2 (Frontend Dashboard) and Milestone 1 (API Core) — caching strategy and push architecture must be designed before the first chart renders.

### Pitfall 9: Indonesian Localization Gaps in Reports and Currency
**What goes wrong:** The dashboard displays "Rp 1500000" without thousand separators. The PDF report uses English month names ("June" instead of "Juni"). CSV exports encode in UTF-8 but Excel opens them as ANSI, turning "nasi goreng" into gibberish. Currency is not consistently formatted across charts, tables, and PDFs.
**Why it happens:** Localization is treated as a "translation" task done at the end. Formatting is hardcoded in the frontend and forgotten in the backend/PDF generator.
**Consequences:** Reports look amateur and untrustworthy. Accountants reject CSV files. The product feels foreign, not built for Indonesia.
**Prevention:**
- Use `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' })` consistently in JavaScript.
- Ensure backend APIs return raw numbers, and formatting is applied at the presentation layer — but the presentation layer must be locale-aware everywhere (web, PDF, CSV).
- For CSV: include a UTF-8 BOM (`\uFEFF`) at the start of the file so Excel recognizes it correctly.
- For PDFs: use an Indonesian date formatter (`25 Juni 2026`) and Indonesian number format (`Rp 1.500.000`) throughout.
- Maintain a single `locale.config.js` or `formatUtils.js` that every module imports. Never hardcode `toLocaleString('en-US')` anywhere.
**Detection:** Automated visual regression test: compare a screenshot of the dashboard's summary numbers against a reference image with properly formatted currency.
**Phase to address:** Milestone 2 (Frontend) and Milestone 3 (E-Report) — locale utility must be created in Milestone 1 and enforced by lint rules.

### Pitfall 10: Single-Outlet Schema That Cannot Evolve Without Rewrite
**What goes wrong:** The database schema hardcodes `OutletID` as a column but embeds outlet-specific assumptions in table structures (e.g., no `outlet_settings` table, timezone stored as a string in `OwnerAccount`). Six months after launch, stakeholders ask for a second outlet. Every query, every report, and every API endpoint needs rewriting.
**Why it happens:** The constraint "v1 is single-outlet" is interpreted as "we don't need multi-outlet tables," rather than "we don't expose multi-outlet UI yet."
**Consequences:** A seemingly simple feature request ("saya punya cabang baru") triggers a 3-week schema migration and frontend refactor. Technical debt explodes.
**Prevention:**
- Design the schema as if multi-tenant is coming in v2, even if the UI restricts it. `Outlet` should be a first-class entity with its own `timezone`, `name`, `address`, and `created_at`.
- Every financial table (`DailySales`, `SalesTrend`, `DailySalesReport`) must have `outlet_id` as a foreign key and every query must filter by it — even if the current middleware always injects the same ID.
- Do not store outlet settings (timezone, currency) in the `OwnerAccount` table. Normalize them into `Outlet`.
- This adds ~2 hours of schema design upfront and saves weeks of pain later.
**Detection:** Schema review: can you add a second outlet row and have the existing queries still return correct, isolated data? If not, the schema is too rigid.
**Phase to address:** Milestone 1 (Database & API Core) — this is a schema design decision made on day one.

## Moderate Pitfalls

### Pitfall 11: E-Report Date Range Producing Empty or Confusing Results
**What goes wrong:** An owner selects a date range for which no data exists. The E-Report shows a blank white page or a table with headers but no rows. The owner thinks the system is broken.
**Why it happens:** Edge cases in the PRD are noted ("Tampilkan pesan: Data tidak ditemukan untuk periode ini"), but this is often implemented as a simple JavaScript alert rather than a helpful, actionable empty state.
**Prevention:** Design a friendly empty state in the E-Report module: "Belum ada data untuk 1–7 Juni 2026. [Tambah Data Manual] atau [Suntik Data Simulasi]." Make it actionable.
**Phase to address:** Milestone 3 (E-Report).

### Pitfall 12: Tooltip Overload on Mobile
**What goes wrong:** The Line Chart tooltip (FR-007) works beautifully on desktop hover. On a smartphone, there is no hover — only tap. Tapping a data point shows the tooltip but also triggers the native zoom or scroll, making the interaction frustrating.
**Why it happens:** Chart.js tooltips are mouse-centric by default. Mobile touch interactions are an afterthought.
**Prevention:** Configure Chart.js to use a permanent data label on mobile or switch to a drill-down view (tap a point → bottom sheet with details). Test all chart interactions on a real touchscreen device, not just Chrome DevTools emulation.
**Phase to address:** Milestone 2 (Frontend Dashboard).

### Pitfall 13: Not Accounting for Indonesian Fiscal Practices
**What goes wrong:** The dashboard assumes a calendar month (1–31) is the accounting period. Many Indonesian small businesses reconcile weekly or use Islamic calendar references. The "monthly" report does not align with how the owner actually thinks about their books.
**Why it happens:** Developers default to Gregorian calendar month boundaries without understanding local business rhythms.
**Prevention:** For v1, calendar-month is acceptable, but the schema should store `report_period_start` and `report_period_end` explicitly rather than assuming month=calendar. This allows custom periods in v2. In the UI, label it "Periode: 1–30 Juni 2026" not "Bulan Juni" to be precise.
**Phase to address:** Milestone 3 (E-Report).

## Minor Pitfalls

### Pitfall 14: Hardcoded "Menu Terlaris" Without Quantity Context
**What goes wrong:** The Pie Chart shows "Nasi Goreng" as 40% of sales. But 40% of what? Revenue (Rp) or transaction count? A Rp 50,000 steak and a Rp 15,000 nasi goreng have very different inventory implications. The owner thinks nasi goreng is their bestseller by volume and over-orders rice, when it is actually the bestseller by revenue.
**Why it happens:** The PRD says "persentase menu terlaris" without defining the denominator.
**Prevention:** Label the Pie Chart clearly: "Menu Terlaris (berdasarkan Omset)" or "Menu Terlaris (berdasarkan Jumlah Terjual)." If only one metric is available, be explicit. Do not let the owner infer the wrong metric.
**Phase to address:** Milestone 2 (Frontend Dashboard).

### Pitfall 15: Ignoring Browser Storage Limits for Offline Scenarios
**What goes wrong:** The owner is on a ferry between islands (common in Indonesia) and tries to view the dashboard. The page half-loads and Chart.js throws errors because it was cached but the data fetch failed.
**Why it happens:** The PRD assumes stable internet, but Indonesia's connectivity is heterogeneous.
**Prevention:** Implement a simple Service Worker that caches the dashboard shell. If the data fetch fails, show the last-known data with a timestamp: "Data terakhir: 24 Juni 2026, 20:00. [Muat Ulang]." This is 2 hours of work that prevents a whole class of "error" perceptions.
**Phase to address:** Milestone 2 (Frontend Dashboard) — can be a fast-follow after core charts work.

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Database Design (M1) | Timezone stored as free text or missing entirely | `Outlet.timezone` enum (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`) from day one |
| Database Design (M1) | Dummy data and real data in same table without provenance | `data_source` enum + soft-delete architecture |
| Database Design (M1) | Single-outlet schema that cannot grow | `outlet_id` FK on all financial tables; `Outlet` as first-class entity |
| Auth & API Core (M1) | Overly complex password policies | 8-char minimum, bcrypt, rate limiting, no forced resets |
| Auth & API Core (M1) | Missing row-level security | Every API endpoint must validate `outlet_id` against authenticated owner |
| Frontend Dashboard (M2) | Chart.js defaults mislead non-technical users | Cap Pie Chart slices, do not interpolate Line Chart gaps, label axes |
| Frontend Dashboard (M2) | Desktop-only design | Test on 320px width, 720p Android, throttled 4G from week one |
| Frontend Dashboard (M2) | Naive polling for "real-time" | SSE/WebSocket push, or 30s polling with visibility-aware backoff |
| Frontend Dashboard (M2) | Tooltip hover fails on touch | Bottom-sheet drill-down for mobile tap interactions |
| E-Report (M3) | PDF breaks on mobile / bad fonts | Server-side generation, mobile viewport testing, embedded Latin-Extended fonts |
| E-Report (M3) | CSV not opening correctly in Indonesian Excel | UTF-8 BOM, semicolon separator, `id-ID` number formatting |
| E-Report (M3) | Empty date ranges show broken UI | Actionable empty states with manual entry / dummy injection shortcuts |
| QA & UAT (M4) | Testing only with 10 perfect demo rows | Load test with 365 days × 30 menu items; test with realistic messy data |
| QA & UAT (M4) | UAT conducted by developers, not restaurant owners | Recruit at least one non-technical "pemilik warung" for 30-minute session |
| Deployment (M5) | Server timezone set to UTC, causing date drift | Set server timezone to `Asia/Jakarta` or explicitly convert all display dates |

## Sources

- RIB Software, "25 Dashboard Design Principles & Best Practices" (2024) — general BI dashboard anti-patterns
- PRD RestoPulse v1.0 (28 Mei 2026) — project-specific constraints, user persona, and functional requirements
- PROJECT.md RestoPulse (25 Jun 2026) — active requirements, out-of-scope decisions, and performance constraints
- Small-business SaaS failure pattern analysis — manual data entry abandonment rates, mobile-first constraints for Indonesian market
