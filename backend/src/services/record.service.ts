import { prisma } from '../utils/prisma.js';
import type { PaginatedResponse, RecordFilters, CreateRecordInput, UpdateRecordInput } from '../types/index.js';

interface RecordListParams extends RecordFilters {
  page: number;
  limit: number;
  userId?: string;
}

export class RecordService {
  async listRecords(params: RecordListParams): Promise<PaginatedResponse<any>> {
    const { page, limit, userId, type, category, startDate, endDate, minAmount, maxAmount } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
    };

    if (userId) where.userId = userId;
    if (type) where.type = type;
    if (category) where.category = category;
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) where.amount.gte = minAmount;
      if (maxAmount !== undefined) where.amount.lte = maxAmount;
    }

    const [records, total] = await Promise.all([
      prisma.record.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.record.count({ where }),
    ]);

    return {
      data: records,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRecordById(id: string) {
    const record = await prisma.record.findFirst({
      where: { id, deletedAt: null },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!record) {
      throw new Error('Record not found');
    }

    return record;
  }

  async createRecord(data: CreateRecordInput, userId: string) {
    const record = await prisma.record.create({
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: new Date(data.date),
        description: data.description,
        notes: data.notes,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return record;
  }

  async updateRecord(id: string, data: UpdateRecordInput, userId: string, isAdmin: boolean) {
    const record = await prisma.record.findFirst({
      where: { id, deletedAt: null },
    });

    if (!record) {
      throw new Error('Record not found');
    }

    if (!isAdmin && record.userId !== userId) {
      throw new Error('You can only update your own records');
    }

    const updatedRecord = await prisma.record.update({
      where: { id },
      data: {
        amount: data.amount,
        type: data.type,
        category: data.category,
        date: data.date ? new Date(data.date) : undefined,
        description: data.description,
        notes: data.notes,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return updatedRecord;
  }

  async deleteRecord(id: string, userId: string, isAdmin: boolean) {
    const record = await prisma.record.findFirst({
      where: { id, deletedAt: null },
    });

    if (!record) {
      throw new Error('Record not found');
    }

    if (!isAdmin && record.userId !== userId) {
      throw new Error('You can only delete your own records');
    }

    await prisma.record.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Record deleted successfully' };
  }

  async hardDelete(id: string, userId: string, isAdmin: boolean) {
    const record = await prisma.record.findFirst({
      where: { id },
    });

    if (!record) {
      throw new Error('Record not found');
    }

    if (!isAdmin && record.userId !== userId) {
      throw new Error('You can only delete your own records');
    }

    await prisma.record.delete({ where: { id } });

    return { message: 'Record permanently deleted' };
  }
}

export const recordService = new RecordService();
