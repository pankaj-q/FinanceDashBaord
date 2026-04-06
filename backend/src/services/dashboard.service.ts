import { prisma } from '../utils/prisma.js';
import type { DashboardSummary, CategoryBreakdown, MonthlyTrend, RecentActivity } from '../types/index.js';

interface DashboardParams {
  userId?: string;
  isAdmin?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class DashboardService {
  async getSummary(params: DashboardParams): Promise<DashboardSummary> {
    const { userId, isAdmin, startDate, endDate } = params;

    const where: any = { deletedAt: null };
    if (!isAdmin && userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const [incomeResult, expenseResult, totalCount] = await Promise.all([
      prisma.record.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.record.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.record.count({ where }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpenses = expenseResult._sum.amount || 0;

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      incomeCount: incomeResult._count,
      expenseCount: expenseResult._count,
      averageTransaction: totalCount > 0 ? (totalIncome + totalExpenses) / totalCount : 0,
    };
  }

  async getCategoryBreakdown(params: DashboardParams): Promise<CategoryBreakdown[]> {
    const { userId, isAdmin, startDate, endDate } = params;

    const where: any = { deletedAt: null };
    if (!isAdmin && userId) where.userId = userId;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = startDate;
      if (endDate) where.date.lte = endDate;
    }

    const records = await prisma.record.groupBy({
      by: ['category'],
      where,
      _sum: { amount: true },
      _count: true,
    });

    const totalAmount = records.reduce((sum, r) => sum + (r._sum.amount || 0), 0);

    return records.map(r => ({
      category: r.category,
      total: r._sum.amount || 0,
      count: r._count,
      percentage: totalAmount > 0 ? ((r._sum.amount || 0) / totalAmount) * 100 : 0,
    })).sort((a, b) => b.total - a.total);
  }

  async getMonthlyTrends(params: DashboardParams, months: number = 6): Promise<MonthlyTrend[]> {
    const { userId, isAdmin } = params;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const where: any = {
      deletedAt: null,
      date: { gte: startDate },
    };
    if (!isAdmin && userId) where.userId = userId;

    const records = await prisma.record.findMany({
      where,
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    const monthlyData: Record<string, { income: number; expenses: number }> = {};
    
    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7);
      monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    records.forEach(record => {
      const monthKey = record.date.toISOString().slice(0, 7);
      if (monthlyData[monthKey]) {
        if (record.type === 'INCOME') {
          monthlyData[monthKey].income += record.amount;
        } else {
          monthlyData[monthKey].expenses += record.amount;
        }
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        net: data.income - data.expenses,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  async getRecentActivity(params: DashboardParams, limit: number = 10): Promise<RecentActivity[]> {
    const { userId, isAdmin } = params;

    const where: any = { deletedAt: null };
    if (!isAdmin && userId) where.userId = userId;

    const records = await prisma.record.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        amount: true,
        type: true,
        category: true,
        description: true,
        date: true,
        createdAt: true,
        user: {
          select: { name: true },
        },
      },
    });

    return records.map(r => ({
      id: r.id,
      amount: r.amount,
      type: r.type as 'INCOME' | 'EXPENSE',
      category: r.category,
      description: r.description,
      date: r.date.toISOString(),
      createdBy: r.user.name,
    }));
  }

  async getExpenseIncomeTrend(params: DashboardParams): Promise<{ labels: string[]; income: number[]; expenses: number[] }> {
    const trends = await this.getMonthlyTrends(params, 12);
    
    return {
      labels: trends.map(t => {
        const [year, month] = t.month.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
      }),
      income: trends.map(t => t.income),
      expenses: trends.map(t => t.expenses),
    };
  }
}

export const dashboardService = new DashboardService();
