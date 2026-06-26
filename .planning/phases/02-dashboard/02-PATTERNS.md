# Phase 02: Dashboard - Pattern Map

**Mapped:** 2026-06-26
**Files analyzed:** 39 (to create/modify)
**Analogs found:** 8 / 39 (frontend is greenfield; backend has strong analogs)

## File Classification

### Backend Files (Modify / New)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app.ts` | config | request-response | `src/app.ts` (self-modify) — CORS update | exact |
| `src/controllers/DashboardController.ts` | controller | request-response | `src/controllers/SalesController.ts` | exact |
| `src/services/DashboardService.ts` | service | CRUD | `src/services/SalesService.ts` | exact |
| `src/repositories/SalesTrendRepository.ts` | repository | CRUD | `src/repositories/SalesTrendRepository.ts` (self-modify) — add aggregate methods | exact |
| `src/routes/dashboard.routes.ts` | route | request-response | `src/routes/sales.routes.ts` | exact |
| `src/validation/dashboard.schema.ts` | utility | request-response | `src/validation/sales.schema.ts` | exact |

### Frontend Files (All New — Greenfield)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `frontend/index.html` | config | request-response | No analog — Vite scaffold default | none |
| `frontend/vite.config.ts` | config | request-response | No analog — greenfield (use RESEARCH.md Pattern 4) | none |
| `frontend/tsconfig.json` | config | — | `tsconfig.json` (root) — backend TS patterns | partial |
| `frontend/package.json` | config | — | `package.json` (root) — dependency patterns | partial |
| `frontend/src/main.tsx` | entry | request-response | No analog — standard Vite React entry | none |
| `frontend/src/App.tsx` | component | request-response | No analog — greenfield (use RESEARCH.md) | none |
| `frontend/src/index.css` | style | — | No analog — Tailwind v4 CSS entry | none |
| `frontend/src/api/client.ts` | utility | request-response | No analog — but borrows error format from backend | partial |
| `frontend/src/contexts/AuthContext.tsx` | provider | request-response | No analog — but borrows auth pattern from `src/middleware/authMiddleware.ts` | partial |
| `frontend/src/hooks/usePolling.ts` | hook | event-driven | No analog — greenfield (use RESEARCH.md Pattern 5) | none |
| `frontend/src/hooks/useDashboard.ts` | hook | request-response | No analog — greenfield (use RESEARCH.md code) | none |
| `frontend/src/pages/LoginPage.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/pages/DashboardPage.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/pages/EReportPage.tsx` | component | request-response | No analog — greenfield placeholder | none |
| `frontend/src/components/layout/Sidebar.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/components/layout/Header.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/components/layout/DashboardLayout.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/components/dashboard/SummaryCards.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/components/dashboard/DateFilter.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/components/dashboard/LineChart.tsx` | component | request-response | No analog — greenfield (use RESEARCH.md Patterns 1-3) | none |
| `frontend/src/components/dashboard/PieChart.tsx` | component | request-response | No analog — greenfield (use RESEARCH.md Patterns 1-3) | none |
| `frontend/src/components/dashboard/EmptyState.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/components/ui/Spinner.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/components/ui/RefreshButton.tsx` | component | request-response | No analog — greenfield | none |
| `frontend/src/lib/format.ts` | utility | transform | No analog — greenfield (use RESEARCH.md code) | none |
| `frontend/src/lib/chartConfig.ts` | utility | — | No analog — greenfield (use RESEARCH.md Pattern 1) | none |
| `frontend/src/types/dashboard.ts` | utility | — | No analog — greenfield (use Prisma schema for types) | partial |
| `frontend/vitest.config.ts` | config | — | No analog — no existing tests in codebase | none |

### Test Files (All New)

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/__tests__/DashboardController.test.ts` | test | request-response | No analog — no existing tests in codebase | none |
| `frontend/src/components/dashboard/__tests__/LineChart.test.tsx` | test | — | No analog — greenfield | none |
| `frontend/src/components/dashboard/__tests__/PieChart.test.tsx` | test | — | No analog — greenfield | none |
| `frontend/src/components/dashboard/__tests__/SummaryCards.test.tsx` | test | — | No analog — greenfield | none |
| `frontend/src/components/dashboard/__tests__/EmptyState.test.tsx` | test | — | No analog — greenfield | none |
| `frontend/src/hooks/__tests__/usePolling.test.ts` | test | — | No analog — greenfield | none |
| `frontend/src/lib/__tests__/format.test.ts` | test | — | No analog — greenfield | none |
| `frontend/src/lib/__tests__/chartConfig.test.ts` | test | — | No analog — greenfield | none |

---

## Pattern Assignments

### 1. `src/app.ts` — MODIFY (config, request-response)

**Analog:** `src/app.ts` (lines 1-30 — self)

**What to modify:** CORS middleware currently has zero configuration. Must be updated for frontend communication.

**Current CORS pattern** (line 14):
```typescript
app.use(cors());
```

**Target pattern** — add explicit CORS configuration:
```typescript
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
```

**Route registration pattern** (lines 26-28) — copy this to add dashboard route:
```typescript
app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/admin', adminRoutes);
// NEW: add after existing routes
// app.use('/api/dashboard', dashboardRoutes);
```

**Full file context** (lines 1-30):
```typescript
import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import salesRoutes from './routes/sales.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middleware/errorHandler';
import { authRateLimiter } from './middleware/rateLimiter';

dotenv.config();

export const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).json({ message: 'RestoPulse API is running', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);
```

---

### 2. `src/controllers/DashboardController.ts` — NEW (controller, request-response)

**Analog:** `src/controllers/SalesController.ts` (full file, 81 lines) — same role, same data flow, same authenticated pattern, same outlet_id scoping.

**Imports pattern** (lines 1-9):
```typescript
import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DashboardService } from '../services/DashboardService';
import { SalesTrendRepository } from '../repositories';
import { ZodError } from 'zod';
```

**Class structure + DI pattern** (lines 11-26):
```typescript
export class DashboardController {
  private dashboardService: DashboardService;

  constructor(dashboardService: DashboardService) {
    this.dashboardService = dashboardService;
  }

  static getInstance(): DashboardController {
    return new DashboardController(
      new DashboardService(new SalesTrendRepository())
    );
  }
```

**Core handler pattern** — GET with query params, auth-scoped to outletId (lines 62-80 of SalesController):
```typescript
  async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const { start, end } = req.query;
      const outletId = req.user!.outletId;

      const dashboard = await this.dashboardService.getDashboard(
        outletId,
        String(start),
        String(end)
      );

      res.status(200).json({ success: true, data: dashboard });
    } catch (error: any) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.issues,
          },
        });
      } else {
        res.status(400).json({
          success: false,
          error: { code: 'DASHBOARD_ERROR', message: error.message },
        });
      }
    }
  }
```

**Error response format** — project-wide standard (from SalesController lines 44-57, AuthController lines 41-45):
```typescript
res.status(XXX).json({
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable message',
    details: {} // optional, for Zod validation errors
  },
});
```

**Success response format** (from SalesController line 73):
```typescript
res.status(200).json({ success: true, data: result });
```

---

### 3. `src/services/DashboardService.ts` — NEW (service, CRUD)

**Analog:** `src/services/SalesService.ts` (full file, 99 lines) — same role, same data flow, same validation pattern.

**Imports pattern** (lines 1-6):
```typescript
import { SalesTrendRepository } from '../repositories';
import { dateRangeSchema } from '../validation/sales.schema';
```

**Class structure with DI** (lines 26-39):
```typescript
export class DashboardService {
  private salesTrendRepo: SalesTrendRepository;

  constructor(salesTrendRepo: SalesTrendRepository) {
    this.salesTrendRepo = salesTrendRepo;
  }

  async getDashboard(outlet_id: string, start: string, end: string) {
    // 1. Validate with Zod
    dateRangeSchema.parse({ start, end });

    // 2. Parse dates
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    // 3. Query repository
    const trends = await this.salesTrendRepo.findByDateRange(outlet_id, startDate, endDate);

    // 4. Compute summary statistics (totalRevenue, transactionCount)
    // 5. Return combined result
    return { trends, summary: { totalRevenue, transactionCount } };
  }
}
```

**Validation pattern** (from SalesService line 92):
```typescript
dateRangeSchema.parse({ start, end });
```
Reuse the **existing** `dateRangeSchema` from `src/validation/sales.schema.ts` (lines 14-26) — it already validates YYYY-MM-DD format and start ≤ end.

**Date parsing pattern** (from SalesService lines 94-95):
```typescript
const startDate = new Date(start + 'T00:00:00Z');
const endDate = new Date(end + 'T23:59:59.999Z');
```

---

### 4. `src/repositories/SalesTrendRepository.ts` — MODIFY (repository, CRUD)

**Analog:** `src/repositories/SalesTrendRepository.ts` (self, 88 lines) — add aggregate/summary methods.

**Existing imports + class pattern** (lines 1-9):
```typescript
import { PrismaClient, SalesTrend } from '@prisma/client';
import prisma from '../lib/prisma';

export class SalesTrendRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }
```

**Existing `findByDateRange`** (lines 52-67) — already exists, reuse as-is:
```typescript
  async findByDateRange(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<SalesTrend[]> {
    return this.prisma.salesTrend.findMany({
      where: {
        outlet_id,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: 'asc' },
    });
  }
```

**New method pattern** — aggregate for summary stats (copy Prisma pattern from existing methods):
```typescript
  async aggregateSummary(outlet_id: string, start: Date, end: Date) {
    const result = await this.prisma.salesTrend.aggregate({
      where: {
        outlet_id,
        date: { gte: start, lte: end },
      },
      _sum: { revenue: true },
      _count: { id: true },
    });
    return {
      totalRevenue: result._sum.revenue || 0,
      transactionCount: result._count.id || 0,
    };
  }
```

**Date range pattern** — copy from existing `findByDateRange` where clause (lines 58-63):
```typescript
      where: {
        outlet_id,
        date: {
          gte: start,
          lte: end,
        },
      },
```

---

### 5. `src/routes/dashboard.routes.ts` — NEW (route, request-response)

**Analog:** `src/routes/sales.routes.ts` (full file, 15 lines) — exact match.

**Full pattern** (from sales.routes.ts lines 1-15):
```typescript
import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
const dashboardController = DashboardController.getInstance();

router.get(
  '/',
  authMiddleware,
  dashboardController.getDashboard.bind(dashboardController)
);

export default router;
```

**Key conventions:**
- Import `Router` from 'express' (not `{ Router }`)
- Import controller class directly
- Import `authMiddleware` as named import (function, not class)
- Use `Controller.getInstance()` static factory
- Use `.bind(controller)` to preserve `this` context
- Export `default router`

---

### 6. `src/validation/dashboard.schema.ts` — NEW (utility, request-response)

**Analog:** `src/validation/sales.schema.ts` (full file, 26 lines) — identical pattern and can reuse the existing `dateRangeSchema`.

**Existing `dateRangeSchema`** (lines 14-26) — **REUSE, do not duplicate:**
```typescript
export const dateRangeSchema = z
  .object({
    start: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
    end: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  })
  .refine((data) => data.start <= data.end, {
    message: 'Start date must be before or equal to end date',
    path: ['start'],
  });
```

**New schema pattern** — if dashboard has its own validation needs, follow this structure:
```typescript
import { z } from 'zod';

export const dashboardQuerySchema = z.object({
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
});
```

---

### 7. `src/repositories/index.ts` — MODIFY (barrel export)

**Analog:** `src/repositories/index.ts` (lines 1-5) — add dashboard repository export if needed (SalesTrendRepository already exported).

**Pattern** (lines 1-5):
```typescript
export { OwnerRepository } from './OwnerRepository';
export { DailySalesRepository } from './DailySalesRepository';
export { SalesTrendRepository } from './SalesTrendRepository';
export { StatusLogRepository } from './StatusLogRepository';
export { DailyReportRepository } from './DailyReportRepository';
```

`SalesTrendRepository` is already exported. No change needed unless a new repository is created.

---

## Frontend Pattern Assignments (Greenfield)

The frontend has no existing codebase analogs. All patterns come from **RESEARCH.md code examples** and **general React/Vite/Tailwind conventions**. Below are the concrete code excerpts to copy.

### 7. `frontend/vite.config.ts` — NEW (config)

**Source:** RESEARCH.md § Pattern 4 (lines 358-376)

```typescript
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

---

### 8. `frontend/src/api/client.ts` — NEW (utility, request-response)

**Source:** RESEARCH.md § Code Example (lines 569-630)

**Auth token pattern** — MUST match backend: the Phase 1 backend reads `Authorization: Bearer <token>` header (see `src/middleware/authMiddleware.ts` line 13-14). Token is returned in JSON body, NOT cookies.

```typescript
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

---

### 9. `frontend/src/hooks/usePolling.ts` — NEW (hook, event-driven)

**Source:** RESEARCH.md § Pattern 5 (lines 381-418)

```typescript
import { useEffect, useRef } from 'react';

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

---

### 10. `frontend/src/hooks/useDashboard.ts` — NEW (hook, request-response)

**Source:** RESEARCH.md § Code Example (lines 634-683)

```typescript
import { useState, useCallback } from 'react';
import { get } from '../api/client';
import { usePolling } from './usePolling';

interface DashboardData {
  trends: Array<{ date: string; revenue: number; menu_popularity: string }>;
  totalRevenue: number;
  transactionCount: number;
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

---

### 11. `frontend/src/lib/format.ts` — NEW (utility, transform)

**Source:** RESEARCH.md § Code Example (lines 537-565)

```typescript
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

---

### 12. `frontend/src/lib/chartConfig.ts` — NEW (utility)

**Source:** RESEARCH.md § Pattern 1 (lines 247-275) + § Open Questions #3 (lines 726-734)

**Chart.js tree-shaken registration:**
```typescript
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
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
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
```

**Dark theme color constants** (from RESEARCH.md Open Questions #3):
```typescript
export const CHART_COLORS = {
  background: '#1a1a2e',
  cardBg: '#16213e',
  primaryText: '#ffffff',
  accent: '#fbbf24',      // amber-400 — revenue line + positive markers
  decline: '#ef4444',       // red-500 — decline point markers + annotations
  chartGrid: 'rgba(255, 255, 255, 0.1)',
  tooltipBg: 'rgba(0, 0, 0, 0.85)',
} as const;
```

---

### 13. `frontend/src/components/dashboard/LineChart.tsx` — NEW (component)

**Source:** RESEARCH.md § Patterns 1-3

**Per-point color for decline detection** (Pattern 2, lines 285-301):
```typescript
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

**Line Chart tooltip callback** (Pattern 3, lines 309-326):
```typescript
options: {
  plugins: {
    tooltip: {
      callbacks: {
        label: (context) => {
          return `Rp ${new Intl.NumberFormat('id-ID').format(context.parsed.y)}`;
        },
        title: (items) => {
          return items[0].label; // date label from x-axis
        },
      },
    },
  },
}
```

---

### 14. `frontend/src/components/dashboard/PieChart.tsx` — NEW (component)

**Source:** RESEARCH.md § Pattern 3 (lines 329-348)

**Pie Chart tooltip callback:**
```typescript
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

---

### 15. `frontend/src/index.css` — NEW (style)

**Source:** RESEARCH.md § Pattern 6 (lines 423-429)

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

Add `<html class="dark">` in `index.html`. Toggle dark mode via `document.documentElement.classList.toggle('dark')`.

---

### 16. `frontend/src/tsconfig.json` — NEW (config)

**Source:** Root `tsconfig.json` (lines 1-20) — copy strict-mode patterns. Example:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

### 17. `frontend/src/types/dashboard.ts` — NEW (types)

**Source:** Derived from `prisma/schema.prisma` SalesTrend model (lines 47-58) and Prisma generated types.

```typescript
// Mirrors SalesTrend schema + parsed menu_popularity
export interface SalesTrendItem {
  id: string;
  date: string;           // ISO date string from API
  revenue: number;
  menu_popularity: MenuPopularity;  // parsed from JSON string
  outlet_id: string;
}

export interface MenuPopularity {
  items: Array<{
    name: string;
    count: number;
    percentage: number;
  }>;
}

export interface DashboardData {
  trends: SalesTrendItem[];
  summary: {
    totalRevenue: number;
    transactionCount: number;
  };
}

export interface DateRange {
  start: string;  // YYYY-MM-DD
  end: string;    // YYYY-MM-DD
}
```

---

## Shared Patterns (Cross-Cutting)

### A. Authentication (Backend)

**Source:** `src/middleware/authMiddleware.ts` (full file, 35 lines)
**Apply to:** All controller handlers in `DashboardController`, all route registrations in `dashboard.routes.ts`

**Pattern:** Every protected endpoint uses `authMiddleware` which:
1. Reads `Authorization: Bearer <token>` header (line 13-14)
2. Verifies JWT via `verifyToken()` (line 26)
3. Attaches `req.user = { userId, outletId }` (line 27)
4. All data queries are scoped to `req.user!.outletId` (line 31-32 of SalesController)

```typescript
// In route file
router.get('/', authMiddleware, controller.getDashboard.bind(controller));

// In controller handler
const outletId = req.user!.outletId;
```

### B. Error Response Format (Backend → Frontend)

**Source:** `src/controllers/SalesController.ts` (lines 42-57) and `src/middleware/errorHandler.ts` (lines 13-62)
**Apply to:** All backend controllers and services; frontend `api/client.ts` error parsing

**Standard error shape:**
```typescript
{
  success: false,
  error: {
    code: 'ERROR_CODE',     // UPPER_SNAKE_CASE
    message: 'Human message',
    details?: {}             // optional, for Zod validation errors
  }
}
```

**Standard success shape:**
```typescript
{
  success: true,
  data: { ... }
}
```

### C. Validation (Backend)

**Source:** `src/validation/sales.schema.ts` (lines 14-26)
**Apply to:** `DashboardService.getDashboard()` — reuse `dateRangeSchema` directly

```typescript
import { dateRangeSchema } from '../validation/sales.schema';

// In service method:
dateRangeSchema.parse({ start, end });
```

### D. Repository Pattern (Backend)

**Source:** `src/repositories/SalesTrendRepository.ts` (lines 1-88), `src/repositories/DailySalesRepository.ts` (lines 1-78)
**Apply to:** Any new repository methods

**Pattern:**
1. Import `PrismaClient` and model type from `@prisma/client`
2. Import singleton `prisma` from `../lib/prisma`
3. Class with `private prisma: PrismaClient` field
4. Constructor assigns `this.prisma = prisma`
5. Methods return Prisma query results directly (no try/catch — errors bubble to controller/errorHandler)

```typescript
import { PrismaClient, SalesTrend } from '@prisma/client';
import prisma from '../lib/prisma';

export class SomeRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async findSomething(...): Promise<SomeType> {
    return this.prisma.someModel.findMany({ ... });
  }
}
```

### E. Frontend → Backend Response Type Matching

**Source:** Backend controller response format → Frontend type definitions
**Apply to:** `frontend/src/types/dashboard.ts`, `frontend/src/api/client.ts`, `frontend/src/hooks/useDashboard.ts`

The frontend `get<T>()` function expects the backend response shape `{ success: boolean; data: T }`. Always type the API response accordingly:

```typescript
// Backend response:
res.status(200).json({ success: true, data: dashboard });

// Frontend typing:
const result = await get<{ success: boolean; data: DashboardData }>(
  `/dashboard?start=${start}&end=${end}`
);
// result.data is DashboardData
```

### F. Date Handling (Cross-Tier)

**Source:** `src/services/SalesService.ts` (lines 94-95) and `src/validation/sales.schema.ts` (lines 14-26)
**Apply to:** Backend `DashboardService`, frontend `DateFilter` component

**Backend pattern — parse YYYY-MM-DD with time boundary:**
```typescript
const startDate = new Date(start + 'T00:00:00Z');
const endDate = new Date(end + 'T23:59:59.999Z');
```

**Validation format:** Always YYYY-MM-DD strings. Validated with Zod regex on backend; frontend should validate format before sending.

### G. Module Export Pattern (Barrel Exports)

**Source:** `src/repositories/index.ts` (lines 1-5)
**Apply to:** Any new backend modules

```typescript
export { SomeClass } from './SomeFile';
```

---

## No Analog Found

Files with no close match in the codebase (planner should use RESEARCH.md patterns and standard conventions instead):

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `frontend/*` (all 28 files) | various | various | Greenfield frontend — no existing React/Vite/Tailwind code in this repo |
| All test files (8 files) | test | various | No existing test files in the codebase |
| `frontend/package.json` | config | — | No frontend dependencies exist yet |

**Guidance for planner:** For all "no analog" files:
1. **Backend tests:** Follow the controller/service pattern from the existing codebase. Use supertest for HTTP tests (consistent with Express). Mock Prisma with a pattern consistent with the existing DI approach.
2. **Frontend files:** Use the concrete code excerpts from RESEARCH.md (already embedded in § Frontend Pattern Assignments above). Scaffold with `npm create vite@latest frontend -- --template react-ts`.
3. **Frontend tests:** Use Vitest + React Testing Library + jsdom. Follow standard React component testing patterns since there's no existing test infrastructure.

---

## Metadata

**Analog search scope:** `src/` (controllers, services, repositories, routes, middleware, validation, lib)
**Files scanned:** 23 backend source files + prisma/schema.prisma + tsconfig.json + package.json + OPENCODE.md
**Pattern extraction date:** 2026-06-26
**Backend pattern coverage:** 6/6 files have exact or self-modify analogs
**Frontend pattern coverage:** 0/28 files have existing analogs (all rely on RESEARCH.md code examples)
