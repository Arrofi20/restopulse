---
phase: 4
slug: quality-assurance
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-26
---

# Phase 4 — UI Design Contract (Audit & Verification)

> **Phase type:** Quality Assurance — this contract documents the EXISTING UI for audit and verification purposes. No new UI is designed or built in Phase 4. The contract captures what the UI IS (as implemented in Phases 2–3) and what auditors must verify against.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — plain Tailwind CSS v4 |
| Preset | not applicable |
| Component library | none — all components hand-rolled with Tailwind utility classes |
| Icon library | Emoji characters (📊, 📄, 🚪, ☰, ×) — no icon library |
| Font | System font stack (Tailwind v4 default) |
| Styling approach | `@import "tailwindcss"` with `.dark` class variant |
| Build tool | Vite 8 + `@tailwindcss/vite` plugin |

**Source:** Codebase detection — no `components.json`, no `tailwind.config.*` (Tailwind v4 CSS-first config), no shadcn/ui dependency in `frontend/package.json`.

---

## Spacing Scale

**Observed in codebase (Tailwind v4 default scale):**

| Token | Tailwind Class | Value | Usage | Audit Check |
|-------|---------------|-------|-------|-------------|
| xs | `p-1`, `gap-1` | 4px | Compact icon padding | Verify ≥44px touch targets still met where applicable |
| sm | `p-1.5`, `py-1.5`, `gap-2` | 6px–8px | Button compact padding, preset button gaps | Verify preset buttons ≥44px touch target at 320px |
| md | `p-3`, `px-3`, `py-3`, `gap-3` | 12px | Table cell padding, sidebar nav items | — |
| lg | `p-4`, `px-4`, `gap-4`, `p-5` | 16px–20px | Page content padding, card padding, section gaps | Verify left/right padding does not collapse below 16px on mobile |
| xl | `p-6`, `lg:p-6` | 24px | Section bottom margins (mb-6) | — |
| 2xl | `py-16` | 64px | EmptyState vertical padding | — |
| touch target | Button: `px-3 py-1.5` (DateFilter), `px-4 py-2` (ExportButtons, Login CTA) | varies | — | **All interactive elements must be ≥44px in at least one dimension (WCAG AA practical subset per D-47).** ExportButtons on mobile (w-full) satisfy this. Sidebar nav items (py-2.5 = 10px vertical) must be verified at 320px. |

**Responsive spacing adjustments:**
- Main content: `p-4` mobile → `lg:p-6` desktop
- Chart grid: `grid-cols-1` mobile → stacked layout
- Export buttons: `flex-col gap-2` mobile → `sm:flex-row sm:justify-end` desktop

**Exceptions:** None declared. Audit must verify no interactive element falls below 44px touch target at 320px viewport.

---

## Typography

**Observed in codebase:**

| Role | Tailwind Class | Computed Size | Weight | Line Height | Usage |
|------|---------------|---------------|--------|-------------|-------|
| Body | `text-base` | 16px | 400 (default) | 1.5 (default) | Sidebar nav items, general body text |
| Label | `text-sm` | 14px | 400–500 | 1.25 (default) | Card labels ("Total Omset"), table headers, form labels, input text |
| Heading | `text-lg` | 18px | 600 (semibold) | 1.2 (default) | Header outlet name, sidebar brand |
| Heading | `text-3xl` | ~30px | 700 (bold) | 1.2 (default) | Login page title ("RestoPulse"), card financial values |
| Display | `text-3xl font-bold` | ~30px | 700 (bold) | 1.2 (default) | SummaryCards revenue value (amber-400), transaction count (white) |

**Financial data font minimum (OPENCODE.md §5):** `text-3xl` (~30px) — satisfies the 24pt minimum requirement for financial data display. **Audit must verify all financial figures (revenue amounts, transaction counts) render at ≥24pt on all viewports.**

**Font scaling audit (D-47):**
- Verify text remains readable at 200% browser zoom without horizontal scroll
- Verify no `font-size` values below 14px (Tailwind `text-xs` or smaller) in any user-facing text
- Verify financial figures do NOT use `text-sm` or smaller

**Weight audit:**
- Only two weights observed: 400 (default, font-medium) and 700 (bold, font-semibold)
- `font-semibold` used on header outlet name (text-lg) and Login CTA button
- `font-bold` used on financial numbers (text-3xl) and Login page title
- `font-medium` used on DateFilter preset buttons (text-sm) and table headers (text-sm)

---

## Color

**Observed in codebase — Dark theme contract:**

| Role | Tailwind Token | Hex (approx) | Usage | Contrast Check Required |
|------|---------------|--------------|-------|------------------------|
| Dominant (60%) | `bg-gray-950` | `#030712` | Page background, sidebar background | — |
| Dominant (60%) | `bg-gray-900` | `#111827` | Header, sidebar, cards, table, login card | — |
| Secondary (30%) | `bg-gray-800` | `#1f2937` | Card borders, table headers, form inputs, hover states | — |
| Secondary (30%) | `bg-gray-700` | `#374151` | Inactive buttons, border-gray-700, disabled states | — |
| Accent (10%) | `bg-amber-400` / `text-amber-400` | `#fbbf24` | Active preset buttons, revenue values, brand name, Chart.js line, focus rings, Login CTA | ✅ Must verify ≥4.5:1 contrast against gray-950/gray-900 backgrounds |
| Accent (10%) | `bg-amber-500` | `#f59e0b` | Login CTA button, EmptyState CTA button | ✅ Must verify ≥4.5:1 contrast against gray-900 background |
| Destructive | `bg-red-950/50` / `text-red-400` | `#f87171` on `#450a0a` | Login error messages | ✅ Must verify ≥4.5:1 contrast |
| Decline | `#ef4444` (CHART_COLORS.decline) | `#ef4444` | LineChart decline point markers (red-500) | ✅ Must verify ≥3:1 contrast against dark chart background (Chart.js canvas) |
| Text Primary | `text-white` | `#ffffff` | Card values, nav items, body text, table cells | ✅ Excellent contrast against gray-950/gray-900 |
| Text Secondary | `text-gray-300` | `#d1d5db` | Labels, header username, form labels | ✅ Must verify ≥4.5:1 contrast against gray-900 |
| Text Tertiary | `text-gray-400` | `#9ca3af` | Empty state sub-message, sidebar inactive nav | ✅ Must verify ≥4.5:1 contrast against gray-950/gray-900 |
| Text Muted | `text-gray-500` | `#6b7280` | Date range separator, placeholder text | ✅ Must verify ≥4.5:1 contrast against gray-800 |
| Chart Colors | `CHART_COLORS` (JS constants) | See `chartConfig.ts` | Chart.js canvas elements (line, grid, tooltip) | — |

**Accent (amber-400) reserved for:**
1. Active preset button backgrounds (DateFilter + ReportDateFilter)
2. Revenue values in SummaryCards
3. Chart.js Line Chart — line color + positive point markers
4. Brand name in Sidebar + Login page heading
5. Focus rings on form inputs (`focus:border-amber-400`)
6. Login/submit CTA buttons (amber-500 hover:amber-400)
7. EmptyState CTA button
8. Export PDF button
9. Spinner border
10. Active sidebar nav links

**Accent NOT used for:** CSV export button (gray-700), secondary text, labels, table headers, borders, sidebar inactive nav.

**Decline red (`#ef4444`) reserved for:**
1. LineChart decline point markers (day-over-day revenue drop)
2. (Note: Login error messages use `text-red-400` on `bg-red-950/50`, a slightly different red)

**Audit requirement (D-47):**
- **Color contrast ≥4.5:1 for all text content** (WCAG AA). Verify:
  - `text-gray-400` (#9ca3af) against `bg-gray-950` (#030712): contrast ratio ~11.5:1 ✅
  - `text-gray-400` against `bg-gray-900` (#111827): contrast ratio ~9.8:1 ✅
  - `text-amber-400` (#fbbf24) against `bg-gray-950`: contrast ratio ~13.6:1 ✅
  - `text-amber-400` against `bg-gray-900`: contrast ratio ~11.7:1 ✅
  - `text-red-400` (#f87171) against `bg-red-950/50`: must verify manually
  - `text-black` on amber-400 (active preset buttons): must verify ≥4.5:1
- **Chart.js canvas elements:** Chart grid lines use `rgba(255,255,255,0.1)` — must verify 
-  sufficient visibility against dark chart background.

---

## Copywriting Contract (Audit)

**All copy is in Bahasa Indonesia. Audit must verify these exact strings are used.**

| Element | Source File | Copy (Expected) | Audit Focus |
|---------|------------|-----------------|-------------|
| Brand name | Sidebar.tsx, LoginPage.tsx | `RestoPulse` | Verify appears on login page, sidebar, and implicitly in browser tab title |
| Login tagline | LoginPage.tsx | `Dasbor Analitik Restoran` | Verify appears below brand name on login page |
| Login CTA | LoginPage.tsx | `Masuk` | Verify on login submit button; loading state shows `Memproses...` |
| Login CTA | LoginPage.tsx | `Nama Pengguna` / `Kata Sandi` | Verify form labels |
| Login footer link | LoginPage.tsx | `Belum punya akun? Daftar` | Verify "Daftar" links to /register |
| Login error | LoginPage.tsx | (dynamic — server error message) | Verify error appears in `bg-red-950/50` container with `text-red-400` |
| Sidebar nav — Dasbor | Sidebar.tsx | `Dasbor` | Verify links to /dashboard |
| Sidebar nav — E-Report | Sidebar.tsx | `E-Report` | Verify links to /e-report |
| Sidebar — Logout | Sidebar.tsx | `Keluar` | Verify at bottom of sidebar |
| Header — Logout | Header.tsx | `Keluar` | Verify hidden on mobile (lg:block) |
| DateFilter presets | DateFilter.tsx | `7 Hari`, `30 Hari`, `Bulan Ini`, `Semua` | Verify all four presets rendered |
| DateFilter aria | DateFilter.tsx | `Tanggal mulai` / `Tanggal akhir` | Verify aria-labels on custom date inputs |
| Summary card label 1 | SummaryCards.tsx | `Total Omset` | Verify amber-400 revenue value rendered |
| Summary card label 2 | SummaryCards.tsx | `Jumlah Transaksi` | Verify white transaction count rendered |
| Empty state heading | EmptyState.tsx | `Belum ada data penjualan untuk periode ini` | Verify on dashboard when no data |
| Empty state sub | EmptyState.tsx | `Gunakan formulir input data atau suntik data simulasi untuk memulai.` | Verify gray-500 sub-message |
| Empty state CTA | EmptyState.tsx | `Tambah Data` | Verify button navigates to /data-entry |
| Spinner aria | Spinner.tsx | `Memuat` | Verify `role="status"` + `aria-label="Memuat"` |
| ReportDateFilter presets | ReportDateFilter.tsx | `Harian`, `Mingguan`, `Bulanan` | Verify three presets (no "Semua") + custom date picker |
| Report table headers | ReportDailyTable.tsx | `Tanggal`, `Omset (Rp)`, `Menu Terlaris`, `Jumlah Transaksi` | Verify column order matches |
| Report table empty | ReportDailyTable.tsx | `Tidak ada data untuk periode ini` | Verify centered, gray-400 |
| Export PDF button | ExportButtons.tsx | `Export PDF` | Verify amber-400, disabled when no data |
| Export CSV button | ExportButtons.tsx | `Export CSV` | Verify gray-700, disabled when no data |
| PDF document title | pdfGenerator.ts | `Laporan_{OutletName}_{StartDate}_{EndDate}.pdf` | Verify file naming convention D-29 |
| CSV document title | csvGenerator.ts | `Laporan_{OutletName}_{StartDate}_{EndDate}.csv` | Verify file naming convention D-29 |
| Rupiah formatting | format.ts | `Rp 1.234.567` (thousands separator `.`, no decimals) | **Critical audit:** Verify id-ID locale — comma decimals, dot thousands |
| Compact Rupiah | format.ts | `Rp 12,3 jt` / `Rp 1,2 M` | Verify comma decimal separator (NOT dot) |

---

## Component Inventory & Audit Focus

### Layout Components

| Component | File | Audit Focus |
|-----------|------|-------------|
| **DashboardLayout** | `layout/DashboardLayout.tsx` | h-screen flex, bg-gray-950. Verify no horizontal overflow at 320px. Verify sidebar toggle works. |
| **Sidebar** | `layout/Sidebar.tsx` | Fixed overlay on mobile (translate-x), static w-64 on lg+. Verify: hamburger opens/closes sidebar, backdrop click closes, × button closes, keyboard focus order, brand text "RestoPulse" in amber-400. |
| **Header** | `layout/Header.tsx` | h-16, bg-gray-900, border-b border-gray-800. Verify: hamburger button visible only on mobile (lg:hidden), outlet name text-white, username text-gray-300, logout hidden on mobile (hidden lg:block). |

### Dashboard Components

| Component | File | Audit Focus |
|-----------|------|-------------|
| **DateFilter** | `dashboard/DateFilter.tsx` | 4 preset buttons (7 Hari, 30 Hari, Bulan Ini, Semua) + custom date inputs. Verify: active preset highlighted amber-400 with black text, inactive bg-gray-700, aria-pressed on presets, aria-label on date inputs, date inputs use [color-scheme:dark], layout wraps on mobile. |
| **SummaryCards** | `dashboard/SummaryCards.tsx` | grid-cols-1 on mobile, sm:grid-cols-2. Verify: Total Omset card with amber-400 text-3xl, Jumlah Transaksi card with white text-3xl, loading shimmer (animate-pulse h-8 w-48), border-gray-800, bg-gray-900. |
| **LineChart** | `dashboard/LineChart.tsx` | h-[300px] container. Verify: Chart.js line rendered, amber-400 line color, pointRadius 5 / pointHoverRadius 8, decline points red (day-over-day drop), tooltip shows date + "Rp X" on hover/touch, y-axis ticks use compact Rupiah ("Rp 12,3 jt"), x-axis labels use id-ID date format ("26 Jun 2026"), loading overlay (bg-gray-950/50 + Spinner) does not replace chart, maxRotation 45 on x-axis ticks. |
| **PieChart** | `dashboard/PieChart.tsx` | Verify: top-10 menu items rendered, tooltip shows name + percentage + count + revenue, hover state visible, loading overlay works same as LineChart. |
| **EmptyState** | `dashboard/EmptyState.tsx` | Centered py-16. Verify: 📊 emoji, heading text-lg text-gray-300, sub-message text-sm text-gray-500, "Tambah Data" button amber-500 on amber-400 hover. |
| **Spinner** | `ui/Spinner.tsx` | h-4 w-4, animate-spin, border-2 border-amber-400, border-t-transparent. Verify: role="status", aria-label="Memuat". |
| **RefreshButton** | `ui/RefreshButton.tsx` | Verify: triggers manual dashboard refresh, shows spinner during loading, accessible label. |

### Report Components

| Component | File | Audit Focus |
|-----------|------|-------------|
| **ReportDateFilter** | `report/ReportDateFilter.tsx` | 3 presets (Harian, Mingguan, Bulanan) + custom date picker. Default: Bulanan (current month). Same styling pattern as dashboard DateFilter. |
| **ReportSummaryCards** | `report/ReportSummaryCards.tsx` | Verify: mirrors dashboard SummaryCards pattern; shows total revenue + transaction count for the filtered period + outlet name. |
| **ReportDailyTable** | `report/ReportDailyTable.tsx` | overflow-x-auto wrapper. Verify: 4 columns (Tanggal, Omset (Rp), Menu Terlaris, Jumlah Transaksi), 5 skeleton rows on loading, even:bg-gray-900/50 striping, empty state "Tidak ada data untuk periode ini", text-sm data cells, formatRupiah on revenue column. |
| **ExportButtons** | `report/ExportButtons.tsx` | sticky top-0 z-10, bg-gray-950/95, backdrop-blur-sm. Verify: PDF button amber-400 w-full on mobile (sm:w-auto), CSV button bg-gray-700 w-full on mobile (sm:w-auto), both disabled (opacity-50, cursor-not-allowed) when data is null, flex-col on mobile → sm:flex-row sm:justify-end on desktop. |

### Auth Pages

| Page | File | Audit Focus |
|------|------|-------------|
| **LoginPage** | `pages/LoginPage.tsx` | Centered card, max-w-sm, bg-gray-950 background. Verify: "RestoPulse" text-3xl font-bold text-amber-400, "Dasbor Analitik Restoran" tagline, username/password inputs with border-gray-700 bg-gray-800, focus:border-amber-400 focus:ring-1 focus:ring-amber-400, error bg-red-950/50 text-red-400, submit btn bg-amber-500 hover:bg-amber-400 text-black font-semibold, "Belum punya akun? Daftar" link. Keyboard nav: Tab order Username → Password → Submit → Daftar link. |
| **RegisterPage** | `pages/RegisterPage.tsx` | Same visual pattern as LoginPage. Verify: submit button reads "Daftar", footer link reads "Sudah punya akun? Masuk". |

### Data Entry Page

| Page | File | Audit Focus |
|------|------|-------------|
| **DataEntryPage** | `pages/` (if exists) | Verify: exists at /data-entry route, form with date/revenue/top_menu_items fields, same dark theme styling as other pages, validation error display. **(Note: data entry page may be from Phase 1 — verify it is reachable and functional.)** |

---

## Responsive Breakpoints (Audit)

**Per D-49, audit at all four breakpoints:**

| Breakpoint | Width | Audit Focus |
|------------|-------|-------------|
| Mobile S | 320px | **Primary mobile audit viewport.** Verify: no horizontal overflow on any page, sidebar is overlay (not static), hamburger button visible in header, ExportButtons are full-width stacked, DateFilter presets wrap, chart grids stack vertically, SummaryCards stack (1 column), all touch targets ≥44px, text readable at minimum width. |
| Tablet | 768px | Verify: sidebar still overlay (lg breakpoint is 1024px), charts still stacked, ExportButtons still full-width, DateFilter presets may fit in one row. |
| Desktop | 1024px | Verify: sidebar transitions to static (lg:static lg:translate-x-0), hamburger hidden (lg:hidden), header logout visible (lg:block), ExportButtons sm:flex-row sm:justify-end (640px+), SummaryCards sm:grid-cols-2 (640px+). |
| Desktop Wide | 1440px | Verify: layout does not stretch beyond readable width, charts maintain aspect ratio, table columns have appropriate widths, no excessive whitespace. |

**Cross-breakpoint checks:**
- **PDF/CSV export must function at 320px** (ROADMAP Phase 3 success criterion #4)
- **Dashboard page load ≤4s on simulated 4G at all breakpoints** (ROADMAP Phase 4 success criterion #3)
- **Font size never drops below 14px** (WCAG AA + OPENCODE.md 24pt floor for financial data)

---

## Accessibility Audit Standards (D-47)

**Standard: WCAG AA practical subset**

### 1. Color Contrast (≥4.5:1)

| Element Pair | Foreground | Background | Expected Ratio | Verification Method |
|-------------|------------|------------|----------------|---------------------|
| Body text | text-gray-300 (#d1d5db) | bg-gray-900 (#111827) | ≥4.5:1 | Lighthouse + manual contrast checker |
| Card labels | text-gray-400 (#9ca3af) | bg-gray-900 (#111827) | ≥4.5:1 | Lighthouse |
| Financial data | text-amber-400 (#fbbf24) | bg-gray-900 (#111827) | ≥4.5:1 | Lighthouse |
| Financial data | text-white (#ffffff) | bg-gray-900 (#111827) | ≥4.5:1 | Lighthouse |
| Active preset text | text-black (#000000) | bg-amber-400 (#fbbf24) | ≥4.5:1 | Manual verification |
| Error text | text-red-400 (#f87171) | bg-red-950/50 | ≥4.5:1 | Manual verification |
| Disabled button | opacity-50 (any) | (any) | Exempt (disabled elements per WCAG) | No audit needed |
| Chart grid lines | rgba(255,255,255,0.1) | chart canvas | ≥3:1 (non-text UI) | Manual — verify grid lines are visible |

### 2. Touch Target Size (≥44px)

| Element | Current Size | At 320px? | Audit Check |
|---------|-------------|-----------|-------------|
| Hamburger button (☰) | text-2xl (~24px) | Must verify | If <44px, flag as Major bug |
| Sidebar close button (×) | text-2xl (~24px) | In overlay | If <44px, flag as Major bug |
| DateFilter preset buttons | px-3 py-1.5 (~36px tall) | Wraps on mobile | Verify ≥44px in at least one dimension |
| Export PDF button | w-full, px-4 py-2 (48px tall) | Full-width | ✅ Satisfies 44px minimum |
| Export CSV button | w-full, px-4 py-2 (48px tall) | Full-width | ✅ Satisfies 44px minimum |
| Login CTA | w-full, px-4 py-2.5 (~50px tall) | Full-width | ✅ Satisfies 44px minimum |
| Sidebar nav items | px-3 py-2.5 (~34px tall) | In overlay | Audit: may need larger touch target |
| Date inputs | px-3 py-1.5 | Small on mobile | Audit: verify tap target is adequate |
| Refresh button | (check component) | — | Audit |

### 3. Keyboard Navigation

Verify the following keyboard flows:
- **Login page:** Tab → Username → Tab → Password → Tab → Submit → Tab → Daftar link. Enter on Submit triggers form.
- **Dashboard (authenticated):** Tab through sidebar nav links, DateFilter presets, date inputs, SummaryCards area (if interactive), RefreshButton.
- **Sidebar mobile:** Hamburger button reachable via Tab, overlay opens, Tab through nav items, Escape closes overlay.
- **E-Report:** Tab through ReportDateFilter presets, date inputs, ExportButtons (PDF then CSV), table (scrollable region).
- **All pages:** Focus visible indicator — verify focus rings (focus:border-amber-400 focus:ring-1 focus:ring-amber-400) appear on all interactive elements.

### 4. Font Scaling

- Verify content remains readable at **200% browser zoom** without horizontal scrolling
- Verify no text is clipped or truncated at 200% zoom
- Verify charts and tables adapt to zoomed viewport

### 5. Screen Reader

- **Spinner:** `role="status"` + `aria-label="Memuat"` — verify screen reader announces loading
- **Sidebar hamburger:** `aria-label="Buka menu"` — verify screen reader announces
- **Sidebar close:** `aria-label="Tutup menu"` — verify screen reader announces
- **DateFilter date inputs:** `aria-label="Tanggal mulai"`, `aria-label="Tanggal akhir"` — verify
- **DateFilter presets:** `aria-pressed` attribute reflects active state
- **Sidebar backdrop:** `aria-hidden="true"` — verify screen reader ignores
- **EmptyState emoji:** `aria-hidden="true"` — verify screen reader ignores decorative emoji
- **Chart canvas:** Chart.js canvas is inherently inaccessible; verify alternative text pattern exists or is documented as known limitation

### 6. Lighthouse Automated Audit

Run Lighthouse accessibility audit (`npx lighthouse --only-categories=accessibility`) against each page:
- `/login`
- `/dashboard`
- `/e-report`
- `/data-entry`

**Target:** ≥90 accessibility score on all four pages.

---

## Chart Interaction Patterns (Audit)

### LineChart Tooltip (D-06, DASH-03)

| Behavior | Expected | Audit Check |
|----------|----------|-------------|
| Hover trigger | Tooltip appears on point hover (desktop) | Verify: date label + "Rp X" revenue value |
| Touch trigger | Tooltip appears on point tap (mobile) | Verify DASH-03: "tooltip muncul saat titik grafik disentuh" |
| Date format | `id-ID` locale: "26 Jun 2026" | Verify locale-correct month abbreviations |
| Revenue format | `Rp 1.234.567` (full Rupiah) | Verify `formatLineTooltipLabel()` output |
| Null guard | `context.parsed.y ?? 0` | Verify no console errors on missing data points |
| Tooltip background | `rgba(0,0,0,0.85)` (dark semi-transparent) | Verify text readable against tooltip background |

### PieChart Tooltip (D-07, DASH-03)

| Behavior | Expected | Audit Check |
|----------|----------|-------------|
| Content | Name + percentage + count + revenue | Verify all four data points in tooltip |
| Percentage | Derived from dataset (not pre-computed) | Verify totals to 100% across slices |
| Top 10 limit | Only 10 items rendered | Verify items beyond top 10 grouped or hidden |

### Decline Detection (D-08)

| Behavior | Expected | Audit Check |
|----------|----------|-------------|
| Point color | Red (#ef4444) when day-over-day revenue drops | Verify `computePointColors()` logic: index 0 = amber, revenue[i] < revenue[i-1] = red |
| Annotation | Decline percentage annotation may appear | Check if red annotation ("-X%") renders near decline points |
| Zero drop handling | No false positive when revenue unchanged | revenue[i] === revenue[i-1] → amber (not red) |

---

## Rupiah Formatting (Audit)

**Critical audit: Indonesian locale correctness.**

| Function | Input | Expected Output | Audit |
|----------|-------|-----------------|-------|
| `formatRupiah` | 1234567 | `Rp 1.234.567` | Verify dot thousands separator, NO decimals |
| `formatRupiah` | 0 | `Rp 0` | Verify zero renders correctly |
| `formatCompactRupiah` | 12345678 | `Rp 12,3 jt` | Verify COMMA decimal (NOT dot "12.3 jt") |
| `formatCompactRupiah` | 1500000000 | `Rp 1,5 M` | Verify M suffix, comma decimal |
| `formatCompactRupiah` | 500000 | `Rp 500.000` | Verify fallback: dot thousands, NO decimal |
| `formatLineTooltipLabel` | 1234567 | `Rp 1.234.567` | Verify manual Intl.NumberFormat('id-ID') |

**Note on NBSP vs regular space:** `formatRupiah` uses NBSP (currency-style formatter). `formatCompactRupiah` uses regular space for internal consistency. This is an intentional design choice (per Phase 02-05 decision) and is visually imperceptible — no audit issue.

---

## Export Button Behavior (Audit)

**Per D-28, D-35, D-36:**

| State | Expected | Audit Check |
|-------|----------|-------------|
| Desktop (≥640px) | Buttons at top-right, sticky, side-by-side | Verify `sm:flex-row sm:justify-end`, `sticky top-0` |
| Mobile (<640px) | Full-width, stacked vertically below preview | Verify `flex-col`, `w-full` on both buttons |
| No data | Both buttons disabled, 50% opacity | Verify `disabled:cursor-not-allowed disabled:opacity-50` |
| Has data | PDF button amber-400, CSV button gray-700, both clickable | Verify download triggers client-side (no server request) |
| PDF download | File named `Laporan_{OutletName}_{StartDate}_{EndDate}.pdf` | Verify D-29 filename convention |
| CSV download | File named `Laporan_{OutletName}_{StartDate}_{EndDate}.csv` with UTF-8 BOM + semicolon delimiter | Verify D-29 filename, D-26 structure (Tanggal, Omset (Rp), Menu Terlaris, Jumlah Transaksi) |
| CSV injection safety | Cells starting with =/+/ - /@ prefixed with tab | Verify `escapeCell()` function behavior (unit test exists) |
| Memory leak | `URL.revokeObjectURL` called after download | Verify no dangling blob URLs |

---

## State Coverage (Audit)

Each page must be audited in all four states:

| State | Login | Dashboard | E-Report | Data Entry |
|-------|-------|-----------|----------|------------|
| **Loading** | Submit button "Memproses..." | SummaryCards shimmer + charts with Spinner overlay | ReportDailyTable 5 skeleton rows | Form submit loading state |
| **Empty** | N/A (form always present) | EmptyState: "Belum ada data penjualan untuk periode ini" + "Tambah Data" CTA | Table "Tidak ada data untuk periode ini" | N/A (form always present) |
| **Error** | Red error banner: server error message | (No specific error state — polling silently retries) | (No specific error state — polling silently retries) | Validation errors below fields |
| **Loaded** | (Redirects to dashboard on success) | Full charts + summary cards + date filter | Full table + summary cards + export buttons | Success confirmation |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none | not applicable — shadcn not initialized |
| Third-party | none | not applicable — no external registries |

**No registry audit required.** All UI components are hand-rolled with Tailwind utility classes. No third-party component libraries or blocks are used.

---

## Design Quality Dimensions (Pre-Audit Checklist)

These are the 6 dimensions the `gsd-ui-checker` will verify. Pre-populated for reference:

### Dimension 1: Copywriting
- [ ] All Bahasa Indonesia copy matches the Copywriting Contract above
- [ ] No English strings leaking into user-facing UI (except "Export PDF"/"Export CSV" — intentional per D-29 file convention)
- [ ] Loading states have appropriate text indicators
- [ ] Error states describe the problem + next step

### Dimension 2: Visuals
- [ ] Dark theme consistent across all pages (no light-theme elements)
- [ ] Financial data rendered at ≥24pt (text-3xl)
- [ ] LineChart decline points render red
- [ ] Chart tooltips appear on hover (desktop) and touch (mobile)
- [ ] All 8 components in the component inventory render correctly at all 4 breakpoints

### Dimension 3: Color
- [ ] 60/30/10 color split maintained (gray-950/gray-900 dominant, gray-800/gray-700 secondary, amber-400 accent)
- [ ] Accent reserved for the 10 elements listed in the Color Contract
- [ ] Decline red used only for chart decline markers
- [ ] All text-background pairs pass ≥4.5:1 contrast (WCAG AA)
- [ ] No color-only indicators (all states have text/shape differentiation)

### Dimension 4: Typography
- [ ] Only 4 size roles used: 14px (text-sm), 16px (text-base), 18px (text-lg), 30px (text-3xl)
- [ ] Only 2 weights used: 400 + 700
- [ ] Financial data always ≥24pt (text-3xl ≈ 30px)
- [ ] Line heights: 1.5 for body, 1.2 for headings
- [ ] No font-size below 14px in user-facing text

### Dimension 5: Spacing
- [ ] All spacing values multiples of 4 (Tailwind default scale)
- [ ] Minimum touch target 44px met on all interactive elements at 320px
- [ ] No horizontal overflow at 320px viewport
- [ ] Consistent padding: p-4 mobile → lg:p-6 desktop

### Dimension 6: Registry Safety
- [ ] N/A — no registry in use. All components are first-party code.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PENDING
- [ ] Dimension 2 Visuals: PENDING
- [ ] Dimension 3 Color: PENDING
- [ ] Dimension 4 Typography: PENDING
- [ ] Dimension 5 Spacing: PENDING
- [ ] Dimension 6 Registry Safety: PENDING

**Approval:** pending
