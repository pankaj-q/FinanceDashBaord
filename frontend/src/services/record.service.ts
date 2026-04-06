import api from './api';
import type { FinancialRecord, RecordType, PaginatedResponse, ApiResponse } from '../types';

export interface RecordFilters {
  type?: RecordType;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}

export const recordService = {
  async getRecords(filters?: RecordFilters): Promise<PaginatedResponse<FinancialRecord>> {
    const { data } = await api.get<PaginatedResponse<FinancialRecord>>('/records', { params: filters });
    return data;
  },

  async getRecord(id: string): Promise<FinancialRecord> {
    const { data } = await api.get<ApiResponse<FinancialRecord>>(`/records/${id}`);
    return data.data!;
  },

  async createRecord(record: {
    amount: number;
    type: RecordType;
    category: string;
    date: string;
    description?: string;
    notes?: string;
  }): Promise<FinancialRecord> {
    const { data } = await api.post<ApiResponse<FinancialRecord>>('/records', record);
    return data.data!;
  },

  async updateRecord(id: string, record: Partial<{
    amount: number;
    type: RecordType;
    category: string;
    date: string;
    description: string | null;
    notes: string | null;
  }>): Promise<FinancialRecord> {
    const { data } = await api.put<ApiResponse<FinancialRecord>>(`/records/${id}`, record);
    return data.data!;
  },

  async deleteRecord(id: string): Promise<void> {
    await api.delete(`/records/${id}`);
  },
};
