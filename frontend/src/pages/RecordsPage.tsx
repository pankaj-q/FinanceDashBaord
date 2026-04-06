import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
} from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '../components/ui';
import { recordService, RecordFilters } from '../services/record.service';
import { useAuthStore } from '../store/auth.store';
import type { FinancialRecord, RecordType, PaginatedResponse } from '../types';
import { CATEGORIES, CATEGORY_LABELS } from '../types';

export function RecordsPage() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [filters, setFilters] = useState<RecordFilters>({
    type: undefined,
    category: undefined,
    page: 1,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    amount: '',
    type: 'EXPENSE' as RecordType,
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    notes: '',
  });

  const canCreate = user?.role === 'ADMIN' || user?.role === 'ANALYST';
  const canEdit = user?.role === 'ADMIN' || user?.role === 'ANALYST';
  const canDelete = user?.role === 'ADMIN' || user?.role === 'ANALYST';

  useEffect(() => {
    fetchRecords();
  }, [filters]);

  const fetchRecords = async () => {
    setIsLoading(true);
    try {
      const response: PaginatedResponse<FinancialRecord> = await recordService.getRecords(filters);
      setRecords(response.data);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const openCreateModal = () => {
    setEditingRecord(null);
    setFormData({
      amount: '',
      type: 'EXPENSE',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (record: FinancialRecord) => {
    setEditingRecord(record);
    setFormData({
      amount: record.amount.toString(),
      type: record.type,
      category: record.category,
      date: new Date(record.date).toISOString().split('T')[0],
      description: record.description || '',
      notes: record.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        description: formData.description || undefined,
        notes: formData.notes || undefined,
      };

      if (editingRecord) {
        await recordService.updateRecord(editingRecord.id, data);
      } else {
        await recordService.createRecord(data);
      }

      setIsModalOpen(false);
      fetchRecords();
    } catch (error) {
      console.error('Failed to save record:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await recordService.deleteRecord(id);
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete record:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const categoriesForType = formData.type === 'INCOME' ? CATEGORIES.INCOME : CATEGORIES.EXPENSE;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Records</h1>
          <p className="text-gray-500 mt-1">Manage your income and expenses</p>
        </div>
        {canCreate && (
          <Button onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Add Record
          </Button>
        )}
      </div>

      <Card padding="none">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search records..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <Select
            value={filters.type || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value as RecordType || undefined }))}
            options={[
              { value: '', label: 'All Types' },
              { value: 'INCOME', label: 'Income' },
              { value: 'EXPENSE', label: 'Expense' },
            ]}
            className="w-40"
          />

          <Select
            value={filters.category || ''}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value || undefined }))}
            options={[
              { value: '', label: 'All Categories' },
              ...[...CATEGORIES.INCOME, ...CATEGORIES.EXPENSE].map((cat) => ({
                value: cat,
                label: CATEGORY_LABELS[cat],
              })),
            ]}
            className="w-48"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                {(canEdit || canDelete) && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No records found
                  </td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        record.type === 'INCOME' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {CATEGORY_LABELS[record.category] || record.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {record.description || '-'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold text-right ${
                      record.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.amount)}
                    </td>
                    {(canEdit || canDelete) && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {canEdit && (
                          <button
                            onClick={() => openEditModal(record)}
                            className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 text-sm font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRecord ? 'Edit Record' : 'Add New Record'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'INCOME', category: '' }))}
                  className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                    formData.type === 'INCOME'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: 'EXPENSE', category: '' }))}
                  className={`py-2 px-4 rounded-lg border-2 font-medium transition-all ${
                    formData.type === 'EXPENSE'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>

            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
              options={categoriesForType.map((cat) => ({
                value: cat,
                label: CATEGORY_LABELS[cat],
              }))}
              placeholder="Select category"
              required
            />

            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <Input
            label="Description"
            placeholder="Brief description"
            value={formData.description}
            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              placeholder="Additional notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingRecord ? 'Update' : 'Create'} Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
