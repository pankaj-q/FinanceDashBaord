export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';
export type Status = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type RecordType = 'INCOME' | 'EXPENSE';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  status: Status;
  iat: number;
  exp: number;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: Status;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecordFilters {
  type?: RecordType;
  category?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface CreateRecordInput {
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  description?: string;
  notes?: string;
}

export interface UpdateRecordInput {
  amount?: number;
  type?: RecordType;
  category?: string;
  date?: string;
  description?: string | null;
  notes?: string | null;
}

export interface CreateUserInput {
  email: string;
  password: string;
  name: string;
  role?: Role;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
  averageTransaction: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  net: number;
}

export interface RecentActivity {
  id: string;
  amount: number;
  type: RecordType;
  category: string;
  description: string | null;
  date: string;
  createdBy: string;
}
