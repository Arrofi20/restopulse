import {
  SalesTrendRepository,
  MonthlyExpenseRepository,
} from '../repositories';

export interface ProfitLossResult {
  totalRevenue: number;
  totalExpenses: number;
  profitLoss: number;
  isLoss: boolean;
  isBreakEven: boolean;
}

export class ProfitLossService {
  private salesTrendRepo: SalesTrendRepository;
  private expenseRepo: MonthlyExpenseRepository;

  constructor(
    salesTrendRepo?: SalesTrendRepository,
    expenseRepo?: MonthlyExpenseRepository
  ) {
    this.salesTrendRepo = salesTrendRepo ?? new SalesTrendRepository();
    this.expenseRepo = expenseRepo ?? new MonthlyExpenseRepository();
  }

  async calculateByDateRange(
    outlet_id: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProfitLossResult> {
    const [salesSummary, totalExpenses] = await Promise.all([
      this.salesTrendRepo.aggregateSummary(outlet_id, startDate, endDate),
      this.expenseRepo.sumByDateRange(outlet_id, startDate, endDate),
    ]);

    const totalRevenue = salesSummary.totalRevenue;
    const profitLoss = totalRevenue - totalExpenses;

    return {
      totalRevenue,
      totalExpenses,
      profitLoss,
      isLoss: profitLoss < 0,
      isBreakEven: profitLoss === 0,
    };
  }

  async calculateByPeriod(
    outlet_id: string,
    month: number,
    year: number
  ): Promise<ProfitLossResult> {
    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    return this.calculateByDateRange(outlet_id, startDate, endDate);
  }

  async calculateByDateStrings(
    outlet_id: string,
    start: string,
    end: string
  ): Promise<ProfitLossResult> {
    const startDate = new Date(start + 'T00:00:00Z');
    const endDate = new Date(end + 'T23:59:59.999Z');

    return this.calculateByDateRange(outlet_id, startDate, endDate);
  }
}

export default ProfitLossService;
