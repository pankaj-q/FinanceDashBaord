import { FastifyInstance } from 'fastify';
import { dashboardService } from '../services/dashboard.service.js';
import { authenticate, requireRole } from '../middleware/auth.js';

export async function dashboardRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/summary', { preHandler: [requireRole('VIEWER', 'ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const { startDate, endDate } = request.query as any;
      
      const isAdmin = request.user!.role === 'ADMIN';
      const userId = isAdmin ? undefined : request.user!.id;

      const summary = await dashboardService.getSummary({
        userId,
        isAdmin,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      return reply.send({
        success: true,
        data: summary,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });

  fastify.get('/categories', { preHandler: [requireRole('ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const { startDate, endDate } = request.query as any;
      
      const isAdmin = request.user!.role === 'ADMIN';
      const userId = isAdmin ? undefined : request.user!.id;

      const breakdown = await dashboardService.getCategoryBreakdown({
        userId,
        isAdmin,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      });
      
      return reply.send({
        success: true,
        data: breakdown,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });

  fastify.get('/trends', { preHandler: [requireRole('ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const { months = '6' } = request.query as any;
      
      const isAdmin = request.user!.role === 'ADMIN';
      const userId = isAdmin ? undefined : request.user!.id;

      const trends = await dashboardService.getMonthlyTrends({
        userId,
        isAdmin,
      }, parseInt(months));
      
      return reply.send({
        success: true,
        data: trends,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });

  fastify.get('/recent', { preHandler: [requireRole('VIEWER', 'ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const { limit = '10' } = request.query as any;
      
      const isAdmin = request.user!.role === 'ADMIN';
      const userId = isAdmin ? undefined : request.user!.id;

      const recent = await dashboardService.getRecentActivity({
        userId,
        isAdmin,
      }, parseInt(limit));
      
      return reply.send({
        success: true,
        data: recent,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });

  fastify.get('/chart/trend', { preHandler: [requireRole('ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const isAdmin = request.user!.role === 'ADMIN';
      const userId = isAdmin ? undefined : request.user!.id;

      const chartData = await dashboardService.getExpenseIncomeTrend({
        userId,
        isAdmin,
      });
      
      return reply.send({
        success: true,
        data: chartData,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });
}
