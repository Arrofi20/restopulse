# Phase 3: E-Report Engine — Research

**Researched:** 2026-06-26
**Domain:** Client-side PDF/CSV export, React report UI, Prisma aggregation
**Confidence:** HIGH

## Summary

Phase 3 delivers a complete E-Report Engine for RestoPulse: a date-filtered financial reporting page with client-side PDF and CSV export. The technical approach is well-established and low-risk.

**PDF export** uses `jspdf` (4.2.1) + `jspdf-autotable` (5.0.8) — the de-facto standard for client-side PDF generation in JavaScript, with 13.6M and 3.4M weekly downloads respectively. A4 portrait, headers/footers, page breaks, and table formatting are all natively supported. Rupiah formatting can reuse the existing `formatRupiah()` utility. A critical design decision is the auto-switch from dark preview (screen) to light print theme (white paper, dark text) for ink efficiency.

**CSV export** is best implemented with a small custom generator (~30 LOC) rather than pulling in a library. Indonesian Excel compatibility requires UTF-8 BOM prefix (`\uFEFF`) and semicolon (`;`) delimiter. Browser download triggers via `Blob` + `URL.createObjectURL` + `<a download>` — no server storage needed.

**Backend aggregation** reuses the existing CQRS-lite pattern: `SalesTrendRepository.findByDateRange()` for daily rows + `aggregateSummary()` for totals. No new caching layer needed for v1. A single `GET /api/report?start=&end=` endpoint returns both summary and detail in one response, minimizing mobile network calls.

**Mobile UI** uses standard Tailwind patterns: stacked flex-col layouts, full-width buttons at `w-full`, sticky positioning for export buttons, and `overflow-x-auto` for horizontal table scroll.

**Primary recommendation:** Install `jspdf` + `jspdf-autotable` in the frontend. Build a custom CSV generator. Reuse existing Repository → Service → Controller → Route pattern. Reuse `DateFilter` component with swapped presets.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Report date presets: **Harian** (today), **Mingguan** (last 7 days), **Bulanan** (current month), plus custom date range picker [D-19]
- Default report view: **Bulanan** (current month) [D-20]
- Report filter is **INDEPENDENT** of dashboard filter — E-Report has its own date state [D-21]
- Reuse existing `DateFilter` component pattern but adapt presets for reporting [D-22]
- PDF layout: A4 portrait, header with outlet name + period, summary stats cards, daily detail table, footer with generation date [D-24]
- PDF styling (screen preview): dark background, white text, Rupiah formatting, 12pt minimum font [D-25]
- PDF styling (exported file): **white paper background with dark text** — auto-switches from dark preview to print-ready light theme [D-25b]
- CSV structure: one row per day — columns: Tanggal, Omset (Rp), Menu Terlaris, Jumlah Transaksi [D-26]
- Export UX: preview FIRST, then Export PDF / Export CSV buttons [D-27]
- Export buttons at top-right of preview, **sticky on scroll** [D-28]
- File naming: `Laporan_{OutletName}_{StartDate}_{EndDate}.{pdf|csv}` [D-29]
- Export triggers **browser download** (no server-side file storage) [D-30]
- CSV export **stays in Phase 3** — REPT-03 is v1/Phase 3 [D-30b]
- Report API reads from **SalesTrend** table (pre-computed) for summary + **DailySales** for detailed breakdown [D-31]
- Report endpoint: `GET /api/report?start=YYYY-MM-DD&end=YYYY-MM-DD&format=summary` [D-32]
- Export endpoints: `GET /api/report/export?start=&end=&type=pdf` and `type=csv` [D-33]
- Report preview stacks **vertically on mobile** [D-34]
- Export buttons are **full-width on mobile (320px)** [D-35]
- **Client-side PDF/CSV generation** to avoid server processing delays on mobile networks [D-36]

### Agent's Discretion
- Exact jsPDF configuration (margins, fonts, page breaks)
- CSV generation library choice (papaparse vs custom vs JSON-to-CSV)
- Report table styling (Tailwind classes, responsive breakpoints)
- Backend aggregation query optimization (Prisma aggregation vs raw computed)
- Data source implementation: live query vs cached snapshot (DailySalesReport table exists but unused)

### Deferred Ideas (OUT OF SCOPE)
- WhatsApp report delivery — v2 requirement (NOTF-01)
- Scheduled/automated reports
- Report email delivery
- Custom report templates

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| REPT-01 | Sistem menyaring, menghitung total pendapatan, dan menyusun lembar ringkasan laporan digital di layar sesuai filter rentang tanggal pemilik | Date filtering reuse + SalesTrend aggregation pattern documented |
| REPT-02 | Sistem mengonversi struktur data laporan di layar menjadi file dokumen digital siap cetak berformat PDF | jsPDF + autotable stack verified, A4 portrait patterns documented |
| REPT-03 | Sistem mengekstrak data mentah ringkasan penjualan harian ke dalam format file CSV (Excel) | UTF-8 BOM + semicolon delimiter pattern documented, custom generator recommended |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Date filtering UI | Browser / Client | — | React component with local state, same as dashboard |
| Report preview rendering | Browser / Client | — | React DOM, Tailwind styled |
| PDF generation | Browser / Client | — | jsPDF + autotable runs entirely in browser per D-36 |
| CSV generation | Browser / Client | — | Custom generator + Blob download per D-36 |
| Report data aggregation | API / Backend | — | Prisma queries on SalesTrend + DailySales |
| File download trigger | Browser / Client | — | `<a download>` + URL.createObjectURL |
| Auth / authorization | API / Backend | — | JWT Bearer token, existing middleware |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `jspdf` | 4.2.1 | Client-side PDF generation | 13.6M weekly downloads, industry standard, A4/UTF-8 support [VERIFIED: npm registry] |
| `jspdf-autotable` | 5.0.8 | PDF table formatting (headers, page breaks, styling) | Official plugin for jsPDF, 3.4M weekly downloads, mature API [VERIFIED: npm registry] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `date-fns` | 4.4.0 (existing) | Date math for presets and formatting | Already in project — no new install needed |
| `papaparse` | 5.5.4 | CSV parsing/generation (optional) | Only if complex CSV edge cases arise; custom generator preferred for this use case [WARNING: flagged as suspicious — verify before using.] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| jsPDF + autotable | `pdfmake` | pdfmake has richer declarative layout but larger bundle (~1MB vs ~300KB). jsPDF is simpler for A4 tables. |
| jsPDF + autotable | `html2pdf.js` (html2canvas + jsPDF) | Renders DOM to canvas then PDF. Loses text selectability, larger bundles, print-quality issues. Not suitable for data tables. |
| Custom CSV generator | `papaparse` | PapaParse is 46KB+ and overkill for simple one-row-per-day export with 4 columns. Custom is ~30 LOC, zero dep. |
| Custom CSV generator | `csv-stringify` (Node) | Server-side only. D-36 requires client-side generation. |

**Installation:**
```bash
# In frontend/ directory
cd frontend
npm install jspdf jspdf-autotable
```

**Version verification:**
- `jspdf@4.2.1` published 2026-03-17 — current stable [VERIFIED: npm registry]
- `jspdf-autotable@5.0.8` published 2026-05-17 — current stable, TypeScript-native [VERIFIED: npm registry]
- `papaparse@5.5.4` published 2026-06-19 — 12M weekly downloads, 46 historical versions [VERIFIED: npm registry]

---

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| jspdf | npm | 8+ yrs | 13.6M/wk | github.com/parallax/jsPDF | OK | Approved |
| jspdf-autotable | npm | 8+ yrs | 3.4M/wk | github.com/simonbengtsson/jsPDF-AutoTable | OK | Approved |
| papaparse | npm | 8+ yrs | 12M/wk | github.com/mholt/PapaParse | SUS | Flagged — "too-new" is a false positive (v5.5.4 released 2026-06-19, but library has 46 versions). Planner may skip this package entirely since custom CSV generator is recommended. |

**Packages removed due to [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** `papaparse` — see note above. Planner should not install unless custom CSV generator proves insufficient.

---

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ EReportPage  │───▶│ ReportFilter │───▶│   ReportPreview  │  │
│  │  (React)     │    │ (DateFilter  │    │  (Summary +      │  │
│  │              │    │   adapted)   │    │   Daily Table)   │  │
│  └──────────────┘    └──────────────┘    └──────────────────┘  │
│         │                                           │           │
│         │                                    ┌──────┴──────┐   │
│         │                                    │  useReport  │   │
│         │                                    │   (hook)    │   │
│         │                                    └──────┬──────┘   │
│         │                                           │           │
│         │                              ┌────────────┼────────┐  │
│         │                              ▼            ▼        ▼  │
│         │                         ┌────────┐  ┌────────┐ ┌────┐│
│         │                         │get /api│  │generate│ │generate│
│         │                         │/report │  │  PDF   │ │  CSV   │
│         │                         └────────┘  └────────┘ └────┘│
│         │                              │           │        │   │
│         └──────────────────────────────┘           ▼        ▼   │
│                                         ┌────────────────────┐  │
│                                         │  Blob + <a download>│  │
│                                         │  (no server storage) │  │
│                                         └────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTP GET /api/report?start=&end=
┌─────────────────────────────────────────────────────────────────┐
│                      API / BACKEND (Node.js)                    │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────────┐  │
│  │ ReportRoute │──▶│ReportCtrl   │──▶│  ReportService       │  │
│  │  (/api/     │   │  (Zod val)  │   │  (date validation,   │  │
│  │   report)   │   │             │   │   aggregation)       │  │
│  └─────────────┘   └─────────────┘   └──────────┬───────────┘  │
│                                                  │              │
│                       ┌──────────────────────────┼──────────┐   │
│                       ▼                          ▼          ▼   │
│                  ┌─────────────┐          ┌─────────────┐ ┌────┐│
│                  │SalesTrend   │          │ DailySales  │ │Outlet│
│                  │Repository   │          │Repository   │ │(name)│
│                  │(summary +   │          │(detailed    │ └────┘│
│                  │ daily rows) │          │ breakdown)  │       │
│                  └─────────────┘          └─────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (new files)
```
frontend/src/
├── pages/
│   └── EReportPage.tsx              # Full report page implementation
├── components/
│   └── report/
│       ├── ReportDateFilter.tsx     # Adapted DateFilter with report presets
│       ├── ReportPreview.tsx        # Summary cards + daily table
│       ├── ReportSummaryCards.tsx   # Total revenue, tx count, top items
│       ├── ReportDailyTable.tsx     # Scrollable daily breakdown table
│       └── ExportButtons.tsx        # Sticky PDF/CSV export buttons
├── hooks/
│   └── useReport.ts                 # Data fetching hook (mirrors useDashboard)
├── lib/
│   ├── format.ts                    # Existing — reuse formatRupiah
│   ├── pdfGenerator.ts              # jsPDF + autotable export engine
│   └── csvGenerator.ts              # UTF-8 BOM semicolon CSV generator
└── types/
    └── report.ts                    # ReportData, ReportRow types

src/
├── controllers/
│   └── ReportController.ts          # GET /api/report handler
├── services/
│   └── ReportService.ts             # Aggregation logic
├── repositories/
│   └── ReportRepository.ts          # Unified SalesTrend + DailySales queries
└── routes/
    └── report.routes.ts             # Express router for /api/report
```

### Pattern 1: Client-Side PDF Generation with jsPDF + autotable
**What:** Generate A4 portrait PDF directly in the browser with headers, footers, tables, and formatted text.
**When to use:** Any time the user needs a downloadable PDF. D-36 mandates client-side to avoid mobile network delays.
**Example:**
```typescript
// Source: jspdf-autotable README + official docs
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export function generateReportPDF(data: ReportData) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // --- Header ---
  doc.setFontSize(18);
  doc.setTextColor(20, 20, 20); // dark text for print
  doc.text(data.outletName, 14, 20);

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Periode: ${data.periodLabel}`, 14, 28);

  // --- Summary Section (manual positioning) ---
  const summaryY = 38;
  doc.setFontSize(10);
  doc.text(`Total Omset: ${data.summary.totalRevenueFormatted}`, 14, summaryY);
  doc.text(`Jumlah Transaksi: ${data.summary.transactionCount}`, 14, summaryY + 6);

  // --- Daily Detail Table ---
  autoTable(doc, {
    startY: summaryY + 14,
    head: [['Tanggal', 'Omset (Rp)', 'Menu Terlaris', 'Jumlah Transaksi']],
    body: data.rows.map((r) => [
      r.date,
      r.revenueFormatted,
      r.topMenu,
      String(r.transactionCount),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [240, 240, 240], textColor: 20, fontStyle: 'bold' },
    bodyStyles: { textColor: 20 },
    styles: { fontSize: 10, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { halign: 'right', cellWidth: 40 },
      2: { cellWidth: 'auto' },
      3: { halign: 'center', cellWidth: 35 },
    },
    pageBreak: 'auto',
    showHead: 'everyPage',
    didDrawPage: (dataArg) => {
      // Footer on every page
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Dibuat pada: ${new Date().toLocaleString('id-ID')} — Halaman ${dataArg.pageNumber} / ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    },
  });

  doc.save(`Laporan_${data.outletName}_${data.startDate}_${data.endDate}.pdf`);
}
```

### Pattern 2: Custom CSV Generator with UTF-8 BOM
**What:** Convert report rows to a CSV string with BOM prefix and semicolon delimiter, then trigger a browser download.
**When to use:** Simple tabular exports where the schema is fixed and rows are small (< 10k). For RestoPulse, max rows = 365 (one year of daily data).
**Example:**
```typescript
// Source: MDN Blob API + Indonesian Excel conventions
export function generateReportCSV(data: ReportData): void {
  const headers = ['Tanggal', 'Omset (Rp)', 'Menu Terlaris', 'Jumlah Transaksi'];

  const escapeCell = (val: string): string => {
    if (val.includes(';') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const rows = data.rows.map((r) =>
    [
      r.date,
      r.revenueFormatted,
      r.topMenu,
      String(r.transactionCount),
    ].map(escapeCell).join(';')
  );

  const csvContent = [headers.join(';'), ...rows].join('\r\n');

  // UTF-8 BOM for Excel auto-detection
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `Laporan_${data.outletName}_${data.startDate}_${data.endDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Pattern 3: Reusing DateFilter with Swapped Presets
**What:** Create a `ReportDateFilter` that wraps the same UI pattern as `DateFilter` but uses report-specific presets (Harian/Mingguan/Bulanan/Custom).
**When to use:** D-22 requires reusing the DateFilter pattern. The component is small enough to copy-adapt rather than making it hyper-configurable.
**Key adaptation:**
```typescript
const REPORT_PRESETS: { label: string; compute: () => DateRange }[] = [
  { label: 'Harian',   compute: () => ({ start: format(new Date(), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Mingguan', compute: () => ({ start: format(subDays(new Date(), 7), 'yyyy-MM-dd'), end: format(new Date(), 'yyyy-MM-dd') }) },
  { label: 'Bulanan',  compute: () => ({ start: format(startOfMonth(new Date()), 'yyyy-MM-dd'), end: format(endOfMonth(new Date()), 'yyyy-MM-dd') }) },
];

export function defaultReportDateRange(): DateRange {
  return REPORT_PRESETS[2].compute(); // Bulanan default (D-20)
}
```

### Anti-Patterns to Avoid
- **Server-side PDF generation:** Would violate D-36 (mobile network delays). Puppeteer/Playwright on backend is overkill and introduces infrastructure complexity.
- **html2canvas-based PDF:** Converts DOM to raster image — text is not selectable, file size is large, print quality is poor. Use jsPDF + autotable for data tables.
- **Comma delimiter in CSV:** Indonesian Excel defaults to semicolon for CSV. Comma-delimited files open with columns misaligned on Indonesian Windows/Excel. Always use semicolon per D-26.
- **No BOM in CSV:** Excel on Windows often misdetects UTF-8 without BOM, garbling Indonesian characters (e.g., "Jalan" with diacritics). Always prepend `\uFEFF`.
- **Shared date state with dashboard:** D-21 explicitly requires independent state. Do not reuse `useDashboard`'s date range.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PDF table layout | Custom canvas/SVG drawing | `jspdf-autotable` | Handles page breaks, headers on every page, column widths, row spanning — thousands of edge cases already solved |
| PDF file generation | Server-side Puppeteer | `jspdf` client-side | Zero backend infra, works offline, instant on mobile |
| Date math for presets | `new Date()` arithmetic | `date-fns` (existing) | Timezone-safe, leap-year safe, DST-safe — already in project |
| Rupiah formatting | `.toLocaleString()` manual | `formatRupiah()` (existing) | Uses `Intl.NumberFormat('id-ID')` with correct grouping |
| CSV special-character escaping | Simple `.join(',')` | Custom `escapeCell` with `""` doubling | RFC 4180 compliance for quotes, semicolons, newlines |

**Key insight:** PDF generation is deceptively complex (page breaks, table headers repeating, footer positioning, font metrics). jsPDF + autotable is the standard because it solves these problems. For CSV, the format is simple enough that a custom 30-line generator is cleaner than adding a dependency — but only because the schema is fixed and row count is bounded.

---

## Common Pitfalls

### Pitfall 1: Dark Theme PDF Exported as Dark
**What goes wrong:** The screen preview uses dark background (`bg-gray-950`, white text). If the PDF reuses these colors, printing consumes massive ink and looks unprofessional.
**Why it happens:** Developers often copy screen styles directly into PDF generators.
**How to avoid:** D-25b explicitly requires auto-switching. Pass a `theme: 'print'` flag to the PDF generator that sets `fillColor: [255,255,255]` and `textColor: 20`. The preview component stays dark; the PDF engine always uses light colors.
**Warning signs:** PDF preview in browser shows dark background before saving.

### Pitfall 2: jsPDF Standard Fonts Don't Support All Unicode
**What goes wrong:** The 14 standard PDF fonts only support ASCII. Indonesian text without diacritics is fine, but if outlet names or menu items contain special characters (e.g., "café", "naïve"), they render as garbage.
**Why it happens:** jsPDF defaults to Helvetica, which lacks extended Latin glyphs.
**How to avoid:** For RestoPulse, Indonesian text is mostly ASCII-compatible. If special characters are needed, add a custom TTF font via `doc.addFileToVFS()` + `doc.addFont()`. Consider this out-of-scope unless user data proves otherwise.
**Warning signs:** PDF shows empty squares or wrong characters for non-ASCII text.

### Pitfall 3: Page Break Cuts Off Table Rows
**What goes wrong:** A table row straddles a page break, cutting text in half.
**Why it happens:** Default `pageBreak: 'auto'` splits rows when needed, but `rowPageBreak: 'auto'` allows row splitting.
**How to avoid:** Set `rowPageBreak: 'avoid'` in autotable options. This prevents a row from being split across pages — the entire row moves to the next page.

### Pitfall 4: Memory Leak from Object URLs
**What goes wrong:** Repeated CSV/PDF downloads leak memory because `URL.createObjectURL()` URLs are never revoked.
**Why it happens:** Missing `URL.revokeObjectURL(url)` after `link.click()`.
**How to avoid:** Always wrap downloads in a `try/finally` or immediately call `URL.revokeObjectURL(url)` after appending + clicking + removing the anchor.

### Pitfall 5: Date Input Off-by-One from Timezone
**What goes wrong:** The dashboard date filter uses `date-fns` with local dates. If report code uses `new Date().toISOString()`, the date can shift by one day in UTC+7 (Jakarta).
**Why it happens:** `toISOString()` returns UTC midnight, which is 7 hours behind Jakarta. `2026-06-26T00:00:00Z` is `2026-06-26 07:00` in Jakarta, but the string slice `YYYY-MM-DD` would still be correct. However, `new Date('2026-06-26')` is parsed as UTC midnight = `2026-06-26 07:00` Jakarta, which is fine. The real issue is `new Date()` at 01:00 Jakarta = previous day UTC.
**How to avoid:** Always use `date-fns` `format(new Date(), 'yyyy-MM-dd')` (local) instead of `new Date().toISOString().slice(0,10)` (UTC). The existing `DateFilter` already does this correctly — copy its pattern.

---

## Code Examples

### Verified Pattern: Prisma Aggregation for Report Summary
```typescript
// Source: Prisma docs (Aggregation, grouping, and summarizing)
// Mirrors existing SalesTrendRepository.aggregateSummary()

async getReportSummary(outlet_id: string, start: Date, end: Date) {
  const summary = await prisma.salesTrend.aggregate({
    where: { outlet_id, date: { gte: start, lte: end } },
    _sum: { revenue: true },
    _count: { id: true },
  });

  const dailyRows = await prisma.salesTrend.findMany({
    where: { outlet_id, date: { gte: start, lte: end } },
    orderBy: { date: 'asc' },
  });

  return {
    totalRevenue: summary._sum.revenue || 0,
    transactionCount: summary._count.id || 0,
    dailyRows: dailyRows.map((r) => ({
      date: format(r.date, 'yyyy-MM-dd'),
      revenue: r.revenue,
      menuPopularity: JSON.parse(r.menu_popularity),
    })),
  };
}
```

### Verified Pattern: Mobile Sticky Export Buttons
```tsx
// Source: Tailwind CSS docs + common responsive patterns
<div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm py-3">
  <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
    <button className="w-full rounded bg-amber-400 px-4 py-2 text-sm font-bold text-black sm:w-auto">
      Export PDF
    </button>
    <button className="w-full rounded bg-gray-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 sm:w-auto">
      Export CSV
    </button>
  </div>
</div>
```

### Verified Pattern: Horizontal Scroll Table on Mobile
```tsx
// Source: Tailwind CSS overflow utilities
<div className="overflow-x-auto">
  <table className="min-w-full text-sm">
    <thead className="bg-gray-800 text-gray-300">
      <tr>
        <th className="px-3 py-2 text-left whitespace-nowrap">Tanggal</th>
        <th className="px-3 py-2 text-right whitespace-nowrap">Omset (Rp)</th>
        <th className="px-3 py-2 text-left whitespace-nowrap">Menu Terlaris</th>
        <th className="px-3 py-2 text-center whitespace-nowrap">Jumlah Transaksi</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-800">
      {/* rows */}
    </tbody>
  </table>
</div>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Server-side PDF (Puppeteer/Playwright) | Client-side jsPDF | 2015+ | Eliminates backend infra, instant on mobile, works offline |
| CSV comma delimiter | Semicolon for Indonesian Excel | Always | Prevents column misalignment in Indonesian locale |
| Manual date string slicing (`toISOString().slice(0,10)`) | `date-fns` local formatting | Phase 2 | Prevents timezone off-by-one bugs |

**Deprecated/outdated:**
- `html2canvas` + jsPDF for data tables: loses text selectability, poor print quality, large bundles. Use `jspdf-autotable` instead.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Indonesian Excel defaults to semicolon delimiter — no need to support comma fallback | CSV Export Research | Low: user could open in Google Sheets or change Excel settings |
| A2 | SalesTrend table is fully populated for all queried dates — no missing days | Date Filtering Research | Medium: gaps in data would show as missing rows in report. Mitigation: show "0" or "-" for missing days |
| A3 | Outlet names and menu items contain only ASCII/Latin-1 characters — no custom font needed for jsPDF | PDF Export Research | Low: if special Unicode appears, PDF would show garbled text. Mitigation: add custom TTF font (out of scope for v1) |
| A4 | Max report rows = ~365 (one year daily) — well within jsPDF/autotable performance limits | PDF Export Research | Low: even 5 years (1825 rows) generates in < 2s on modern mobile |

---

## Open Questions

1. **Should the report include days with zero sales?**
   - What we know: SalesTrend only stores days with data. A month with 30 days might have 25 rows if 5 days had no sales.
   - What's unclear: User expectation for "Bulanan" report — 30 rows with zeros, or only days with data?
   - Recommendation: Start with existing rows only (simpler). If user feedback requests zero-filled days, add a gap-filling step in the service layer.

2. **What should "Menu Terlaris" show when there are ties?**
   - What we know: `menu_popularity` is stored as JSON with items ranked by count/percentage.
   - What's unclear: Whether to show the first item, all tied items, or a comma-separated list.
   - Recommendation: Show the first (highest-ranked) item only for CSV simplicity. In PDF table, same. In preview summary card, show top 3.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Backend runtime | ✓ | v20+ (inferred from project) | — |
| npm | Package manager | ✓ | v10+ | — |
| Vite dev server | Frontend build | ✓ | 8.1.0 | — |
| SQLite | Database | ✓ | Prisma-managed | — |
| date-fns | Date math | ✓ | 4.4.0 | — |
| jsPDF (to install) | PDF export | — | 4.2.1 | N/A — required |
| jsPDF-AutoTable (to install) | PDF tables | — | 5.0.8 | N/A — required |

**Missing dependencies with no fallback:**
- `jspdf` and `jspdf-autotable` — must be installed in frontend before implementation.

**Missing dependencies with fallback:**
- None. CSV generation requires no packages.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.9 + @testing-library/react 16.3.2 |
| Config file | `frontend/vite.config.ts` (inferred from Vite project) |
| Quick run command | `npm test` (runs `vitest run`) |
| Full suite command | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| REPT-01 | Report API returns aggregated data for date range | unit (backend) | `vitest run src/services/ReportService.test.ts` | ❌ Wave 0 |
| REPT-01 | Report preview renders summary cards and table | component | `vitest run src/components/report/ReportPreview.test.tsx` | ❌ Wave 0 |
| REPT-01 | Date filter presets compute correct ranges | unit | `vitest run src/components/report/ReportDateFilter.test.ts` | ❌ Wave 0 |
| REPT-02 | PDF generator produces valid PDF blob | unit | `vitest run src/lib/pdfGenerator.test.ts` | ❌ Wave 0 |
| REPT-02 | PDF filename matches convention | unit | same as above | ❌ Wave 0 |
| REPT-03 | CSV generator produces UTF-8 BOM + semicolon content | unit | `vitest run src/lib/csvGenerator.test.ts` | ❌ Wave 0 |
| REPT-03 | CSV filename matches convention | unit | same as above | ❌ Wave 0 |
| REPT-03 | CSV escapes special characters correctly | unit | same as above | ❌ Wave 0 |
| Mobile | Export buttons are full-width below 640px | component | `vitest run src/components/report/ExportButtons.test.tsx` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run` (frontend)
- **Per wave merge:** `npm test -- --run` (full frontend suite)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `frontend/src/lib/pdfGenerator.test.ts` — PDF generation unit tests
- [ ] `frontend/src/lib/csvGenerator.test.ts` — CSV generation unit tests
- [ ] `frontend/src/hooks/useReport.test.ts` — Report data fetching hook tests
- [ ] `frontend/src/components/report/ReportPreview.test.tsx` — Component render tests
- [ ] `src/services/ReportService.test.ts` — Backend service unit tests (if backend tests exist; none found in repo)
- [ ] Framework install: `cd frontend && npm install jspdf jspdf-autotable`

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | JWT Bearer token, existing `authMiddleware` |
| V3 Session Management | yes | Token in localStorage, 401 redirect handled by `apiClient` |
| V4 Access Control | yes | `req.user!.outletId` filters all data — owners cannot access other outlets' reports |
| V5 Input Validation | yes | `dateRangeSchema` (Zod) validates `start`/`end` format and ordering |
| V6 Cryptography | no | No new crypto in this phase |
| V8 Data Protection | yes | Report data is outlet-scoped; no PII beyond outlet name |

### Known Threat Patterns for This Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Path traversal via filename | Tampering | File naming uses outlet name + dates only — sanitize/escape outlet name before using in `doc.save()` or `link.download` |
| CSV injection (formula injection) | Tampering | If menu names start with `=`, `+`, `-`, `@`, Excel may interpret them as formulas. Prefix with tab or single quote, or strip leading special chars. |
| XSS via PDF/CSV content | Tampering | Content is entirely server-generated (SalesTrend rows). No user-supplied free text enters the report. |
| Unauthorized report access | Information Disclosure | `authMiddleware` + outlet-scoped queries ensure users only see their own data. |

---

## Sources

### Primary (HIGH confidence)
- `jspdf` npm registry — version 4.2.1, 13.6M weekly downloads, official repo `github.com/parallax/jsPDF` [VERIFIED: npm registry]
- `jspdf-autotable` npm registry — version 5.0.8, 3.4M weekly downloads, official repo `github.com/simonbengtsson/jsPDF-AutoTable` [VERIFIED: npm registry]
- `jspdf-autotable` README — API docs for `autoTable()`, hooks, styling options [CITED: github.com/simonbengtsson/jsPDF-AutoTable]
- `jsPDF` README — installation, module formats, Unicode/font notes [CITED: github.com/parallax/jsPDF]
- Prisma official docs — Aggregation, grouping, and summarizing [CITED: prisma.io/docs/orm/prisma-client/queries/aggregation-grouping-summarizing]

### Secondary (MEDIUM confidence)
- MDN Web APIs — `Blob()` constructor, `URL.createObjectURL()` for browser downloads [CITED: developer.mozilla.org]
- Existing RestoPulse codebase — `DateFilter.tsx`, `format.ts`, `DashboardService.ts`, `SalesTrendRepository.ts`, `useDashboard.ts` [VERIFIED: codebase grep]

### Tertiary (LOW confidence)
- Indonesian Excel CSV conventions — semicolon delimiter and UTF-8 BOM for locale compatibility [ASSUMED] — widely documented but not from a single authoritative source

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — jsPDF + autotable are the undisputed leaders with massive adoption and active maintenance.
- Architecture: **HIGH** — Reuses existing patterns (Repository → Service → Controller, useDashboard hook, DateFilter). No novel architecture.
- Pitfalls: **HIGH** — All pitfalls are documented from official docs or observed in similar projects.

**Research date:** 2026-06-26
**Valid until:** 2026-09-26 (stable stack — jsPDF and autotable have slow release cycles)
