import { FastifyInstance } from 'fastify';
import { userService } from '../services/user.service.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { createUserSchema, updateUserSchema, updateUserStatusSchema } from '../utils/validation.js';
import { ZodError } from 'zod';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    try {
      const { page = '1', limit = '20', role, status, search } = request.query as any;
      
      const result = await userService.listUsers({
        page: parseInt(page),
        limit: parseInt(limit),
        role,
        status,
        search,
      });
      
      return reply.send({
        success: true,
        ...result,
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

  fastify.get('/:id', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await userService.getUserById(id);
      
      return reply.send({
        success: true,
        data: user,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
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

  fastify.post('/', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    try {
      const data = createUserSchema.parse(request.body);
      const user = await userService.createUser(data);
      
      return reply.status(201).send({
        success: true,
        data: user,
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
      
      if (error instanceof Error && error.message === 'Email already registered') {
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: 'Email already registered',
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

  fastify.put('/:id', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateUserSchema.parse(request.body);
      const user = await userService.updateUser(id, data);
      
      return reply.send({
        success: true,
        data: user,
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
      
      if (error instanceof Error && error.message === 'User not found') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
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

  fastify.patch('/:id/status', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = updateUserStatusSchema.parse(request.body);
      const user = await userService.updateUserStatus(id, data.status);
      
      return reply.send({
        success: true,
        data: user,
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
      
      if (error instanceof Error && error.message === 'User not found') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
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

  fastify.delete('/:id', { preHandler: [requireRole('ADMIN')] }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      
      if (id === request.user!.id) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'You cannot delete your own account',
        });
      }
      
      const result = await userService.deleteUser(id);
      
      return reply.send({
        success: true,
        ...result,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'User not found') {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: 'User not found',
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
