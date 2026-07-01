# Architecture Patterns

**Domain:** Restaurant Analytics Dashboard (RestoPulse)
**Researched:** 2026-06-25
**Confidence:** HIGH

## Recommended Architecture

RestoPulse is best structured as a **monolithic three-tier web application** with a thin API layer. Given the 8-week MVP constraint, single-outlet scope, and small team size, a distributed microservices architecture would be catastrophic over-engineering. The recommended architecture follows a **Layered Monolith** pattern with clear horizontal layers and vertical feature slices.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Login   │ │ Dashboard│ │E-Report  │ │ Data Entry   │   │
│  │  Page    │ │  Page    │ │  Page    │ │   Page       │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
│       └─────────────┴────────────┴──────────────┘            │
│              Chart.js  │  Tailwind/Bootstrap                  │
│              Vanilla JS│  HTML/CSS                            │
└───────────────────────┬──────────────────────────────────────┘
                        │ HTTPS/JSON
┌───────────────────────┴──────────────────────────────────────┐
│                      API LAYER (REST)                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Auth    │ │  Sales   │ │ Report   │ │   Dummy      │   │
│  │Controller│ │Controller│ │Controller│ │ Controller   │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
│       └─────────────┴────────────┴──────────────┘            │
│              Express.js / Fastify / Laravel                   │
│              JWT Session Management                           │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────┴──────────────────────────────────────┐
│                   SERVICE LAYER (Business Logic)              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Auth    │ │  Sales   │ │  Export  │ │ Aggregation  │   │
│  │ Service  │ │ Service  │ │ Service  │ │   Service    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│  │  Dummy   │ │  Audit   │ │ Validation│                    │
│  │ Service  │ │   Log    │ │  Service  │                    │
│  └──────────┘ └──────────┘ └──────────┘                     │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────┴──────────────────────────────────────┐
│                  DATA ACCESS LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │  Owner   │ │  Daily   │ │  Sales   │ │   Daily      │   │
│  │  Repo    │ │  Sales   │ │  Trend   │ │   Report     │   │
│  │          │ │  Repo    │ │  Repo    │ │   Repo       │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│  ┌──────────┐                                                │
│  │ StatusLog│                                                │
│  │  Repo    │                                                │
│  └──────────┘                                                │
└───────────────────────┬──────────────────────────────────────┘
                        │
┌───────────────────────┴──────────────────────────────────────┐
│                   DATABASE LAYER                              │
│              ┌─────────────────────────┐                     │
│              │  SQLite / PostgreSQL    │                     │
│              │  (Single-outlet schema) │                     │
│              └─────────────────────────┘                     │
└─────────────────────────────────────────────────────────────┘
```

## Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Auth Controller** | Handle login/logout, session validation, password hashing | Auth Service, Owner Repo |
| **Sales Controller** | CRUD endpoints for daily sales transactions | Sales Service, Sales Repo |
| **Report Controller** | Date-range filtering, report aggregation, export triggers | Report Service, Export Service, DailySales Repo, DailyReport Repo |
| **Dummy Controller** | Admin-only endpoint to inject simulated historical data | Dummy Service, Sales Repo, StatusLog Repo |
| **Dashboard Controller** | Serve pre-aggregated chart data (trends, top items) | Aggregation Service, SalesTrend Repo |
| **Auth Service** | Validate credentials, generate/verify JWT or session tokens | Auth Controller |
| **Sales Service** | Business rules for sales entry, immutability enforcement, audit logging | Sales Controller, Sales Repo, StatusLog Repo |
| **Report Service** | Aggregate raw sales into report views, calculate totals, filter by date | Report Controller, DailySales Repo, DailyReport Repo |
| **Export Service** | Generate PDF (via Puppeteer/jsPDF) and CSV streams from report data | Report Controller, Report Service |
| **Aggregation Service** | Compute trend lines and menu popularity percentages for charts | Dashboard Controller, SalesTrend Repo, DailySales Repo |
| **Dummy Service** | Generate realistic fake transaction data for demo purposes | Dummy Controller, Sales Repo |
| **Owner Repo** | Database queries for owner accounts | Auth Service |
| **DailySales Repo** | CRUD and date-range queries for daily sales records | Sales Service, Report Service, Aggregation Service |
| **SalesTrend Repo** | Read pre-computed trend data; write aggregated results | Aggregation Service, Dashboard Controller |
| **DailyReport Repo** | Store and retrieve generated report snapshots | Report Service |
| **StatusLog Repo** | Immutable audit trail of all financial data changes | Sales Service |

### Boundary Rules

1. **Controllers never touch the database directly.** All DB access goes through Services → Repositories.
2. **Services never handle HTTP concerns.** They receive plain objects and return domain results or errors.
3. **Frontend never calls the database.** All data flows through the REST API.
4. **Export Service is isolated.** PDF/CSV generation runs asynchronously or in a worker thread to avoid blocking the API.
5. **Dummy Service is admin-gated.** It must be protected by role checks and should ideally be removable in production builds.

## Data Flow

### Flow 1: Authentication
```
User (Browser)
  → POST /api/auth/login {username, password}
    → Auth Controller
      → Auth Service (bcrypt compare)
        → Owner Repo (fetch account by username)
          → Database
        → Return account (or error)
      → Generate JWT / Session Cookie
    → Return 200 + Token/Cookie
  → Store token in HttpOnly cookie or localStorage
  → Redirect to Dashboard
```

### Flow 2: Dashboard Load (Line Chart + Pie Chart)
```
User (Browser)
  → GET /api/dashboard/summary?from=...&to=...
    → Dashboard Controller (verify auth)
      → Aggregation Service
        → SalesTrend Repo (pre-computed trends)
          → Database
        → DailySales Repo (menu popularity aggregation)
          → Database
      → Return JSON: {trendData: [...], topItems: [...]}
  → Frontend (Chart.js)
    → Render Line Chart (trendData)
    → Render Pie Chart (topItems)
```

### Flow 3: Manual Data Entry
```
User (Browser)
  → POST /api/sales {date, revenue, topItems: [...]}
    → Sales Controller (verify auth, validate input)
      → Sales Service
        → Validate business rules (no future dates, positive revenue)
        → DailySales Repo (insert record)
          → Database
        → StatusLog Repo (insert audit record atomically)
          → Database
        → Trigger Aggregation Service (async update of SalesTrend)
      → Return 201 Created
  → Frontend refreshes dashboard data (polling or SSE)
```

### Flow 4: E-Report Generation
```
User (Browser)
  → GET /api/reports?from=...&to=...&format=screen
    → Report Controller (verify auth)
      → Report Service
        → DailySales Repo (date-range query)
          → Database
        → DailyReport Repo (check cached report)
          → Database
        → Aggregate: totals, averages, top items
      → Return JSON report
  → Frontend renders report table
```

### Flow 5: PDF/CSV Export
```
User (Browser)
  → GET /api/reports/export?from=...&to=...&type=pdf|csv
    → Report Controller (verify auth)
      → Report Service (fetch aggregated data)
        → DailySales Repo
          → Database
      → Export Service
        → PDF path: HTML template → Headless browser (Puppeteer) → PDF stream
        → CSV path: JSON-to-CSV transform → text/csv stream
      → Stream file to client
  → Browser initiates download
```

### Flow 6: Dummy Data Injection
```
Admin/Developer (Browser)
  → POST /api/admin/dummy-inject {days: 180, startDate: ...}
    → Dummy Controller (verify admin role)
      → Dummy Service
        → Generate randomized sales records
        → DailySales Repo (bulk insert with transaction)
          → Database
        → StatusLog Repo (log injection event)
          → Database
        → Trigger Aggregation Service (recompute all trends)
      → Return 200 {injectedCount: N}
  → Frontend shows confirmation
```

## Patterns to Follow

### Pattern 1: Repository Pattern
**What:** Abstract all database queries behind repository classes/interfaces. Controllers and services depend on repositories, not raw query builders.
**When:** Always. This makes testing trivial and allows swapping SQLite for PostgreSQL later without touching business logic.
**Example:**
```typescript
// Good
class DailySalesRepo {
  async findByDateRange(outletId: string, from: Date, to: Date): Promise<DailySales[]> {
    return db.query('SELECT * FROM daily_sales WHERE outlet_id = ? AND date BETWEEN ? AND ?', [outletId, from, to]);
  }
}

// Bad
// controller directly calls db.query() inside the route handler
```

### Pattern 2: Service Layer with Pure Functions
**What:** Business logic lives in services that accept plain objects and return results. No HTTP context inside services.
**When:** All business rules (validation, aggregation, export generation).
**Example:**
```typescript
class ReportService {
  generateSummary(sales: DailySales[]): ReportSummary {
    const total = sales.reduce((sum, s) => sum + s.revenue, 0);
    const avg = total / sales.length;
    return { total, average: avg, count: sales.length };
  }
}
```

### Pattern 3: CQRS-lite for Dashboard Reads
**What:** Separate read models (SalesTrend) from write models (DailySales). When sales data is written, recompute and store pre-aggregated trend data.
**When:** Dashboard loads must be ≤4 seconds on 4G. Pre-computed trend tables eliminate expensive aggregations on every page load.
**Example:**
```
Write path: DailySales inserted → trigger recompute → update SalesTrend table
Read path: Dashboard reads from SalesTrend (O(1) indexed lookup)
```

### Pattern 4: Audit Log as Separate Transaction
**What:** Every mutation to financial data writes an immutable log record in the same database transaction.
**When:** All DailySales inserts, updates (if any), or dummy injections.
**Example:**
```sql
BEGIN TRANSACTION;
  INSERT INTO daily_sales (...) VALUES (...);
  INSERT INTO status_log (sales_id, old_revenue, new_revenue, changed_at, account_id) VALUES (...);
COMMIT;
```

### Pattern 5: Thin API + Thick Client for Charts
**What:** The backend sends aggregated, ready-to-render data structures. The frontend (Chart.js) does minimal transformation.
**When:** Dashboard and report pages.
**Example:**
```json
{
  "lineChart": {
    "labels": ["2026-06-01", "2026-06-02", ...],
    "datasets": [{"label": "Omset Harian", "data": [1200000, 1500000, ...]}]
  },
  "pieChart": {
    "labels": ["Nasi Goreng", "Ayam Bakar", ...],
    "data": [35, 25, ...]
  }
}
```

### Pattern 6: Async Export Generation
**What:** For PDF/CSV exports, either stream directly or use a background job queue if generation time exceeds 2 seconds.
**When:** PDF reports with large date ranges.
**Example:**
```typescript
// For small reports (< 1000 rows): synchronous stream
// For large reports: queue job, return job ID, poll for completion
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Real-Time WebSocket Overkill
**What:** Using WebSockets or Socket.io for "real-time" dashboard updates.
**Why bad:** Adds unnecessary infrastructure complexity (socket server, connection management, fallbacks) for a single-user dashboard. The requirement is ≤3 seconds, which is easily achievable with HTTP polling or SSE.
**Instead:** Use **Server-Sent Events (SSE)** or simple **HTTP polling every 5 seconds** when the dashboard is active. SSE is a single long-lived HTTP connection and works over standard HTTP/1.1.

### Anti-Pattern 2: Client-Side PDF Generation
**What:** Generating PDFs entirely in the browser using jsPDF or html2canvas.
**Why bad:** Large bundle size (violates ≤800 KB page weight), inconsistent rendering across browsers, poor print quality, and broken on mobile.
**Instead:** Generate PDFs **server-side** using Puppeteer, Playwright, or a lightweight PDF library (e.g., PDFKit for Node.js, DomPDF for PHP). The server has full control over layout and fonts.

### Anti-Pattern 3: Storing Aggregated Data Only
**What:** Only storing pre-computed trends and deleting raw daily sales data.
**Why bad:** Destroys auditability. The PRD explicitly requires StatusLog for audit trails and mandates that DailySales cannot be edited after report generation.
**Instead:** Always store raw DailySales as the source of truth. Pre-computed SalesTrend is a read-optimized cache, not the primary record.

### Anti-Pattern 4: Multi-Tenant Schema in v1
**What:** Designing tables with `tenant_id` or `outlet_id` foreign keys everywhere in anticipation of multi-outlet.
**Why bad:** Adds join overhead, complicates every query, and slows down development for a feature explicitly out of scope (see PROJECT.md Out of Scope: multi-outlet). The 8-week timeline cannot afford this complexity.
**Instead:** Hardcode single-outlet assumption in schema. If multi-outlet is ever needed, it will require a migration anyway — but don't pay the cost now.

### Anti-Pattern 5: Frontend Direct Database Access
**What:** Exposing database credentials or GraphQL endpoints that allow arbitrary queries from the browser.
**Why bad:** Security nightmare. Financial data must never be accessible without strict authentication and authorization.
**Instead:** All database access goes through authenticated REST API endpoints with role-based access control.

### Anti-Pattern 6: Monolithic Frontend State with No Boundaries
**What:** A single global state store (e.g., Redux) holding everything from auth tokens to chart data to report filters.
**Why bad:** Over-engineering for a 4-page dashboard. Adds boilerplate and cognitive load.
**Instead:** Use lightweight state management. Vanilla JS with module-level state, or Alpine.js / petite-vue for reactivity if needed. Keep state colocated with the feature (dashboard state in dashboard module, report state in report module).

## Scalability Considerations

| Concern | At 1 User (MVP) | At 10 Users | At 100 Users |
|---------|-----------------|-------------|--------------|
| **Database** | SQLite is sufficient. Zero config, file-based, perfect for single-outlet. | SQLite may hit write contention. Migrate to PostgreSQL or MySQL. | PostgreSQL required. Add connection pooling (PgBouncer). |
| **Chart Data** | Load from pre-computed SalesTrend table. O(1) lookup. | Same. Aggregation is write-time, not read-time. | Same. Consider Redis for caching dashboard responses (TTL 60s). |
| **PDF Export** | Synchronous generation, inline stream. | Add async queue (Bull/Agenda) for large exports. | Dedicated worker process for PDF generation. |
| **File Storage** | No file storage needed; reports generated on-the-fly. | Same. | If reports are cached, use object storage (S3/MinIO) or local disk with cleanup jobs. |
| **Session Storage** | In-memory or file-based sessions. | Same, or Redis session store if load balancing. | Redis session store required for horizontal scaling. |
| **Frontend Bundle** | Chart.js + app code ≈ 200-400 KB. Well under 800 KB limit. | Same. | Same. Code splitting not needed for 4 pages. |

### Performance Budget (MVP)
- **Total page weight:** ≤ 800 KB
  - Chart.js CDN: ~150 KB (gzipped)
  - CSS framework (Tailwind/Bootstrap): ~100 KB
  - Application JS/CSS: ~200 KB
  - API JSON payload: ~50 KB per request
  - Images/fonts: minimal (prefer SVG icons)
- **API response time:** ≤ 500ms for 50 concurrent transactions
- **Database query time:** ≤ 100ms for date-range queries with index on `date` column

## Suggested Build Order (Component Dependencies)

Based on the architecture above and the 8-week milestone plan in the PRD, components should be built in the following order to respect dependencies and enable early integration testing.

### Phase 1: Foundation (Weeks 1–2)
1. **Database Schema & Migrations**
   - Creates: `OwnerAccount`, `DailySales`, `SalesTrend`, `StatusLog`, `DailySalesReport`
   - Why first: Every other component depends on persisted data.
   - Blockers: None.

2. **Data Access Layer (Repositories)**
   - Implements: `OwnerRepo`, `DailySalesRepo`, `SalesTrendRepo`, `StatusLogRepo`, `DailyReportRepo`
   - Why second: Services and controllers need repositories to function.
   - Blockers: Database schema must exist.

3. **Auth API (Controller + Service)**
   - Implements: Login, logout, session/JWT management, password hashing
   - Why third: All dashboard and report endpoints must be protected.
   - Blockers: `OwnerRepo` must exist.

### Phase 2: Core Data & Dashboard (Weeks 3–4)
4. **Sales API + Service**
   - Implements: `POST /api/sales`, validation rules, audit logging
   - Why fourth: Dashboard needs data to display.
   - Blockers: Auth API, `DailySalesRepo`, `StatusLogRepo`.

5. **Aggregation Service + Dashboard API**
   - Implements: Pre-computation of `SalesTrend`, `GET /api/dashboard/summary`
   - Why fifth: The dashboard page cannot render without this.
   - Blockers: `DailySalesRepo`, `SalesTrendRepo`.

6. **Frontend Dashboard Page**
   - Implements: Login page, Dashboard page with Chart.js (Line + Pie)
   - Why sixth: First user-visible feature. Can be tested end-to-end once Aggregation Service is ready.
   - Blockers: Dashboard API, Auth API.

### Phase 3: Reporting & Export (Weeks 5–6)
7. **Manual Data Entry Form (Frontend)**
   - Implements: Form to input Date, Revenue, Top Items
   - Why seventh: Needed for real-world usage beyond dummy data.
   - Blockers: Sales API.

8. **Report Service + Report API**
   - Implements: Date-range filtering, report aggregation, `GET /api/reports`
   - Why eighth: E-Report engine is a core value proposition.
   - Blockers: `DailySalesRepo`, `DailyReportRepo`.

9. **Export Service (PDF + CSV)**
   - Implements: `GET /api/reports/export`, PDF generation, CSV generation
   - Why ninth: Depends on Report Service to fetch data.
   - Blockers: Report Service.

10. **E-Report Frontend Page**
    - Implements: Report filter UI, report preview table, download buttons
    - Why tenth: Consumes Report API and Export API.
    - Blockers: Report API, Export Service.

### Phase 4: Demo & Polish (Weeks 7–8)
11. **Dummy Data Injector**
    - Implements: `POST /api/admin/dummy-inject`, bulk generation, trend recomputation
    - Why eleventh: Not needed for core functionality, but critical for demo and UAT.
    - Blockers: Sales Service, Aggregation Service.

12. **Real-Time Update Mechanism**
    - Implements: SSE endpoint or polling loop on dashboard
    - Why twelfth: Polish feature. Dashboard works without it (manual refresh).
    - Blockers: Dashboard API.

13. **Performance Optimization**
    - Implements: DB indexing, query optimization, bundle minification, image compression
    - Why last: Only optimize after features are complete and metrics are measured.
    - Blockers: All above features.

### Dependency Graph Summary
```
Database Schema
    │
    ├── Repositories
    │       │
    │       ├── Auth API ──→ Frontend Login
    │       │
    │       ├── Sales API ──→ Manual Entry Form
    │       │       │
    │       │       └── Aggregation Service ──→ Dashboard API ──→ Frontend Dashboard
    │       │
    │       ├── Report Service ──→ Report API ──→ E-Report Frontend
    │       │       │
    │       │       └── Export Service ──→ Download Buttons
    │       │
    │       └── Dummy Service ──→ Dummy Controller
    │               │
    │               └── (uses Sales API + Aggregation Service)
    │
    └── StatusLog Repo (used by Sales API)
```

## Sources

- PRD RestoPulse v1.0 (Team Nasi Durian, 28 Mei 2026) — Domain requirements, data entities, NFRs
- PROJECT.md RestoPulse (2026-06-25) — Scope constraints, key decisions, timeline
- Chart.js Documentation (chartjs.org) — Frontend visualization architecture
- Martin Fowler, "Patterns of Enterprise Application Architecture" — Repository Pattern, Service Layer
- Google Web Fundamentals — Performance budgets and page weight optimization
- OWASP Cheat Sheet Series — Session management and authentication best practices






