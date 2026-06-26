// STUB — TDD RED phase (Plan 02-05 Task 3). Replaced in GREEN commit.
import type { SalesTrendItem } from '../../types/dashboard';

export interface AggregatedItem {
  name: string;
  count: number;
  revenue: number;
}

export function aggregateMenuItems(_trends: SalesTrendItem[]): AggregatedItem[] {
  return [];
}

export function formatPieTooltipLines(
  _item: AggregatedItem,
  _totalCount: number
): string[] {
  return [];
}

interface PieChartProps {
  trends: SalesTrendItem[];
  loading?: boolean;
}

export function PieChart(_props: PieChartProps) {
  return <div />;
}
