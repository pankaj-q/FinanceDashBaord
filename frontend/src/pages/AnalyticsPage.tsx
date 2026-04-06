import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  DollarSign
} from 'lucide-react';
import { Card, CardTitle, Select } from '../components/ui';
import { dashboardService } from '../services/dashboard.service';
import type { MonthlyTrend, CategoryBreakdown, DashboardSummary } from '../types';
import { CATEGORY_LABELS } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316', '#14b8a6'];

export function AnalyticsPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [trendMonths, setTrendMonths] = useState(12);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, trendsData, categoriesData] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getTrends(trendMonths),
          dashboardService.getCategories(),
        ]);
        
        setSummary(summaryData);
        setTrends(trendsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [trendMonths]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const netSavingsRate = summary && summary.totalIncome > 0 
    ? ((summary.totalIncome - summary.totalExpenses) / summary.totalIncome * 100).toFixed(1)
    : '0';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Deep dive into your financial data</p>
        </div>
        <Select
          value={trendMonths.toString()}
          onChange={(e) => setTrendMonths(parseInt(e.target.value))}
          options={[
            { value: '6', label: 'Last 6 months' },
            { value: '12', label: 'Last 12 months' },
            { value: '24', label: 'Last 24 months' },
          ]}
          className="w-48"
        />
      </motion.div>

      <div className="grid grid-cols-4 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="text-center">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-sm text-gray-500">Total Income</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {formatCurrency(summary?.totalIncome || 0)}
            </p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="text-center">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {formatCurrency(summary?.totalExpenses || 0)}
            </p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="text-center">
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-sm text-gray-500">Net Savings</p>
            <p className="text-2xl font-bold text-primary-600 mt-1">
              {formatCurrency(summary?.netBalance || 0)}
            </p>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
              <PieChartIcon className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-sm text-gray-500">Savings Rate</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">
              {netSavingsRate}%
            </p>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-5 h-5 text-primary-600" />
                <CardTitle>Income & Expense Trend</CardTitle>
              </div>
            </div>
            <div className="p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => {
                      const [year, month] = value.split('-');
                      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => {
                      const [year, month] = label.split('-');
                      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                    name="Income"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2 }}
                    name="Expenses"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: '#8b5cf6', strokeWidth: 2 }}
                    name="Net"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <PieChartIcon className="w-5 h-5 text-primary-600" />
                <CardTitle>Category Distribution</CardTitle>
              </div>
            </div>
            <div className="p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    dataKey="total"
                    nameKey="category"
                    label={({ category, percentage }) => `${CATEGORY_LABELS[category] || category} (${percentage.toFixed(1)}%)`}
                    labelLine={false}
                  >
                    {categories.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.div variants={itemVariants}>
        <Card padding="none">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <AreaChart className="w-5 h-5 text-primary-600" />
              <CardTitle>Cash Flow Analysis</CardTitle>
            </div>
          </div>
          <div className="p-6 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const [year, month] = value.split('-');
                    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
                  }}
                />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => {
                    const [year, month] = label.split('-');
                    return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="net"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#colorNet)"
                  name="Net Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card padding="none">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-primary-600" />
              <CardTitle>Category Breakdown</CardTitle>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Count</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat, index) => (
                  <tr key={cat.category} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900">
                          {CATEGORY_LABELS[cat.category] || cat.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(cat.total)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {cat.count}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full"
                            style={{ 
                              width: `${cat.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-12 text-right">
                          {cat.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
