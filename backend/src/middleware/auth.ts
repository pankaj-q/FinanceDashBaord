import { FastifyRequest, FastifyReply } from 'fastify';
import type { AuthenticatedUser, Role } from '../types/index.js';

interface AuthenticatedUserRequest extends FastifyRequest {
  user: AuthenticatedUser;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: AuthenticatedUser;
  }
}

export const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();
    
    if (request.user?.status !== 'ACTIVE') {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: 'User account is not active',
      });
    }
  } catch (err) {
    return reply.status(401).send({
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

export const requireRole = (...allowedRoles: Role[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Authentication required',
      });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        statusCode: 403,
        error: 'Forbidden',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      });
    }
  };
};

export const ROLES = {
  VIEWER: ['VIEWER', 'ANALYST', 'ADMIN'] as const,
  ANALYST: ['ANALYST', 'ADMIN'] as const,
  ADMIN: ['ADMIN'] as const,
};

export type RolePermission = keyof typeof ROLES;

export const canAccessRecords = (userRole: Role): boolean => {
  return (ROLES.VIEWER as readonly string[]).includes(userRole);
};

export const canCreateRecords = (userRole: Role): boolean => {
  return (ROLES.ANALYST as readonly string[]).includes(userRole);
};

export const canEditRecords = (userRole: Role, isOwner: boolean): boolean => {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'ANALYST' && isOwner) return true;
  return false;
};

export const canDeleteRecords = (userRole: Role, isOwner: boolean): boolean => {
  if (userRole === 'ADMIN') return true;
  if (userRole === 'ANALYST' && isOwner) return true;
  return false;
};

export const canManageUsers = (userRole: Role): boolean => {
  return userRole === 'ADMIN';
};
