import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

export interface ReportRow {
  date: string; // YYYY-MM-DD
  revenue: number;
  topMenu: string;
  dayCount: number;
}

export interface ReportData {
  rows: ReportRow[];
  topItems: string[];
}

interface ParsedMenuPopularity {
  items: { name: string; count: number; percentage: number }[];
}

/**
 * ReportRepository aggregates SalesTrend (daily revenue + menu popularity)
 * and DailySales (daily day counts) into a unified report dataset
 * scoped to a single outlet. Per D-31/D-33b the report API lives-query the
 * pre-computed CQRS-lite tables directly (no caching layer / DailySalesReport
 * snapshot table which has no population mechanism yet).
 */
export class ReportRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getReportData(
    outlet_id: string,
    start: Date,
    end: Date
  ): Promise<ReportData> {
    // 1. SalesTrend rows — daily revenue + menu popularity (JSON string)
    const trends = await this.prisma.salesTrend.findMany({
      where: {
        outlet_id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    // 2. DailySales rows — daily day count
    const dailySales = await this.prisma.dailySales.findMany({
      where: {
        outlet_id,
        date: { gte: start, lte: end },
      },
      orderBy: { date: 'asc' },
    });

    // 3. Index DailySales rows by UTC YYYY-MM-DD for transaction-count join
    const dayCountByDate = new Map<string, number>();
    for (const ds of dailySales) {
      dayCountByDate.set(toUTCDateString(ds.date), 1);
    }
    // DailySales has @@unique([outlet_id, date]) so at most one row per day;
    // represent the day count implicitly as 1 per daily record. The
    // report's dayCount is the count of daily sales records across the
    // period — each DailySales row represents one aggregated sales day, so we
    // surface the per-row count as 1 when a DailySales record exists for that
    // date, 0 otherwise. (Per schema, DailySales does not store a per-row
    // transaction_count; the daily record itself is the transaction unit.)

    // 4. Aggregate top menu item names across the entire period
    const itemCounts = new Map<string, number>();
    for (const t of trends) {
      const parsed = safeParseMenuPopularity(t.menu_popularity);
      for (const item of parsed.items) {
        itemCounts.set(item.name, (itemCounts.get(item.name) ?? 0) + item.count);
      }
    }
    const topItems = [...itemCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name]) => name);

    // 5. Map SalesTrend rows into ReportRow with matched day counts
    const rows: ReportRow[] = trends.map((t) => {
      const dateStr = toUTCDateString(t.date);
      const parsed = safeParseMenuPopularity(t.menu_popularity);
      const sortedItems = [...parsed.items].sort((a, b) => b.count - a.count);
      const topMenu = sortedItems.length > 0 ? sortedItems[0].name : '-';
      const dayCount = dayCountByDate.has(dateStr) ? 1 : 0;
      return {
        date: dateStr,
        revenue: t.revenue,
        topMenu,
        dayCount,
      };
    });

    return { rows, topItems };
  }
}

/** Format a Date as a UTC YYYY-MM-DD string (independent of local tz). */
function toUTCDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Parse the menu_popularity JSON string tolerantly; return empty on failure. */
function safeParseMenuPopularity(raw: string): ParsedMenuPopularity {
  try {
    const parsed = JSON.parse(raw) as ParsedMenuPopularity;
    if (parsed && Array.isArray(parsed.items)) {
      return parsed;
    }
  } catch {
    // fall through to empty
  }
  return { items: [] };
}