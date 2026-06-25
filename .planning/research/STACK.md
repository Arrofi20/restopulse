# Technology Stack

**Project:** RestoPulse
**Researched:** 2026-06-25

## Recommended Stack

### Runtime & Language

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Node.js | 22.x LTS (Jod) | JavaScript runtime | Active LTS until late 2027; maximum package compatibility; stable for student teams. v24 LTS exists but is newer—avoid bleeding-edge for an 8-week MVP. |
| TypeScript | 5.7+ | Type safety | Catches data-shape bugs at build time; essential for Prisma-generated types and API contracts. |

### Core Framework

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 19.x | UI library | Standard for interactive dashboards; huge ecosystem; Chart.js wrappers are first-class. |
| Vite | 6.x | Build tool & dev server | Faster cold-start than CRA; tree-shakes Chart.js aggressively; keeps bundle size low to hit the ≤800 KB page-weight constraint. |
| Express | 5.2.1 | HTTP backend framework | De-facto standard for Node APIs; minimal, well-documented, huge middleware ecosystem. v5 is now stable (released 2025). |
| React Router | 7.x | Client-side routing | Lightweight navigation for dashboard pages (Dashboard, Laporan, Login). |

### Database & ORM

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| SQLite | 3.x (embedded) | Single-file relational database | Zero-config, perfect for single-outlet MVP; no separate DB server to deploy. |
| better-sqlite3 | 12.11.1 | Node.js SQLite driver | Fastest SQLite driver for Node (synchronous, WAL-mode ready); ~8x faster than node-sqlite3 for typical queries. |
| Prisma | 7.8.0 | ORM & migration tool | Auto-generated type-safe client; declarative schema matches the PRD entity model; handles migrations so the student team never writes raw DDL. |

### Authentication

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| bcryptjs | 3.0.3 | Password hashing | Pure-JS, zero native dependencies (avoids build headaches on Windows); salt + hash out of the box. |
| jsonwebtoken | 9.0.3 | JWT session tokens | Stateless auth; signed tokens keep the backend simple (no session store needed for a single-owner app). |

> **Why not NextAuth.js?** NextAuth.js (v4 / Auth.js) is optimized for OAuth providers and social login. RestoPulse needs only a single hard-coded owner account with username/password. Rolling a minimal JWT login flow is lighter and avoids the complexity of adapter configuration.

### Charts & Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Chart.js | 4.5.1 | Canvas-based chart rendering | Pre-selected in PROJECT.md; latest stable with built-in tooltip, animation, and tree-shaking support. Line & Pie charts are core features. |
| react-chartjs-2 | 5.3.1 | React wrapper for Chart.js | Official wrapper; declarative props; auto-handles chart lifecycle (destroy/update) to prevent memory leaks. |

### Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Tailwind CSS | 4.3.1 | Utility-first CSS | Rapid UI prototyping; dark-mode dashboards are trivial with `bg-gray-900` etc.; purges unused styles so CSS stays tiny. |

### PDF & CSV Export

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| jspdf | 4.2.1 | PDF generation | Mature client-side PDF library; works in both browser and Node. Use with `jspdf-autotable` for structured E-Report tables. |
| jspdf-autotable | 3.8.x | Table layouts inside PDF | Official plugin; handles column widths, page breaks, and headers—critical for financial reports. |
| Native CSV helper | — | CSV export | CSV is trivial (comma-join rows). A 20-line utility function avoids adding a dependency and keeps bundle size down. |

> **Why not Puppeteer / Playwright for PDF?** Headless Chromium adds ~150 MB to the deployment and complex Docker/native dependency issues. For simple tabular reports, jsPDF + autotable is sufficient and keeps the backend stateless.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| date-fns | 4.x | Date manipulation & formatting | Consistent Indonesian date formatting (`dd MMMM yyyy`) and date-range math for the E-Report filter. |
| zod | 3.25+ | Runtime schema validation | Validate manual entry form (Tanggal, Omset, Menu) and API payloads before they hit the database. |
| lucide-react | 0.460+ | Icon set | Lightweight SVG icons for navigation and UI actions (download, calendar, etc.). |

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Frontend meta-framework | React + Vite | Next.js 15 | Next.js App Router adds server-component complexity and larger bundle baseline. For a lightweight dashboard with no SEO needs, Vite is simpler and builds faster. |
| Database | SQLite + Prisma | PostgreSQL + Prisma | Postgres is overkill for single-outlet, single-user MVP; requires separate service install and DevOps overhead that an 8-week student project cannot afford. |
| Auth | bcryptjs + JWT | NextAuth.js / Auth.js | NextAuth.js is OAuth-centric; adds adapters, providers, and CSRF cookie config that are unnecessary for a single owner login. |
| PDF engine | jsPDF + autotable | Puppeteer | Puppeteer requires Chromium download and heavy server resources; jsPDF is pure JS and sufficient for tabular E-Reports. |
| ORM | Prisma | Drizzle ORM | Drizzle is lighter but Prisma’s migration CLI and Studio GUI lower the barrier for student developers who are new to SQL. |

## Installation

```bash
# Core runtime
# Use Node.js 22.x LTS (via nvm, fnm, or official installer)

# Frontend
npm install react@^19 react-dom@^19 react-router@^7
npm install -D vite@^6 @vitejs/plugin-react typescript @types/react @types/react-dom tailwindcss@^4 postcss autoprefixer

# Charts
npm install chart.js@^4.5.1 react-chartjs-2@^5.3.1

# Backend
npm install express@^5.2.1
npm install -D @types/express ts-node nodemon

# Database
npm install prisma@^7.8.0 @prisma/client@^7.8.0 better-sqlite3@^12.11.1
npm install -D @types/better-sqlite3

# Auth & security
npm install bcryptjs@^3.0.3 jsonwebtoken@^9.0.3
npm install -D @types/bcryptjs @types/jsonwebtoken

# PDF export
npm install jspdf@^4.2.1 jspdf-autotable@^3.8.0

# Utilities
npm install date-fns@^4 zod@^3.25 lucide-react@^0.460
```

## Sources

- Chart.js docs & releases: https://github.com/chartjs/Chart.js/releases (v4.5.1, Oct 2025)
- react-chartjs-2 npm: v5.3.1, ~4.3M weekly downloads
- Express npm: v5.2.1, ~110M weekly downloads
- Prisma npm: v7.8.0, ~13.6M weekly downloads
- bcryptjs npm: v3.0.3, ~11.4M weekly downloads
- jsonwebtoken npm: v9.0.3, ~50M weekly downloads
- jspdf npm: v4.2.1, ~13.7M weekly downloads
- Tailwind CSS npm: v4.3.1, ~120M weekly downloads
- better-sqlite3 npm: v12.11.1, ~7.7M weekly downloads
- Node.js releases: https://nodejs.org/en/about/previous-releases (v22 LTS Jod, v24 LTS Krypton)
