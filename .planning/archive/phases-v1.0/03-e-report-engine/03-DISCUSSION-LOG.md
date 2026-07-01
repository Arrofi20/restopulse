# Phase 3: E-Report Engine - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-26
**Phase:** 03-e-report-engine
**Areas discussed:** CSV export scope, PDF color scheme for print, Report data source, Date preset semantics

---

## CSV Export Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Keep in Phase 3 | Build CSV export now as planned in ROADMAP (plan 03-04). Update REQUIREMENTS.md to mark REPT-03 as v1/Phase 3. | ✓ |
| Defer to v2 | Remove CSV from Phase 3. Only PDF export in this phase. CSV becomes a future phase. | |
| You decide | Let the planner/agent decide based on effort estimate. | |

**User's choice:** Keep in Phase 3
**Notes:** REQUIREMENTS.md currently lists REPT-03 as v2/deferred, but ROADMAP Phase 3 explicitly includes plan 03-04 for CSV export. User confirmed CSV stays in Phase 3. REQUIREMENTS.md should be updated to reflect this.

---

## PDF Color Scheme for Print

| Option | Description | Selected |
|--------|-------------|----------|
| Dark theme (match app) | Black/dark background with white text and amber accents — consistent with the app preview, but uses more ink and is unusual for print. | |
| White paper (print standard) | White background with dark text — standard for print, less ink, but looks different from the on-screen preview. | |
| Hybrid: screen dark, export light | Preview stays dark (matches app), but PDF export auto-switches to white paper + dark text for print readiness. | ✓ |

**User's choice:** Hybrid: screen dark, export light
**Notes:** On-screen report preview maintains dark theme for app consistency. Exported PDF document switches to white background with dark text for print standard compliance and ink efficiency.

---

## Report Data Source

| Option | Description | Selected |
|--------|-------------|----------|
| Live query (SalesTrend + DailySales) | Query pre-computed SalesTrend for summary and DailySales for detail on every request. Data is always fresh. | |
| Cached snapshots (DailySalesReport table) | Use the existing DailySalesReport table. Requires building a cache-population mechanism. Fastest reads but risks stale data. | |
| You decide | Let the planner choose based on query performance analysis. | ✓ |

**User's choice:** You decide
**Notes:** User deferred data source strategy to agent discretion. Existing CQRS-lite pattern (SalesTrend pre-computed) makes live queries fast. DailySalesReport table exists in schema but has no population mechanism yet.

---

## Date Preset Semantics

| Option | Description | Selected |
|--------|-------------|----------|
| Harian = today, Mingguan = last 7d, Bulanan = current month | Simple and consistent with the existing dashboard filter. Harian is new — covers just today. | ✓ |
| Harian = yesterday, Mingguan = this week (Mon–Sun), Bulanan = current month | More "report-like": yesterday = complete day, this week = calendar week. Aligns with how accountants typically run reports. | |
| Let me specify | Type your own definitions for each preset. | |

**User's choice:** Harian = today, Mingguan = last 7d, Bulanan = current month
**Notes:** Report presets map closely to existing DateFilter presets: Harian (today) is new; Mingguan maps to "7 Hari"; Bulanan maps to "Bulan Ini".

---

## the agent's Discretion

- Data source implementation: live query vs cached snapshot (DailySalesReport table)

## Deferred Ideas

- None — discussion stayed within phase scope

---

*Phase: 03-e-report-engine*
*Discussion date: 2026-06-26*
