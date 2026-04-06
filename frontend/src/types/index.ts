export type Role = 'VIEWER' | 'ANALYST' | 'ADMIN';
export type Status = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type RecordType = 'INCOME' | 'EXPENSE';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: Status;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface FinancialRecord {
  id: string;
  amount: number;
  type: RecordType;
  category: string;
  date: string;
  description: string | null;
  notes: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
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

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: unknown;
}

export const CATEGORIES = {
  INCOME: ['SALARY', 'INVESTMENT', 'FREELANCE', 'OTHER_INCOME'],
  EXPENSE: ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'HEALTHCARE', 'EDUCATION', 'SHOPPING', 'HOUSING', 'INSURANCE', 'OTHER_EXPENSE'],
} as const;

export const CATEGORY_LABELS: { [key: string]: string } = {
  SALARY: 'Salary',
  INVESTMENT: 'Investment',
  FREELANCE: 'Freelance',
  OTHER_INCOME: 'Other Income',
  FOOD: 'Food & Dining',
  TRANSPORT: 'Transportation',
  UTILITIES: 'Utilities',
  ENTERTAINMENT: 'Entertainment',
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  SHOPPING: 'Shopping',
  HOUSING: 'Housing',
  INSURANCE: 'Insurance',
  OTHER_EXPENSE: 'Other Expense',
};
