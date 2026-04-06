import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  DollarSign,
  CreditCard,
  PiggyBank
} from 'lucide-react';
import { Card, CardTitle, CardSkeleton, ChartSkeleton } from '../components/ui';
import { dashboardService } from '../services/dashboard.service';
import type { DashboardSummary, RecentActivity, MonthlyTrend } from '../types';
import { CATEGORY_LABELS } from '../types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [categories, setCategories] = useState<{ category: string; total: number; percentage: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, activityData, trendsData, categoriesData] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getRecentActivity(5),
          dashboardService.getTrends(6),
          dashboardService.getCategories(),
        ]);
        
        setSummary(summaryData);
        setRecentActivity(activityData);
        setTrends(trendsData);
        setCategories(categoriesData.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const statCards = summary ? [
    {
      title: 'Total Income',
      value: formatCurrency(summary.totalIncome),
      change: '+12.5%',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(summary.totalExpenses),
      change: '-8.2%',
      changeType: 'negative',
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
    {
      title: 'Net Balance',
      value: formatCurrency(summary.netBalance),
      change: summary.netBalance >= 0 ? '+23.1%' : '-15.3%',
      changeType: summary.netBalance >= 0 ? 'positive' : 'negative',
      icon: Wallet,
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'Avg Transaction',
      value: formatCurrency(summary.averageTransaction),
      change: '+5.3%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ] : [];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
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
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Your financial overview at a glance</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <motion.div key={stat.title} variants={itemVariants}>
            <Card hover className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-400">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <CardTitle>Income vs Expenses Trend</CardTitle>
            </div>
            <div className="p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                    name="Income"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                    name="Expenses"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <CardTitle>Spending by Category</CardTitle>
            </div>
            <div className="p-6 h-80 flex items-center">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="total"
                      nameKey="category"
                    >
                      {categories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-3">
                {categories.map((cat, index) => (
                  <div key={cat.category} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {CATEGORY_LABELS[cat.category] || cat.category}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {cat.percentage.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <CardTitle>Recent Activity</CardTitle>
            </div>
            <div className="divide-y divide-gray-50">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className={`p-2 rounded-xl ${
                    activity.type === 'INCOME' ? 'bg-green-50' : 'bg-red-50'
                  }`}>
                    {activity.type === 'INCOME' ? (
                      <CreditCard className="w-5 h-5 text-green-600" />
                    ) : (
                      <PiggyBank className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {CATEGORY_LABELS[activity.category] || activity.category}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description || 'No description'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      activity.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.type === 'INCOME' ? '+' : '-'}{formatCurrency(activity.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <CardTitle>Monthly Comparison</CardTitle>
            </div>
            <div className="p-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.slice(-6)}>
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
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
