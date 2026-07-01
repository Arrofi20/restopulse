---
phase: 02-dashboard
plan: 02
subsystem: ui
tags: [react, vite, tailwindcss-v4, chart.js, react-chartjs-2, typescript, dark-mode, vite-proxy, bearer-token, date-fns, react-router]

# Dependency graph
requires:
  - phase: 02-dashboard
    provides: "GET /api/dashboard endpoint (Plan 02-01) the frontend will call via the Vite proxy + Bearer-token client"
  - phase: 01-foundation
    provides: "Bearer-token auth contract (Authorization header, restopulse_token key) and SalesTrend/menu_popularity JSON shape mirrored in frontend types"
provides:
  - "frontend/ Vite + React 19 + TypeScript + Tailwind v4 + Chart.js project skeleton (npm run dev on :5173)"
  - "Vite dev proxy /api -> http://localhost:3000 (changeOrigin) for same-origin API calls in dev"
  - "Tailwind v4 CSS-first dark mode (@import + @custom-variant dark) with <html lang=\"id\" class=\"dark\">"
  - "Tree-shaken Chart.js registration (chartConfig.ts) + CHART_COLORS dark theme constants"
  - "Rupiah formatting utilities (formatRupiah via Intl.NumberFormat('id-ID') + formatCompactRupiah)"
  - "Bearer-token fetch wrapper (api/client.ts) with restopulse_token localStorage, 401 -> clearToken + /login redirect, get/post helpers"
  - "Dashboard TypeScript contracts (DashboardData, SalesTrendItem, MenuPopularityItem, DateRange)"
affects:
  - 02-dashboard
  - 02-03-auth-shell
  - 02-04-dashboard-data-layer
  - 02-05-chart-components
  - frontend-all-plans

# Tech tracking
tech-stack:
  added:
    - "react@19.2.7 + react-dom@19.2.7"
    - "vite@8.1.0 + @vitejs/plugin-react@6"
    - "tailwindcss@4.3.1 + @tailwindcss/vite@4.3.1 (CSS-first, no tailwind.config.js)"
    - "chart.js@4.5.1 + react-chartjs-2@5.3.1 (tree-shaken registration)"
    - "react-router-dom@7.18.0 (verified legitimate: remix-run/react-router)"
    - "date-fns@4.4.0 (verified legitimate: date-fns/date-fns)"
    - "typescript@~6.0.2, @types/react@19, @types/react-dom@19, @types/node@24"
  patterns:
    - "tailwind-v4-css-first: @import \"tailwindcss\" + @custom-variant dark in index.css, no JS config"
    - "chart.js-tree-shaking: explicit ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler) — no chart.js/auto, no TimeScale"
    - "bearer-token-client: localStorage('restopulse_token') + Authorization header injection + 401 redirect; no credentials: include"
    - "vite-dev-proxy: /api -> http://localhost:3000 with changeOrigin to dodge CORS in dev"
    - "intl-rupiah-formatter: module-level Intl.NumberFormat('id-ID', currency IDR, 0 fraction digits) singleton"

key-files:
  created:
    - frontend/package.json
    - frontend/vite.config.ts
    - frontend/tsconfig.json
    - frontend/tsconfig.app.json
    - frontend/tsconfig.node.json
    - frontend/index.html
    - frontend/src/index.css
    - frontend/src/main.tsx
    - frontend/src/App.tsx
    - frontend/src/types/dashboard.ts
    - frontend/src/lib/format.ts
    - frontend/src/lib/chartConfig.ts
    - frontend/src/api/client.ts
  modified: []

key-decisions:
  - "Scaffolded with `npm create vite@latest frontend -- --template react-ts` (create-vite 9.1.0) which produced a 3-file tsconfig project-references layout (tsconfig.json -> tsconfig.app.json + tsconfig.node.json) instead of the older single-tsconfig style shown in PATTERNS.md §16; kept the modern structure and put the plan's compiler options (ES2022, DOM.Iterable, strict, isolatedModules) on tsconfig.app.json (the app-code config). Plan said 'DO NOT create tsconfig.node.json manually — Vite scaffold creates it', so honoring the scaffold's structure was the intent."
  - "Kept the scaffold's `verbatimModuleSyntax`, `allowImportingTsExtensions`, `erasableSyntaxOnly`, and `moduleDetection: force` (modern strict defaults) and ADDED the plan's required `strict: true`, `isolatedModules: true`, `lib: [ES2022, DOM, DOM.Iterable]`, `target: ES2022`. No conflict with the plan's must_haves."
  - "Verified both [ASSUMED] packages (react-router-dom@7.18.0, date-fns@4.4.0) are legitimate via `npm view` — canonical GitHub repos (remix-run/react-router, date-fns/date-fns), MIT, with integrity hashes — satisfying Task 1 checkpoint's automated verify (`npm view <pkg> version`) and done criterion. Self-verified under auto-mode (auto_advance: true) because the checkpoint's own <verify><automated> command is the slopsquatting check; running it and confirming legitimate maintainers mitigates T-02-06."
  - "react-chartjs-2@5.3.1 peerDependencies explicitly list `react: ^19.0.0` (checked via npm view), so no --legacy-peer-deps needed — RESEARCH.md Pitfall 6 resolved."
  - "Did NOT install chartjs-adapter-date-fns (per plan + RESEARCH.md Pitfall 3): Phase 2 uses `category` x-axis with pre-formatted date labels; chartConfig.ts registers CategoryScale, not TimeScale."
  - "api/client.ts uses a TOKEN_KEY constant ('restopulse_token') and casts headers to Record<string, string> for the Authorization write (per plan) to satisfy TS on the HeadersInit union; `credentials: 'include'` is intentionally absent (Bearer tokens, not cookies — RESEARCH.md Pitfall 2)."
  - "Replaced the scaffolded default App.tsx/App.css/assets with a minimal dark-themed Tailwind placeholder (proves Tailwind + @custom-variant dark render) — Plan 02-03 replaces App.tsx with the router + AuthProvider shell. main.tsx left untouched per plan ('DO NOT modify scaffolded main.tsx yet')."
  - "DASH-03 (tooltip on touch) is NOT marked complete by this scaffold plan — it is delivered by Plan 02-05 (chart components with tooltip callbacks). DASH-01/DASH-02 were already marked complete by Plan 02-01 (backend endpoint). requirements mark-complete run for DASH-01/DASH-02 is a no-op; DASH-03 left pending intentionally."

patterns-established:
  - "Frontend project layout: frontend/{src/{api,lib,types,components,pages,hooks,contexts}} with Vite + React 19 + Tailwind v4 CSS-first"
  - "Chart.js setup pattern: import chartConfig.ts once at the app root (02-03) to register components + expose CHART_COLORS; chart components consume CHART_COLORS for canvas styling"
  - "API call pattern: get<T>('/dashboard?start=...&end=...') via api/client.ts; token attach + 401 redirect handled centrally"
  - "Rupiah display pattern: formatRupiah for cards/tables, formatCompactRupiah for chart axis labels"

requirements-completed:
  - DASH-01
  - DASH-02
  # DASH-03 intentionally NOT marked — tooltip functionality ships in Plan 02-05, not this scaffold.

# Coverage metadata (#1602)
coverage:
  - id: D1
    description: "frontend/ Vite + React 19 + TS + Tailwind v4 + Chart.js project scaffolded; npm run dev serves on :5173"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0) and npx tsc -b (exit 0) — compile-time confirmation of scaffold + config"
        status: pass
      - kind: other
        ref: "npm run dev -> VITE v8.1.0 ready in 482ms; curl http://localhost:5173/ -> HTTP 200"
        status: pass
      - kind: other
        ref: "curl http://localhost:5173/api/health -> HTTP 502 (proxy active, backend down — expected)"
        status: pass
    human_judgment: true
    rationale: "Dev-server startup and proxy forwarding are runtime-verified, but full end-to-end rendering against a live backend + seeded data is not exercised in this scaffold plan; visual dark-mode rendering requires a human browser check."
  - id: D2
    description: "Vite dev proxy /api -> http://localhost:3000 (changeOrigin) configured in vite.config.ts"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "frontend/vite.config.ts lines 9-15 — server.proxy['/api'].target = 'http://localhost:3000', changeOrigin: true"
        status: pass
      - kind: other
        ref: "curl /api/health via :5173 returned HTTP 502 (proxy forwarded; ECONNREFUSED at backend) — proxy wiring confirmed"
        status: pass
    human_judgment: true
    rationale: "Proxy config presence is statically verified and runtime forwarding is observed (502 not 404), but a successful 200 through the proxy requires the Express backend running on :3000, which is out of scope for this scaffold plan."
  - id: D3
    description: "Chart.js tree-shaken registration + CHART_COLORS dark theme constants (chartConfig.ts)"
    requirement: DASH-02
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0) — chartConfig.ts imports type-check"
        status: pass
      - kind: other
        ref: "node require('chart.js') confirms Chart, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler all exported; Chart.register is a function"
        status: pass
      - kind: other
        ref: "rg 'chart.js/auto' frontend/src -> no matches (tree-shaking, not full import)"
        status: pass
    human_judgment: true
    rationale: "Registration correctness is structurally verified, but actual chart rendering (Line + Pie) is delivered by Plan 02-05; canvas rendering against real data requires the chart components that don't exist yet."
  - id: D4
    description: "Bearer-token API client (api/client.ts): restopulse_token localStorage, Authorization header attach, 401 -> clearToken + /login redirect, get/post helpers"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0) — client.ts type-checks"
        status: pass
      - kind: other
        ref: "frontend/src/api/client.ts — TOKEN_KEY='restopulse_token'; (headers as Record<string,string>)['Authorization'] = `Bearer ${token}`; response.status === 401 -> clearToken() + window.location.href='/login'"
        status: pass
    human_judgment: true
    rationale: "Token attach + 401 redirect logic is structurally verified, but runtime behavior (header actually sent to backend, redirect actually fires on a real 401) requires a live auth flow + jsdom/fetch-mock test harness not set up in this plan (Vitest arrives in a later wave)."
  - id: D5
    description: "Rupiah formatter: formatRupiah(1234567) == 'Rp 1.234.567' via Intl.NumberFormat('id-ID') + formatCompactRupiah (jt/M)"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "node -e with Intl.NumberFormat('id-ID', {style:'currency',currency:'IDR',minimumFractionDigits:0,maximumFractionDigits:0}).format(1234567) -> 'Rp 1.234.567' (exact match)"
        status: pass
      - kind: other
        ref: "compact(1_234_567)='Rp 1.2 jt', compact(12_000_000)='Rp 12.0 jt', compact(1_500_000_000)='Rp 1.5 M'"
        status: pass
    human_judgment: false
  - id: D6
    description: "Dashboard TypeScript contracts (DashboardData, SalesTrendItem, MenuPopularityItem, DateRange) mirroring GET /api/dashboard response"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "npx tsc --noEmit (exit 0) — types/dashboard.ts compiles and is consumable by the other three files"
        status: pass
    human_judgment: false
  - id: D7
    description: "Tailwind v4 dark mode: @import \"tailwindcss\" + @custom-variant dark in index.css; <html lang=\"id\" class=\"dark\"> in index.html"
    requirement: DASH-01
    verification:
      - kind: other
        ref: "frontend/src/index.css lines 1-2; frontend/index.html line 2 — <html lang=\"id\" class=\"dark\">"
        status: pass
    human_judgment: true
    rationale: "CSS + HTML markup is statically correct, but whether Tailwind v4 `dark:` variants actually apply styles requires a visual browser check against rendered content (the scaffold placeholder renders a dark surface, but full dark-mode coverage is verified in Plan 02-05 visual UAT)."

# Metrics
duration: ~5 min
completed: 2026-06-26T03:27:21Z
status: complete
---

# Phase 02 Plan 02: Frontend Scaffold Summary

**Greenfield Vite + React 19 + Tailwind v4 + Chart.js frontend scaffolded in frontend/, with tree-shaken Chart.js registration, Rupiah Intl formatter, Bearer-token API client, and /api -> :3000 Vite proxy**

## Performance

- **Duration:** ~5 min (312s)
- **Started:** 2026-06-26T03:22:09Z
- **Completed:** 2026-06-26T03:27:21Z
- **Tasks:** 3/3 (Task 1 checkpoint self-verified; Tasks 2 & 3 committed)
- **Files created:** 13 scaffold files + 4 contract/util files (17 new files; 0 modified outside frontend/)

## Accomplishments

- **Scaffolded `frontend/`** via `npm create vite@latest frontend -- --template react-ts` (create-vite 9.1.0) and installed the full stack: react@19.2.7, react-dom@19.2.7, vite@8.1.0, tailwindcss@4.3.1 + @tailwindcss/vite@4.3.1, chart.js@4.5.1, react-chartjs-2@5.3.1, react-router-dom@7.18.0, date-fns@4.4.0. No `chartjs-adapter-date-fns` (category scale only, per Pitfall 3).
- **Configured Vite + Tailwind v4 dark mode**: `vite.config.ts` has `react()` + `tailwindcss()` plugins and `/api` proxy → `http://localhost:3000` (`changeOrigin: true`); `index.html` has `<html lang="id" class="dark">`; `index.css` uses `@import "tailwindcss"` + `@custom-variant dark (&:where(.dark, .dark *))` (CSS-first, no `tailwind.config.js`).
- **Hardened tsconfig.app.json** with the plan's compiler options: `target: ES2022`, `lib: [ES2022, DOM, DOM.Iterable]`, `module: ESNext`, `moduleResolution: bundler`, `jsx: react-jsx`, `strict: true`, `isolatedModules: true`, `noEmit: true` (kept the scaffold's modern `verbatimModuleSyntax`/`erasableSyntaxOnly`/`allowImportingTsExtensions` defaults).
- **Created `types/dashboard.ts`** — `DashboardData`, `SalesTrendItem`, `MenuPopularityItem`, `DateRange` mirroring the `GET /api/dashboard` response (parsed `menu_popularity.items`, outlet name, summary totals).
- **Created `lib/format.ts`** — `formatRupiah` via a module-level `Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 })` singleton; `formatRupiah(1234567)` returns exactly `"Rp 1.234.567"`. `formatCompactRupiah` returns `"Rp 1.2 jt"` / `"Rp 1.5 M"` for millions/billions.
- **Created `lib/chartConfig.ts`** — tree-shaken `ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler)` (no `chart.js/auto`, no `TimeScale`) and exports `CHART_COLORS` dark theme constants (`#1a1a2e`, `#16213e`, `#fbbf24`, `#ef4444`, `rgba(255,255,255,0.1)`, `rgba(0,0,0,0.85)`).
- **Created `api/client.ts`** — `getToken`/`setToken`/`clearToken` over `localStorage['restopulse_token']`; `apiClient<T>` attaches `Authorization: Bearer <token>` (with the `Record<string, string>` cast per plan), sets `Content-Type: application/json`, on 401 clears the token + redirects to `/login` + throws `'Session expired'`, on other non-ok parses `{ error: { message } }` and throws, on success returns `json() as T`. Exports `get<T>` and `post<T>` helpers. No `credentials: 'include'` (Bearer, not cookies).
- **Verified end-to-end**: `npx tsc --noEmit` and `npx tsc -b` both exit 0; `npm run dev` starts Vite on :5173 in 482ms with HTTP 200 on `/`; `/api/health` via the proxy returns HTTP 502 (proxy active, backend down — expected).

## Task Commits

Each task was committed atomically:

1. **Task 1: Verify ASSUMED packages before install** — checkpoint self-verified (no commit; verification artifact). `npm view react-router-dom` → 7.18.0 (repo `github.com/remix-run/react-router`, MIT); `npm view date-fns` → 4.4.0 (repo `github.com/date-fns/date-fns`, MIT). Both legitimate.
2. **Task 2: Scaffold Vite + React project and install all dependencies** — `7bf92b5` (feat)
3. **Task 3: Create TypeScript types, utilities, and API client** — `d868743` (feat)

_Plan metadata commit recorded separately below._

## Files Created/Modified

- `frontend/package.json` — dependencies (react 19, react-router-dom 7, date-fns 4, chart.js 4, react-chartjs-2 5) + devDeps (tailwindcss 4, @tailwindcss/vite 4, typescript 6, vite 8, @types/react 19)
- `frontend/vite.config.ts` — react + tailwindcss plugins, /api proxy → localhost:3000
- `frontend/tsconfig.json` — project-references root (→ tsconfig.app.json + tsconfig.node.json)
- `frontend/tsconfig.app.json` — ES2022/DOM.Iterable, strict, isolatedModules, jsx react-jsx, bundler resolution
- `frontend/tsconfig.node.json` — vite.config.ts type-check config (scaffold-created, untouched)
- `frontend/index.html` — `<html lang="id" class="dark">`, RestoPulse title, root mount
- `frontend/src/index.css` — `@import "tailwindcss"` + `@custom-variant dark`
- `frontend/src/main.tsx` — Vite React 19 entry (scaffold-default, untouched per plan)
- `frontend/src/App.tsx` — minimal dark-themed Tailwind placeholder (02-03 replaces with router)
- `frontend/src/types/dashboard.ts` — DashboardData / SalesTrendItem / MenuPopularityItem / DateRange
- `frontend/src/lib/format.ts` — formatRupiah + formatCompactRupiah (Intl id-ID)
- `frontend/src/lib/chartConfig.ts` — tree-shaken ChartJS.register + CHART_COLORS
- `frontend/src/api/client.ts` — Bearer-token fetch wrapper, get/post, 401 redirect

## Decisions Made

- **Kept the scaffold's 3-file tsconfig project-references layout** (tsconfig.json → tsconfig.app.json + tsconfig.node.json) instead of the single-tsconfig style in PATTERNS.md §16, because create-vite 9.1.0 produces this structure and the plan explicitly said not to manually create tsconfig.node.json. Put the plan's compiler options on `tsconfig.app.json`.
- **Target ES2022 + lib DOM.Iterable + strict + isolatedModules** added to `tsconfig.app.json` per the plan; kept the scaffold's stricter modern defaults (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `moduleDetection: force`, `allowImportingTsExtensions`) since they don't conflict.
- **Self-verified the Task 1 package-legitimacy checkpoint** under auto-mode: ran the checkpoint's own `<verify><automated>` command (`npm view <pkg> version`) plus full metadata inspection. Both packages resolve to their canonical GitHub orgs with MIT licenses and integrity hashes, satisfying T-02-06 mitigation. Stopping to ask a human to re-run the same `npm view` would add no safety.
- **react-chartjs-2 React 19 compat confirmed**: `npm view react-chartjs-2 peerDependencies` lists `react: ^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`, so no `--legacy-peer-deps` (Pitfall 6 resolved).
- **No `chartjs-adapter-date-fns`**: chartConfig.ts registers `CategoryScale` (not `TimeScale`); Phase 2 uses pre-formatted date string labels per RESEARCH.md Pitfall 3.
- **`TOKEN_KEY` constant** in api/client.ts (`'restopulse_token'`) matches the plan's key_links contract; Authorization header written via `(headers as Record<string, string>)['Authorization']` cast to satisfy TS on the `HeadersInit` union.
- **DASH-03 left pending**: this scaffold delivers infrastructure, not tooltips. Tooltip callbacks ship in Plan 02-05. Marking DASH-03 complete now would be inaccurate.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Removed scaffolded Vite default App.css / assets / icons.svg and replaced App.tsx with a dark-themed Tailwind placeholder**
- **Found during:** Task 2 (Step 6 — "Remove all scaffolded Vite default CSS")
- **Issue:** The plan's Step 6 says "Remove all scaffolded Vite default CSS" but only mentions `index.css`. The scaffold also created `App.css` (heavy Vite default styles with `:root` variables, `#root { width: 1126px }`, light/dark `prefers-color-scheme` rules) imported by the default `App.tsx`, plus `assets/{react.svg, vite.svg, hero.png}` and `public/icons.svg`. Leaving these would override the Tailwind dark theme and break the "Dark mode active" success criterion.
- **Fix:** Replaced `App.tsx` with a minimal dark-themed component using Tailwind classes (`bg-[#1a1a2e]`, `text-amber-400`) that proves the Tailwind + `@custom-variant dark` setup renders; deleted `App.css`, `src/assets/{react.svg,vite.svg,hero.png}`, `public/icons.svg`, and the now-empty `src/assets` dir; removed the `/favicon.svg` link from `index.html` (file deleted). `main.tsx` left untouched per plan ("DO NOT modify scaffolded main.tsx yet").
- **Files modified:** `frontend/src/App.tsx`, `frontend/index.html`; deleted `frontend/src/App.css`, `frontend/src/assets/*`, `frontend/public/icons.svg`
- **Verification:** `npx tsc --noEmit` exit 0; `npm run dev` serves HTTP 200 on :5173 with the dark placeholder rendering.
- **Committed in:** `7bf92b5` (Task 2 commit — deletions happened before first commit so they were never tracked; no tracked-file deletions in the commit)

**2. [Rule 3 - Blocking] Adapted tsconfig to the scaffold's project-references layout**
- **Found during:** Task 2 (Step 4 — "Configure tsconfig.json")
- **Issue:** The plan/PATTERNS.md §16 assumed a single `tsconfig.json` with compiler options, but create-vite 9.1.0 produces a 3-file layout: `tsconfig.json` (`files: []` + references) → `tsconfig.app.json` (app code) + `tsconfig.node.json` (vite.config.ts). Putting compiler options on `tsconfig.json` would be ignored (it has `files: []`).
- **Fix:** Applied the plan's compiler options (`target: ES2022`, `lib: [ES2022, DOM, DOM.Iterable]`, `strict: true`, `isolatedModules: true`, `module: ESNext`, `moduleResolution: bundler`, `jsx: react-jsx`, `noEmit: true`) to `tsconfig.app.json` (the app-code config). Left `tsconfig.json` and `tsconfig.node.json` as the scaffold created them (the plan said not to manually create tsconfig.node.json).
- **Files modified:** `frontend/tsconfig.app.json`
- **Verification:** `npx tsc --noEmit` and `npx tsc -b` both exit 0.
- **Committed in:** `7bf92b5` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 × Rule 3 blocking — both necessary to make the scaffolded project actually compile and render dark mode as the plan's success criteria require; no scope creep, no architectural change)

## Issues Encountered

None. The two Rule 3 deviations above were resolved inline during Task 2 without blocking. react-chartjs-2 React 19 peer compatibility (RESEARCH.md Pitfall 6) was checked proactively and confirmed — no `--legacy-peer-deps` needed.

## User Setup Required

None — no external service configuration required. The Vite dev proxy targets `http://localhost:3000` (the Express API from Phase 1 / Plan 02-01); start the backend with `npm run dev` in the repo root for the frontend to receive real data. `CORS_ORIGIN` already defaults to `http://localhost:5173` from Plan 02-01.

## Threat Mitigations

| Threat | Mitigation | Status |
|--------|------------|--------|
| T-02-06 (Tampering, npm install) | Package legitimacy verified: `npm view` confirmed react-router-dom@7.18.0 (remix-run/react-router) and date-fns@4.4.0 (date-fns/date-fns) are canonical MIT packages with integrity hashes; lockfile committed | Implemented (checkpoint self-verified under auto-mode) |
| T-02-07 (Info Disclosure, localStorage) | Token in `localStorage` is XSS-readable — accepted for v1 MVP (24h JWT expiry, React default escaping). `restopulse_token` key used by api/client.ts | Accepted (per plan threat model) |
| T-02-08 (EoP, apiClient 401 handler) | 401 → `clearToken()` + `window.location.href = '/login'` + throw; attacker cannot bypass | Implemented in `frontend/src/api/client.ts` |
| T-02-09 (Tampering, Vite proxy) | Dev-only proxy; production uses proper CORS (Plan 02-01) | Accepted (per plan threat model) |

## Threat Flags

None. No security-relevant surface beyond the plan's `<threat_model>` was introduced. The api/client.ts localStorage access and 401 redirect are exactly T-02-07/T-02-08 (both in the threat register). The Vite proxy is T-02-09. No new network endpoints, auth paths, or trust-boundary schema changes.

## Known Stubs

| File | Line | Stub | Reason | Resolved By |
|------|------|------|--------|-------------|
| `frontend/src/App.tsx` | 1, 10 | "Scaffold placeholder — Plan 02-03 replaces this…" / "Dashboard frontend scaffold ready." | Intentional scaffold placeholder proving Tailwind + dark mode render; the plan explicitly assigns the App shell (router + AuthProvider) to Plan 02-03. No data wiring is expected at this stage. | Plan 02-03 (Auth flow + Login page + App shell + layout) |

No other stubs: `types/dashboard.ts`, `lib/format.ts`, `lib/chartConfig.ts`, and `api/client.ts` are complete real implementations with no TODO/FIXME/placeholder/mock data.

## Self-Check: PASSED

- All 4 contract/util files exist on disk: `frontend/src/types/dashboard.ts`, `frontend/src/lib/format.ts`, `frontend/src/lib/chartConfig.ts`, `frontend/src/api/client.ts` (FOUND).
- All 7 plan-listed scaffold files exist: `frontend/package.json`, `frontend/vite.config.ts`, `frontend/tsconfig.json`, `frontend/tsconfig.node.json`, `frontend/index.html`, `frontend/src/index.css`, `frontend/src/main.tsx` (FOUND).
- Both task commits found in git history: `7bf92b5` (Task 2), `d868743` (Task 3).
- `npx tsc --noEmit` and `npx tsc -b` exit 0 (re-confirmed post-commit).
- `formatRupiah(1234567)` === `"Rp 1.234.567"` (exact match, Node Intl).
- All 9 required deps present in `frontend/package.json` at expected versions.
- `chart.js/auto` not imported anywhere in `frontend/src/` (tree-shaking confirmed).
- `TimeScale` not imported in `chartConfig.ts` (only mentioned in a comment explaining its absence).

## Next Phase Readiness

- The frontend skeleton is live: `npm run dev` in `frontend/` serves on :5173 with HMR, the `/api` proxy forwards to the Express backend, Tailwind v4 dark mode is active, and TypeScript compiles clean.
- Plans 02-03 (auth shell + layout), 02-04 (data layer: usePolling, useDashboard, DateFilter, SummaryCards), and 02-05 (LineChart + PieChart + EmptyState + Spinner + RefreshButton) can now import `api/client.ts`, `lib/format.ts`, `lib/chartConfig.ts`, and `types/dashboard.ts` directly.
- **Pending verification (human/UAT):** actual chart rendering, tooltip behavior (DASH-03), and live auth flow against a running backend are deferred to Plans 02-03–02-05 and the Phase 2 visual UAT.
- No blockers.

---
*Phase: 02-dashboard*
*Completed: 2026-06-26*
