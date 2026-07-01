# Phase 2: Dashboard - Research

**Researched:** 2026-06-26
**Domain:** Frontend SPA — React + Vite + Tailwind CSS + Chart.js data visualization
**Confidence:** HIGH

## Summary

Phase 2 delivers the complete frontend React application for the RestoPulse owner dashboard. The frontend is a greenfield SPA scaffolded in a `/frontend/` directory (separate from the Phase 1 Express backend). It consumes the existing `/api/*` endpoints via Bearer token authentication and renders interactive Line Chart and Pie Chart visualizations from pre-computed SalesTrend data.

**Critical discovery:** The Phase 1 auth implementation returns Bearer tokens in JSON response bodies — NOT httpOnly cookies as documented in CONTEXT.md. The auth middleware (`src/middleware/authMiddleware.ts`) reads `Authorization: Bearer <token>` headers. This means the frontend must persist the token in `localStorage`/memory and attach it manually. Additionally, `src/app.ts` uses `app.use(cors())` with zero configuration — this MUST be updated with explicit CORS settings before the frontend can communicate with the API in development.

**Primary recommendation:** Scaffold the frontend with `npm create vite@latest frontend -- --template react-ts`, add Tailwind CSS v4 via `@tailwindcss/vite` plugin, use `react-chartjs-2` v5 with Chart.js v4 tree-shaken registrations, and create a dedicated `GET /api/dashboard` backend endpoint that reads directly from the SalesTrend table. Fix CORS and add a Vite dev proxy for `/api` → `http://localhost:3000`.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Default view: last 7 days
- **D-02:** Quick-select preset buttons: 7 Hari (7H), 30 Hari (30H), Bulan Ini, Semua
- **D-03:** Custom date picker (start-end) alongside presets
- **D-04:** Shared filter between Line Chart and Pie Chart
- **D-05:** Summary statistics cards above charts showing total revenue + day count
- **D-06:** Line Chart tooltip: date + revenue only
- **D-07:** Pie Chart tooltip: name + percentage + count + revenue contributed
- **D-08:** Revenue decline visual indicator: red point marker + annotation showing drop percentage (e.g., -15%)
- **D-09:** Empty state: message + CTA button to add data ("Belum ada data penjualan untuk periode ini")
- **D-10:** Auto-poll interval: 30 seconds
- **D-11:** Manual refresh button alongside auto-poll
- **D-12:** Subtle loading indicator (spinner/shimmer) during refresh, don't replace charts
- **D-13:** Background tab polling: pause when hidden, resume when visible
- **D-14:** Left sidebar with Dashboard + E-Report links
- **D-15:** Hamburger menu overlay on mobile (320px viewport)
- **D-16:** Charts side-by-side on desktop, stacked on mobile (Line Chart above, Pie Chart below)
- **D-17:** Top header bar with outlet name + user identity + logout button
- **D-18:** Sidebar with everything including logout at bottom

### the agent's Discretion

- API endpoint choices (new SalesTrend endpoint vs reuse existing GET /api/sales)
- Frontend project directory structure (separate /frontend/ vs monorepo)
- Exact Prisma field types, repository method naming conventions
- Express middleware ordering
- Seed script implementation details

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DASH-01 | Sistem mengagregasikan data omset dan menggambar Line Chart interaktif riwayat tren harian secara otomatis saat halaman dasbor dimuat | Line Chart uses react-chartjs-2 `<Line>` component with time-scale x-axis, data from SalesTrend API. See § Chart.js Integration. |
| DASH-02 | Sistem mengagregasikan data performa menu dan menggambar Pie Chart persentase menu terlaris secara otomatis | Pie Chart uses `<Pie>` component with aggregated menu_popularity data. See § Chart.js Integration. |
| DASH-03 | Sistem menampilkan pop-up detail (tooltip) berisi nominal angka omset dan menu terlaris secara instan ketika titik tanggal pada grafik disentuh | Custom tooltip callbacks via `options.plugins.tooltip.callbacks.label`. See § Tooltip Configuration. |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Dashboard data retrieval | API / Backend | — | SalesTrend data lives in SQLite; needs a dedicated endpoint with JWT validation |
| Line Chart rendering | Browser / Client | — | Chart.js renders on `<canvas>`; all visualization is client-side |
| Pie Chart rendering | Browser / Client | — | Same canvas-based rendering; no server involvement after data fetch |
| Date range filtering | Browser / Client | API / Backend | UI state managed client-side; query params sent to API endpoint |
| Auth token management | Browser / Client | — | Bearer token stored client-side; attached to every API request |
| Polling / data refresh | Browser / Client | — | setInterval + Page Visibility API; entirely browser-side concern |
| Responsive layout | Browser / Client | — | Tailwind CSS responsive utilities; no server involvement |
| Rupiah formatting | Browser / Client | — | `Intl.NumberFormat('id-ID')` runs natively in browser |
| Summary statistics | Browser / Client | API / Backend | Computed from returned data; endpoint can optionally pre-compute totals |

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 19.2.7 | UI component library | Current stable release; required per OPENCODE.md |
| react-dom | 19.2.7 | React DOM renderer | Paired with react |
| vite | 8.1.0 | Build tool & dev server | Fast HMR, native ESM; required per OPENCODE.md [VERIFIED: npm registry, vite.dev] |
| @vitejs/plugin-react | (bundled) | React Fast Refresh + JSX transform | Official Vite React plugin [CITED: vite.dev/guide/] |
| tailwindcss | 4.3.1 | Utility-first CSS framework | Required per OPENCODE.md; dark mode support [CITED: tailwindcss.com] |
| @tailwindcss/vite | 4.3.1 | Tailwind CSS Vite plugin | Official integration for Vite [CITED: tailwindcss.com/docs/installation/using-vite] |
| chart.js | 4.5.1 | Canvas-based charting library | Required per OPENCODE.md/PROJECT.md; tree-shakeable [CITED: chartjs.org] |
| react-chartjs-2 | 5.3.1 | React wrapper for Chart.js | Official React integration; handles lifecycle [CITED: react-chartjs-2.js.org] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-router-dom | ^7.x (latest) | Client-side routing | Dashboard + E-Report page routing [ASSUMED] |
| date-fns | ^4.x (latest) | Date manipulation | Date range calculation, formatting for API params [ASSUMED] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-chartjs-2 | Raw Chart.js + useRef | More boilerplate; manual lifecycle management; no React-idiomatic props |
| date-fns | dayjs / luxon | Smaller bundle (dayjs) but less TypeScript-friendly; luxon heavier |
| react-router-dom | TanStack Router | More type-safe; newer ecosystem; less community knowledge |
| setInterval polling | SSE (Server-Sent Events) | More complex backend; real-time push vs pull; SSE requires persistent connection |

**Installation:**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install react-router-dom date-fns chart.js react-chartjs-2
npm install -D tailwindcss @tailwindcss/vite
```

**Version verification:** All versions confirmed via `npm view <package> version` on 2026-06-26.

## Package Legitimacy Audit

| Package | Registry | Age | Downloads | Source Repo | Verdict | Disposition |
|---------|----------|-----|-----------|-------------|---------|-------------|
| react | npm | 12+ yrs | ~149M/wk | github.com/facebook/react | SUS (too-new) | Approved — major release 19.2.7 published 2026-06-01 from Facebook |
| react-dom | npm | 12+ yrs | ~140M/wk | github.com/facebook/react | SUS (too-new) | Approved — paired with react 19.2.7 |
| vite | npm | 6+ yrs | ~140M/wk | github.com/vitejs/vite | SUS (too-new) | Approved — major release 8.1.0 from VoidZero/Vite team |
| tailwindcss | npm | 7+ yrs | ~121M/wk | github.com/tailwindlabs/tailwindcss | SUS (too-new) | Approved — v4.3.1 published 2026-06-12 from Tailwind Labs |
| @tailwindcss/vite | npm | 1+ yr | ~38M/wk | github.com/tailwindlabs/tailwindcss | SUS (too-new) | Approved — official Tailwind Vite plugin |
| chart.js | npm | 13+ yrs | ~13.5M/wk | github.com/chartjs/Chart.js | OK | Approved |
| react-chartjs-2 | npm | 8+ yrs | ~4.3M/wk | github.com/reactchartjs/react-chartjs-2 | OK | Approved |

**Packages removed due to SLOP verdict:** none
**Packages flagged as suspicious SUS:** react, react-dom, vite, tailwindcss, @tailwindcss/vite — all flagged for "too-new" (published within 30 days). These are ALL legitimate packages from established organizations; the SUS verdict is an artifact of recent major releases. The planner does NOT need to add checkpoint tasks for these.
**Packages tagged ASSUMED:** react-router-dom, date-fns — discovered via training knowledge, not yet npm-view verified. Planner must gate each install behind a `checkpoint:human-verify` task.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (React SPA)                       │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │  Login   │  │Dashboard │  │ E-Report │  │  AuthContext │ │
│  │  Page    │──▶  Page    │  │  Page    │  │  (token)    │ │
│  └──────────┘  └────┬─────┘  └──────────┘  └──────┬──────┘ │
│                      │                               │       │
│       ┌──────────────┼──────────────┐                │       │
│       ▼              ▼              ▼                │       │
│  ┌────────┐   ┌──────────┐  ┌────────────┐          │       │
│  │Summary │   │  Line    │  │    Pie     │          │       │
│  │ Cards  │   │  Chart   │  │   Chart    │          │       │
│  └────────┘   └────┬─────┘  └─────┬──────┘          │       │
│                    │               │                  │       │
│       ┌────────────┴───────┬───────┴──────────┐      │       │
│       ▼                    ▼                  ▼      │       │
│  ┌──────────────────────────────────────────────┐    │       │
│  │          usePolling Hook (30s interval)       │    │       │
│  │    Page Visibility API → pause on hidden      │    │       │
│  └────────────────────┬─────────────────────────┘    │       │
│                       │                               │       │
│                       ▼                               │       │
│  ┌──────────────────────────────────────────────┐    │       │
│  │           apiClient (fetch wrapper)            │◀───┘       │
│  │    Attaches Authorization: Bearer <token>      │           │
│  └────────────────────┬─────────────────────────┘           │
└───────────────────────┼─────────────────────────────────────┘
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              VITE DEV PROXY (dev only)                        │
│        /api → http://localhost:3000/api                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              EXPRESS API (Port 3000)                          │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ /api/auth/*  │  │ /api/sales/* │  │ /api/dashboard/*  │ │
│  │ (public)     │  │ (JWT req'd)  │  │ (JWT req'd, NEW)  │ │
│  └──────────────┘  └──────────────┘  └────────┬──────────┘ │
│                                                 │            │
│                        ┌────────────────────────┘            │
│                        ▼                                     │
│              ┌──────────────────┐                            │
│              │ SalesTrend       │                            │
│              │ Repository       │                            │
│              │ findByDateRange  │                            │
│              └────────┬─────────┘                            │
│                       ▼                                      │
│              ┌──────────────────┐                            │
│              │    SQLite DB     │                            │
│              │  (prisma/dev.db) │                            │
│              └──────────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure

```
frontend/
├── index.html                  # Vite entry point
├── vite.config.ts              # Vite config + Tailwind plugin + proxy
├── tsconfig.json               # TypeScript config
├── package.json
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Router + AuthProvider wrapper
│   ├── index.css               # @import "tailwindcss" + dark variant
│   ├── api/
│   │   └── client.ts           # fetch wrapper with Bearer token injection
│   ├── contexts/
│   │   └── AuthContext.tsx      # Token storage, login/logout, user state
│   ├── hooks/
│   │   ├── usePolling.ts       # setInterval + Visibility API hook
│   │   └── useDashboard.ts     # Data fetching + transformation hook
│   ├── pages/
│   │   ├── LoginPage.tsx       # Login form
│   │   ├── DashboardPage.tsx   # Dashboard layout (summary + charts)
│   │   └── EReportPage.tsx     # Placeholder for Phase 3
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx        # Left sidebar navigation
│   │   │   ├── Header.tsx         # Top bar: outlet name + logout
│   │   │   └── DashboardLayout.tsx # Sidebar + Header + content wrapper
│   │   ├── dashboard/
│   │   │   ├── SummaryCards.tsx    # Total revenue + tx count cards
│   │   │   ├── DateFilter.tsx     # Preset buttons + custom date picker
│   │   │   ├── LineChart.tsx      # Revenue trend Line Chart
│   │   │   ├── PieChart.tsx       # Menu popularity Pie Chart
│   │   │   └── EmptyState.tsx     # "Belum ada data" message + CTA
│   │   └── ui/
│   │       ├── Spinner.tsx        # Loading indicator
│   │       └── RefreshButton.tsx  # Manual refresh button
│   ├── lib/
│   │   ├── format.ts           # Rupiah formatting utility
│   │   └── chartConfig.ts      # Chart.js shared defaults (dark theme)
│   └── types/
│       └── dashboard.ts        # TypeScript interfaces for API responses
└── public/
    └── favicon.ico
```

### Pattern 1: Chart.js Tree-Shaking Registration

**What:** Import only required Chart.js components and register them once at module level.

**Why:** Chart.js v4 is fully tree-shakeable. Without explicit registration, components like `Tooltip`, `Legend`, `ArcElement`, `LineElement`, `PointElement`, `CategoryScale`, `LinearScale`, `TimeScale` must be imported and registered from `chart.js` before the chart renders. This reduces bundle size from ~200KB (full import) to ~60-80KB.

**Example:**
```typescript
// Source: react-chartjs-2.js.org (Quickstart)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
```
[CITED: react-chartjs-2.js.org — Quickstart & Tree-shaking docs]

### Pattern 2: Per-Point Color for Decline Detection

**What:** Set `pointBackgroundColor` as a function or array to color individual data points differently — red for revenue drops.

**How:** Compute a color array in the dataset where each index corresponds to a data point. Points where `data[i] < data[i-1]` get `'#EF4444'` (red), others get the default brand color.

**Example:**
```typescript
// Derived from Chart.js pointBackgroundColor docs
const revenueData = [1200000, 1150000, 1300000, 1100000, 1400000];
const pointColors = revenueData.map((val, i) => {
  if (i === 0) return '#FBBF24'; // first point: yellow
  return val < revenueData[i - 1] ? '#EF4444' : '#FBBF24'; // red if decline
});

const dataset = {
  label: 'Omset',
  data: revenueData,
  borderColor: '#FBBF24',
  backgroundColor: 'rgba(251, 191, 36, 0.1)',
  pointBackgroundColor: pointColors,
  pointRadius: 5,
  pointHoverRadius: 7,
};
```
[CITED: chartjs.org/docs/latest/charts/line.html#point-styling]

### Pattern 3: Custom Tooltip Callbacks

**What:** Override the `label` callback in `options.plugins.tooltip.callbacks` for Rupiah formatting on Line Chart and multi-field display on Pie Chart.

**Line Chart tooltip (date + revenue only):**
```typescript
// Source: chartjs.org/docs/latest/configuration/tooltip.html#label-callback
options: {
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          return `Rp ${new Intl.NumberFormat('id-ID').format(context.parsed.y)}`;
        },
        title: (items) => {
          // items[0].label contains the date label from x-axis
          return items[0].label;
        },
      },
    },
  },
}
```

**Pie Chart tooltip (name + percentage + count + revenue):**
```typescript
// Derived from chartjs.org tooltip docs
options: {
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          const item = context.raw; // custom object { name, count, percentage, revenue }
          return [
            `${item.name}`,
            `Persentase: ${item.percentage}%`,
            `Jumlah: ${item.count}`,
            `Omset: Rp ${new Intl.NumberFormat('id-ID').format(item.revenue)}`,
          ];
        },
      },
    },
  },
}
```
[CITED: chartjs.org/docs/latest/configuration/tooltip.html]

### Pattern 4: Vite Dev Proxy for API Calls

**What:** Configure `server.proxy` in `vite.config.ts` to forward `/api/*` requests to the Express backend during development, avoiding CORS issues.

**Why:** In development, Vite runs on `localhost:5173` while Express runs on `localhost:3000`. Without a proxy, every API call is cross-origin and requires CORS configuration. A proxy makes `/api/*` calls behave as same-origin in dev. In production, the built frontend is served from the same origin as the API (or configured with proper CORS).

**Example:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```
[CITED: vite.dev/config/server-options.html#server-proxy]

### Pattern 5: Polling with Page Visibility API

**What:** A custom `usePolling` hook that polls an API endpoint every N seconds, pauses when the browser tab is hidden (using `document.visibilitychange`), and resumes when visible again.

```typescript
// [ASSUMED] — standard React polling pattern
function usePolling(fetchFn: () => Promise<void>, intervalMs: number) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const startPolling = () => {
      fetchFn(); // immediate first fetch
      intervalRef.current = setInterval(fetchFn, intervalMs);
    };

    const stopPolling = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        startPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchFn, intervalMs]);
}
```

### Pattern 6: Tailwind CSS v4 Dark Mode (Class Strategy)

**What:** Override the `dark` variant to use a CSS class selector instead of `prefers-color-scheme`, enabling manual toggle. Add to `index.css`:

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Then add `<html class="dark">` to activate dark mode. Toggle via `document.documentElement.classList.toggle('dark')` and persist in `localStorage`.

[CITED: tailwindcss.com/docs/dark-mode#toggling-dark-mode-manually]

### Anti-Patterns to Avoid

- **Full Chart.js import:** `import Chart from 'chart.js/auto'` pulls in every controller, element, scale, and plugin (~200KB). Use tree-shaken registration instead.
- **Re-creating Chart instances on every render:** Chart.js instances must persist across React re-renders. `react-chartjs-2` handles this, but raw `useRef` + `useEffect` patterns can leak instances if cleanup is missing.
- **Polling without cleanup:** A `setInterval` in `useEffect` without a cleanup return function will continue polling after component unmount, causing memory leaks and stale API calls.
- **Token in URL/localStorage without HttpOnly concerns:** The Phase 1 backend uses Bearer tokens, not cookies. `localStorage` is acceptable for this architecture but XSS-vulnerable. For v1 MVP this is acceptable. [ASSUMED]
- **Hardcoded chart colors:** Chart.js renders on canvas, so Tailwind classes don't apply to chart elements. Define chart colors as JS constants synced with the Tailwind theme.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart rendering | Canvas API or SVG from scratch | Chart.js via react-chartjs-2 | Interactive tooltips, responsive resize, animations, accessibility — all free |
| Date range math | Manual Date arithmetic | date-fns (`subDays`, `startOfMonth`, `format`) | Timezone edge cases, DST transitions, leap years |
| Rupiah formatting | String concatenation with `.toLocaleString()` | `Intl.NumberFormat('id-ID')` | Locale-correct thousands separator (`.`), decimal comma (`,`), currency symbol placement |
| CSS dark mode | Manual CSS variable toggling | Tailwind `dark:` variant with class strategy | Co-located styles, no separate dark theme file, predictable precedence |
| API polling with visibility pause | Manual `setInterval` + `visibilitychange` per component | Single `usePolling` hook | Consistent behavior, no duplicated event listeners, testable in isolation |
| JWT token refresh logic | Custom timer and interceptor | Simple `apiClient.ts` wrapper function | 24h expiry means token refresh is only needed at login; keep it simple |
| Responsive sidebar | CSS-only media queries with manual toggle | Tailwind responsive classes + React state | Co-located responsive behavior, predictable breakpoints (`lg:` for desktop) |

**Key insight:** Chart.js is the most complex integration in this phase. Do NOT attempt to build chart interactions (tooltips, zoom, responsive resize) from scratch. Chart.js provides all of these out of the box with a mature, tested codebase. The `react-chartjs-2` wrapper handles React lifecycle correctly — re-rendering only when `data` or `options` references change.

## Common Pitfalls

### Pitfall 1: CORS Blocking API Calls in Development

**What goes wrong:** The frontend (localhost:5173) makes fetch requests to the API (localhost:3000), and the browser blocks them with CORS errors. The current `app.use(cors())` in `src/app.ts` has no configuration — it uses defaults that may not allow cross-origin requests with credentials.

**Why it happens:** The Express CORS middleware with zero options only adds basic `Access-Control-Allow-Origin: *` headers. For authenticated requests with `Authorization` headers, CORS must explicitly allow the origin and set `Access-Control-Allow-Headers`.

**How to avoid:**
1. **In development:** Use Vite's `server.proxy` to forward `/api/*` → `http://localhost:3000`. This makes API calls same-origin in the browser. No CORS configuration needed.
2. **Fix Express CORS (required anyway):** Update `src/app.ts`:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```
3. Ensure the frontend `apiClient` does NOT use `credentials: 'include'` mode (the backend uses Bearer tokens, not cookies).

**Warning signs:** `Access-Control-Allow-Origin` errors in browser console. API calls succeed from curl/Postman but fail from the browser.

### Pitfall 2: Auth Token Not Sent — httpOnly Cookie Confusion

**What goes wrong:** The CONTEXT.md says "JWT token returned in httpOnly cookie" but the actual code returns `{ token: "..." }` in JSON and expects `Authorization: Bearer <token>`. If the frontend uses `credentials: 'include'` expecting cookies, auth will fail silently.

**Why it happens:** Documentation and code divergence — the Phase 1 auth controller returns tokens in JSON (`res.status(200).json({ data: { token } })`) and the auth middleware reads from the `Authorization` header. No cookies are set anywhere.

**How to avoid:**
- Store the token from `POST /api/auth/login` response in `localStorage` or React state
- Create an `apiClient.ts` wrapper that reads the token and attaches `Authorization: Bearer <token>` to every request
- Use a React Context (`AuthContext`) to manage login/logout state
- On 401 responses, clear the stored token and redirect to login

### Pitfall 3: Chart.js Time Scale Requires Adapter

**What goes wrong:** Line Chart configured with `type: 'time'` on the x-axis fails to render with errors about missing date adapter.

**Why it happens:** Chart.js v4 removed the built-in date adapter. You must install a date adapter package (`chartjs-adapter-date-fns` or `chartjs-adapter-luxon`) or use `type: 'category'` with pre-formatted string labels.

**How to avoid:** Two options:
- **Recommended for this phase:** Use `type: 'category'` x-axis with pre-formatted date strings (e.g., "26 Jun 2026") as labels. No adapter needed. Simpler setup.
- **If time scale needed:** Install `chartjs-adapter-date-fns` (adds ~15KB) and configure `x: { type: 'time', time: { unit: 'day' } }`.

Given the 7-day default view, `category` scale with formatted labels is sufficient and avoids the adapter dependency. [ASSUMED]

### Pitfall 4: Empty State Crashes Chart.js

**What goes wrong:** Chart.js throws errors when passed empty `data` arrays or `undefined` datasets.

**Why it happens:** Chart.js requires at minimum empty `labels: []` and `datasets: [{ data: [] }]`. Passing `undefined` or `null` for either causes runtime errors.

**How to avoid:**
- Always initialize chart data with empty arrays: `{ labels: [], datasets: [{ data: [], ... }] }`
- Conditionally render `<EmptyState />` when the API returns 0 records
- The chart component itself should gracefully handle 0 data points with an empty canvas

### Pitfall 5: 24pt Font Requirement on Canvas

**What goes wrong:** OPENCODE.md mandates "Font min 24pt (data finansial)" but Chart.js renders on canvas — Tailwind text size classes don't apply.

**Why it happens:** Canvas text is styled via Chart.js font options, not CSS. The `24pt` requirement applies to surrounding HTML (summary cards, labels) but chart tooltips and labels are set via `font.size` in Chart.js options.

**How to avoid:**
- Summary cards: Use `text-2xl` (24px ≈ 18pt) — actually you need ~32px for 24pt. Use `text-3xl` (30px) or a custom value `text-[24pt]`.
- Chart.js tooltips: Set `bodyFont: { size: 12 }`, `titleFont: { size: 14 }` — these are px values and are typically smaller than surrounding text
- Chart axis labels: Set via `scales.x.ticks.font.size`
- **Clarification needed:** The 24pt rule likely applies to financial numbers in summary cards, not chart internal labels. Chart labels at 24pt would overflow. Tag: [ASSUMED]

### Pitfall 6: React 19 + react-chartjs-2 Compatibility

**What goes wrong:** react-chartjs-2 v5.3.1 may not have explicit React 19 peer dependency support.

**Why it happens:** react-chartjs-2 v5 was released for React 18. React 19 was released later. The package `peerDependencies` may specify `react: "^16.8.0 || ^17.0.0 || ^18.0.0"`.

**How to avoid:**
- Check `npm view react-chartjs-2 peerDependencies` before installing
- If React 19 is not listed, install with `--legacy-peer-deps` or use npm overrides
- Test chart rendering immediately after scaffold — if it works, no further action needed
- Most React 18-compatible libraries work with React 19 without changes due to React's backward compatibility

## Code Examples

### Rupiah Formatting Utility

```typescript
// src/lib/format.ts
// [CITED: MDN Intl.NumberFormat] — standard browser API

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  // Returns "Rp 12.345.678"
  return rupiahFormatter.format(amount);
}

export function formatCompactRupiah(amount: number): string {
  // Returns "Rp 12,3 jt" for large numbers — useful for chart axis labels
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(1)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} jt`;
  }
  return formatRupiah(amount);
}
```

### API Client with Bearer Token

```typescript
// src/api/client.ts
// [ASSUMED] — standard pattern, verified against codebase auth mechanism

const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('restopulse_token');
}

export function setToken(token: string): void {
  localStorage.setItem('restopulse_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('restopulse_token');
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearToken();
    window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function get<T>(endpoint: string): Promise<T> {
  return apiClient<T>(endpoint, { method: 'GET' });
}

export async function post<T>(endpoint: string, body: unknown): Promise<T> {
  return apiClient<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
```

### Dashboard Data Fetching Hook

```typescript
// src/hooks/useDashboard.ts
// [ASSUMED] — standard pattern

import { useState, useCallback } from 'react';
import { get } from '../api/client';
import { usePolling } from './usePolling';

interface DashboardData {
  trends: Array<{ date: string; revenue: number; menu_popularity: string }>;
  totalRevenue: number;
  dayCount: number;
}

interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export function useDashboard(dateRange: DateRange) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const result = await get<{ success: boolean; data: DashboardData }>(
        `/dashboard?start=${dateRange.start}&end=${dateRange.end}`
      );
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  }, [dateRange.start, dateRange.end]);

  // Auto-poll every 30s, pause when tab hidden
  usePolling(fetchDashboard, 30000);

  // Manual refresh
  const refresh = useCallback(() => {
    setLoading(true);
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, loading, error, refresh };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tailwind CSS v3 `tailwind.config.js` + PostCSS | Tailwind CSS v4 `@tailwindcss/vite` plugin + CSS-first config | v4.0 (2025) | No JS config file; everything in CSS with `@theme` |
| `createRoot(document.getElementById('root')!)` | React 19 no longer requires explicit `createRoot` in some setups | 19.0 (2024) | Simplified entry point (still supported either way) |
| Chart.js `import Chart from 'chart.js/auto'` | Tree-shaken `ChartJS.register(...)` | v4.0 (2023) | ~60% bundle reduction for minimal chart types |
| `cors()` with no options | Explicit `cors({ origin, credentials })` | Best practice | Security: prevents arbitrary origins from accessing API |

**Deprecated/outdated:**
- **Tailwind CSS v3 `tailwind.config.js`:** Replaced by `@import "tailwindcss"` + `@theme` in CSS. The `@tailwindcss/vite` plugin handles everything.
- **`chartjs-adapter-moment`:** moment.js is legacy. Use `chartjs-adapter-date-fns` or avoid time scale entirely.
- **`react-chartjs-2` `<Chart>` component:** Replaced by individual chart components (`<Line>`, `<Pie>`, `<Bar>`, etc.) in v4+.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `react-router-dom` v7 is the appropriate router library for this SPA | Standard Stack | Low — any React router works; TanStack Router is alternative |
| A2 | `date-fns` v4 is the best date library for this use case | Standard Stack | Low — dayjs or native Date can substitute |
| A3 | Chart.js `category` scale is sufficient for 7-30 day views; time scale adapter not needed | Common Pitfalls #3 | Low — if custom date formatting is needed, just install adapter |
| A4 | 24pt font rule applies to summary cards and surrounding HTML, not chart internal labels | Common Pitfalls #5 | Medium — if chart labels must also be 24pt, Chart.js config needs significant adjustment |
| A5 | React 19 works with react-chartjs-2 v5.3.1 without compatibility issues | Common Pitfalls #6 | Medium — if incompatible, need to downgrade React to 18 or use raw Chart.js |
| A6 | A new `GET /api/dashboard?start=&end=` endpoint is the best approach (reads SalesTrend) | Architecture Patterns | Medium — alternative is querying `GET /api/sales` and doing client-side aggregation |
| A7 | CORS proxy in Vite dev is sufficient; production will need proper CORS on Express | Common Pitfalls #1 | Low — both approaches work; production CORS is already needed |

## Open Questions

1. **New dashboard API endpoint: server-side or client-side aggregation?**
   - What we know: SalesTrend table has pre-computed data. No dashboard endpoint exists. `GET /api/sales` returns DailySales records (raw, not aggregated).
   - What's unclear: Whether to create a new `/api/dashboard` endpoint on the backend (recommended — reads SalesTrend directly) or reuse `GET /api/sales` and aggregate on the client.
   - Recommendation: Create `GET /api/dashboard?start=YYYY-MM-DD&end=YYYY-MM-DD` endpoint that reads from SalesTrend via `SalesTrendRepository.findByDateRange()`. This leverages the CQRS-lite architecture and keeps the frontend thin. The endpoint should return: `{ trends: SalesTrend[], summary: { totalRevenue, dayCount } }`.

2. **Login page: separate route or modal?**
   - What we know: Phase 1 provides `POST /api/auth/login`. The CONTEXT.md doesn't specify login page details.
   - What's unclear: Whether the login page is part of Phase 2 or handled by Phase 1 (backend-only).
   - Recommendation: Include a minimal Login page in this phase. The dashboard cannot be accessed without authentication, so the login page is a prerequisite. It should be part of the frontend scaffold (Plan 02-01 or 02-02).

3. **Chart.js dark theme: exact color values?**
   - What we know: Dark background, white/yellow text, red warning indicators. 24pt font for financial data.
   - What's unclear: Exact hex values for chart grid lines, axis labels, tooltip backgrounds, legend colors.
   - Recommendation: Use a consistent Tokopedia/Gojek-inspired dark palette:
     - Background: `#1a1a2e` or `bg-gray-950`
     - Card background: `#16213e` or `bg-gray-900`
     - Primary text: `#ffffff` (white)
     - Accent/yellow: `#fbbf24` (amber-400)
     - Revenue line: `#fbbf24` (yellow)
     - Decline indicator: `#ef4444` (red-500)
     - Chart grid: `rgba(255,255,255,0.1)`
     - Tooltip bg: `rgba(0,0,0,0.85)`

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Vite build tool, npm | ✓ | v22.22.2 | — |
| npm | Package installation | ✓ | (bundled) | — |
| Express API (port 3000) | Data source for dashboard | ✗ (not running) | — | Start backend with `npm run dev` |

**Missing dependencies with no fallback:**
- Express API must be running for the frontend to fetch data. Planner must include a task to verify the backend is running (`npm run dev` in root) before frontend development starts.

**Missing dependencies with fallback:**
- None identified — all frontend dependencies are npm-installable.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (bundled with Vite ecosystem) + React Testing Library |
| Config file | none — see Wave 0 |
| Quick run command | `npx vitest run` |
| Full suite command | `npx vitest run --coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DASH-01 | Line Chart renders with correct data points from API response | unit | `npx vitest run src/components/dashboard/__tests__/LineChart.test.tsx` | ❌ Wave 0 |
| DASH-02 | Pie Chart renders with correct menu segments | unit | `npx vitest run src/components/dashboard/__tests__/PieChart.test.tsx` | ❌ Wave 0 |
| DASH-03 | Tooltip displays Rupiah amount on point hover (Line Chart) and menu detail (Pie Chart) | unit | `npx vitest run src/components/dashboard/__tests__/LineChart.test.tsx` (included above) | ❌ Wave 0 |
| DASH-01-D2 | Summary cards show correct total revenue + day count | unit | `npx vitest run src/components/dashboard/__tests__/SummaryCards.test.tsx` | ❌ Wave 0 |
| SC-4 | Data refreshes within 3 seconds (polling works) | integration | Manual test with `waitFor` in polling hook test | ❌ Wave 0 |
| SC-5 | Page loads within 4 seconds on 4G | e2e / manual | Lighthouse audit — not automatable in unit tests | ❌ Manual only |

### Sampling Rate

- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run --coverage`
- **Phase gate:** All unit tests passing + manual Lighthouse audit for page load time

### Wave 0 Gaps

- [ ] `frontend/vitest.config.ts` — Vitest configuration with jsdom environment
- [ ] `frontend/src/components/dashboard/__tests__/LineChart.test.tsx` — covers DASH-01, DASH-03
- [ ] `frontend/src/components/dashboard/__tests__/PieChart.test.tsx` — covers DASH-02, DASH-03
- [ ] `frontend/src/components/dashboard/__tests__/SummaryCards.test.tsx` — covers summary cards
- [ ] `frontend/src/components/dashboard/__tests__/EmptyState.test.tsx` — covers D-09
- [ ] `frontend/src/hooks/__tests__/usePolling.test.ts` — covers D-10, D-11, D-13
- [ ] `frontend/src/lib/__tests__/format.test.ts` — covers Rupiah formatting edge cases
- [ ] `frontend/src/lib/__tests__/chartConfig.test.ts` — covers chart dark theme defaults
- [ ] Install Vitest + @testing-library/react + jsdom: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | JWT Bearer token in `Authorization` header; 24h expiry; login via `POST /api/auth/login` |
| V3 Session Management | yes | Stateless JWT — no server-side session; token stored in localStorage; cleared on logout/401 |
| V4 Access Control | yes | Every API request validated by `authMiddleware` which extracts and verifies JWT; all data scoped to `outlet_id` from token |
| V5 Input Validation | yes | Date range params validated with Zod on backend (`dateRangeSchema`); frontend should validate format before sending |
| V6 Cryptography | yes | bcrypt cost 12 for password hashing (backend); JWT signed with HS256 (backend) — frontend never handles crypto keys |

### Known Threat Patterns for React SPA + Chart.js

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via `dangerouslySetInnerHTML` | Information Disclosure | Never render user data as HTML; use React's default text escaping |
| Token theft via XSS | Elevation of Privilege | Token in localStorage is XSS-readable; accept this risk for MVP v1 (mitigated by 24h expiry) |
| CSRF on login endpoint | Elevation of Privilege | JWT in `Authorization` header (not cookie) means CSRF is not applicable — browser won't auto-attach custom headers |
| Chart.js canvas rendering XSS | Tampering | Chart.js renders on canvas, not DOM — no XSS vector via chart data |
| Sensitive data in chart labels | Information Disclosure | Revenue data is shown on dashboard — intentional. Auth wall prevents unauthorized access |
| Polling endpoint enumeration | Information Disclosure | Polling endpoint is JWT-protected; rate limiting on `/api/auth` prevents brute force; no rate limit on `/api/dashboard` (Phase 4 concern) |

## Sources

### Primary (HIGH confidence)

- Codebase analysis (`src/app.ts`, `src/server.ts`, `src/middleware/authMiddleware.ts`, `src/controllers/AuthController.ts`, `src/controllers/SalesController.ts`, `src/services/SalesService.ts`, `src/repositories/SalesTrendRepository.ts`) — auth mechanism, CORS config, data schema, existing patterns [VERIFIED: codebase]
- `prisma/schema.prisma` — SalesTrend table structure, field types [VERIFIED: codebase]

### Secondary (MEDIUM confidence)

- [chartjs.org/docs/latest/](https://www.chartjs.org/docs/latest/) — Line Chart configuration, tooltip callbacks, point styling, tree-shaking [CITED]
- [tailwindcss.com/docs/dark-mode](https://tailwindcss.com/docs/dark-mode) — Tailwind v4 dark mode class strategy [CITED]
- [tailwindcss.com/docs/installation/using-vite](https://tailwindcss.com/docs/installation/using-vite) — Tailwind v4 Vite plugin setup [CITED]
- [vite.dev/config/server-options.html](https://vite.dev/config/server-options.html) — Vite proxy configuration [CITED]
- [vite.dev/guide/](https://vite.dev/guide/) — Vite scaffold and project setup [CITED]
- [react-chartjs-2.js.org](https://react-chartjs-2.js.org/) — react-chartjs-2 v5 Quickstart and tree-shaking [CITED]

### Tertiary (LOW confidence)

- react-router-dom v7 API patterns — [ASSUMED] from training knowledge
- date-fns v4 usage patterns — [ASSUMED] from training knowledge
- Vitest + React Testing Library setup — [ASSUMED] from training knowledge

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all package versions verified via `npm view`. Chart.js and react-chartjs-2 are mature, documented packages.
- Architecture: HIGH — codebase reveals exact auth mechanism (Bearer token, not cookies), CORS gap, and missing dashboard endpoint. Structure recommendations are standard React SPA patterns.
- Pitfalls: HIGH — the CORS/auth mismatch between documentation and code is a verified, concrete issue. Chart.js pitfalls are documented in official docs.

**Research date:** 2026-06-26
**Valid until:** 2026-07-26 (30 days — React/Vite/Tailwind ecosystems move fast)
