import { FastifyInstance } from 'fastify';
import { recordService } from '../services/record.service.js';
import { authenticate, requireRole, canCreateRecords, canEditRecords, canDeleteRecords } from '../middleware/auth.js';
import { createRecordSchema, updateRecordSchema, recordFiltersSchema } from '../utils/validation.js';
import { ZodError } from 'zod';

export async function recordRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', { preHandler: [requireRole('VIEWER', 'ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const params = recordFiltersSchema.parse(request.query);
      const isAdmin = request.user!.role === 'ADMIN';
      const isOwnOnly = request.user!.role === 'VIEWER' || request.user!.role === 'ANALYST';
      
      const result = await recordService.listRecords({
        ...params,
        userId: isOwnOnly ? request.user!.id : undefined,
      });
      
      return reply.send({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
          details: error.errors,
        });
      }
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });

  fastify.get('/:id', { preHandler: [requireRole('VIEWER', 'ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const record = await recordService.getRecordById(id);
      
      const isOwnOnly = request.user!.role !== 'ADMIN';
      if (isOwnOnly && record.userId !== request.user!.id) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You can only view your own records',
        });
      }
      
      return reply.send({
        success: true,
        data: record,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Record not found') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Record not found',
        });
      }
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });

  fastify.post('/', { preHandler: [requireRole('ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      if (!canCreateRecords(request.user!.role)) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to create records',
        });
      }

      const data = createRecordSchema.parse(request.body);
      const record = await recordService.createRecord(data, request.user!.id);
      
      return reply.status(201).send({
        success: true,
        data: record,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
          details: error.errors,
        });
      }
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });

  fastify.put('/:id', { preHandler: [requireRole('ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateRecordSchema.parse(request.body);
      const isAdmin = request.user!.role === 'ADMIN';
      
      const existingRecord = await recordService.getRecordById(id);
      const isOwner = existingRecord.userId === request.user!.id;
      
      if (!canEditRecords(request.user!.role, isOwner)) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to edit this record',
        });
      }

      const record = await recordService.updateRecord(id, data, request.user!.id, isAdmin);
      
      return reply.send({
        success: true,
        data: record,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
          details: error.errors,
        });
      }
      
      if (error instanceof Error && error.message === 'Record not found') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Record not found',
        });
      }
      
      if (error instanceof Error && error.message.includes('only')) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: error.message,
        });
      }
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });

  fastify.delete('/:id', { preHandler: [requireRole('ANALYST', 'ADMIN')] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const isAdmin = request.user!.role === 'ADMIN';
      
      const existingRecord = await recordService.getRecordById(id);
      const isOwner = existingRecord.userId === request.user!.id;
      
      if (!canDeleteRecords(request.user!.role, isOwner)) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'You do not have permission to delete this record',
        });
      }

      const result = await recordService.deleteRecord(id, request.user!.id, isAdmin);
      
      return reply.send({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Record not found') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'Record not found',
        });
      }
      
      if (error instanceof Error && error.message.includes('only')) {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: error.message,
        });
      }
      request.log.error(error);
      return reply.status(500).send({
        statusCode: 500,
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
  });
}
