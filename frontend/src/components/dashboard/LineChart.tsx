// STUB — TDD RED phase (Plan 02-05 Task 2). Replaced in GREEN commit.
import type { SalesTrendItem } from '../../types/dashboard';

export function computePointColors(_revenueData: number[]): string[] {
  return [];
}

export function formatLineTooltipLabel(_value: number): string {
  return '';
}

export function formatAxisTick(_value: number): string {
  return '';
}

interface LineChartProps {
  trends: SalesTrendItem[];
  loading?: boolean;
}

export function LineChart(_props: LineChartProps) {
  return <div />;
}
