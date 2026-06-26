# Phase 2: Dashboard - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-26
**Phase:** 02-dashboard
**Areas discussed:** Time Period, Chart Interaction, Data Freshness, Navigation & Layout

---

## Time Period

| Option | Description | Selected |
|--------|-------------|----------|
| Last 7 days | Shows past week — best for daily checking of recent performance | ✓ |
| Last 30 days | Broader monthly view — good for tracking trends | |
| Month-to-date | Shows current month from day 1 to today — natural for financial review | |
| All-time | Full historical range — useful for seeing overall growth pattern | |

**User's choice:** Last 7 days (default view)

| Option | Description | Selected |
|--------|-------------|----------|
| Quick-select buttons | Preset buttons like 7H / 30H / Bulan Ini / Semua — fast, mobile-friendly | |
| Date picker (start-end) | Calendar date range picker — precise, flexible | |
| Both — buttons + date picker | Presets for speed, date picker for custom ranges — best of both | ✓ |

**User's choice:** Both quick-select preset buttons + custom date range picker

| Option | Description | Selected |
|--------|-------------|----------|
| Shared filter | One date range controls both charts — simpler, consistent view | ✓ |
| Independent filters | Each chart has its own date range — more granular analysis | |

**User's choice:** Shared filter — both charts use the same date range

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, show total revenue + tx count | Summary cards at top give the owner quick numbers | ✓ |
| No, just the charts | Keep it minimal — the charts already communicate the data | |

**User's choice:** Show summary statistics cards (total revenue + transaction count)

---

## Chart Interaction

| Option | Description | Selected |
|--------|-------------|----------|
| Date + revenue only | Contoh: 15 Juni — Rp 2.450.000 — clean and focused | ✓ |
| Date + revenue + top menu items | Contoh: 15 Juni — Rp 2.450.000 — Nasi Goreng (45), Ayam Bakar (32) | |

**User's choice:** Line Chart tooltip shows date + revenue only

| Option | Description | Selected |
|--------|-------------|----------|
| Hover: name + percentage + count. No click action | Read-only — simple and informative | |
| Hover: name + percentage. Click: shows daily breakdown | Click a slice to see which days that menu dominated | |
| Hover: name + percentage + count + revenue contributed | Full detail — Ayam Bakar 28% (145 pcs) Rp 3.2M | ✓ |

**User's choice:** Pie Chart tooltip shows name + percentage + count + revenue contributed

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, red point markers when revenue drops | Points below previous day show red | |
| Yes, red point + annotation showing drop % | Show percentage decline, e.g. '-15%' next to red point | ✓ |
| No visual indicator on chart | Let the line itself show the trend | |

**User's choice:** Red point marker + percentage annotation on revenue drops

| Option | Description | Selected |
|--------|-------------|----------|
| Empty charts with message | "Belum ada data penjualan untuk periode ini" — clear state | |
| Empty charts + CTA to add data | Show message + button linking to data entry page | ✓ |

**User's choice:** Empty state with CTA button to add data

---

## Data Freshness

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-poll every 30 seconds | Data updates automatically | ✓ |
| Auto-poll every 10 seconds | Faster refresh — closer to real-time | |
| Manual refresh button only | Owner clicks when they want to refresh | |

**User's choice:** Auto-poll every 30 seconds

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, add a refresh button | Owner can force-refresh anytime | ✓ |
| No, auto-poll is enough | 30 seconds is fast enough | |

**User's choice:** Manual refresh button alongside auto-poll

| Option | Description | Selected |
|--------|-------------|----------|
| Subtle indicator — don't replace charts | Small spinner/shimmer atop charts — non-disruptive | ✓ |
| Full skeleton loader | Grey placeholder blocks replace charts | |
| No indicator — data just updates | Silent update | |

**User's choice:** Subtle loading indicator, don't replace charts

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, pause when hidden, resume when visible | Saves bandwidth and battery | ✓ |
| No, keep polling always | Data always current when switching back | |

**User's choice:** Pause polling when tab is in background

---

## Navigation & Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Left sidebar | Sidebar with Dashboard + E-Report links. Classic dashboard pattern | ✓ |
| Top tab bar | Horizontal tabs — simpler on mobile, less space efficient | |
| Single page — scroll | All charts on one scrollable page | |

**User's choice:** Left sidebar navigation

| Option | Description | Selected |
|--------|-------------|----------|
| Hamburger menu overlay | Sidebar collapses behind hamburger icon, slides over content | ✓ |
| Bottom tab bar on mobile | Sidebar becomes bottom navigation tabs | |
| Sidebar always visible, narrower | Keep sidebar visible but icon-only | |

**User's choice:** Hamburger menu overlay on mobile

| Option | Description | Selected |
|--------|-------------|----------|
| Line Chart full-width above, Pie Chart below | Revenue trend gets more space | |
| Side-by-side on desktop, stacked on mobile | Both visible without scrolling on desktop | ✓ |
| Pie Chart left, Line Chart right | Equal visual weight | |

**User's choice:** Side-by-side on desktop, stacked on mobile (Line Chart above, Pie Chart below)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, top header with outlet name + logout | Shows restaurant name, current user, logout button | ✓ |
| Outlet name in sidebar, logout at bottom | Keep everything in sidebar | |
| No header, logout in sidebar only | Minimalist | |

**User's choice:** Top header bar with outlet name and logout button

---

## the agent's Discretion

No areas were deferred to the agent's discretion — all decisions were made by the user.

## Deferred Ideas

None — discussion stayed within phase scope.
