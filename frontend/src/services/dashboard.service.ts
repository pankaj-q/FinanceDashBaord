import api from './api';
import type { DashboardSummary, CategoryBreakdown, MonthlyTrend, RecentActivity, ApiResponse } from '../types';

export const dashboardService = {
  async getSummary(startDate?: string, endDate?: string): Promise<DashboardSummary> {
    const { data } = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary', {
      params: { startDate, endDate },
    });
    return data.data!;
  },

  async getCategories(startDate?: string, endDate?: string): Promise<CategoryBreakdown[]> {
    const { data } = await api.get<ApiResponse<CategoryBreakdown[]>>('/dashboard/categories', {
      params: { startDate, endDate },
    });
    return data.data!;
  },

  async getTrends(months: number = 6): Promise<MonthlyTrend[]> {
    const { data } = await api.get<ApiResponse<MonthlyTrend[]>>('/dashboard/trends', {
      params: { months },
    });
    return data.data!;
  },

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const { data } = await api.get<ApiResponse<RecentActivity[]>>('/dashboard/recent', {
      params: { limit },
    });
    return data.data!;
  },

  async getChartTrend(months: number = 12): Promise<{
    labels: string[];
    income: number[];
    expenses: number[];
  }> {
    const { data } = await api.get<ApiResponse<{
      labels: string[];
      income: number[];
      expenses: number[];
    }>>('/dashboard/chart/trend', {
      params: { months },
    });
    return data.data!;
  },
};
