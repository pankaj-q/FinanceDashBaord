import { prisma } from '../utils/prisma.js';
import argon2 from 'argon2';
import type { PaginatedResponse, Role, Status } from '../types/index.js';

interface UserListParams {
  page: number;
  limit: number;
  role?: Role;
  status?: Status;
  search?: string;
}

export class UserService {
  async listUsers(params: UserListParams): Promise<PaginatedResponse<any>> {
    const { page, limit, role, status, search } = params;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { records: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { records: true },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(data: { email: string; password: string; name: string; role?: Role }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await argon2.hash(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'VIEWER',
        status: 'ACTIVE',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return user;
  }

  async updateUser(id: string, data: { email?: string; name?: string; role?: Role }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    if (data.email && data.email !== user.email) {
      const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
      if (existingEmail) {
        throw new Error('Email already in use');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async updateUserStatus(id: string, status: Status) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  async deleteUser(id: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }

    await prisma.user.delete({ where: { id } });
    
    return { message: 'User deleted successfully' };
  }
}

export const userService = new UserService();
