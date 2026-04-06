import { FastifyInstance } from 'fastify';
import { authService } from '../services/auth.service.js';
import { authenticate } from '../middleware/auth.js';
import { registerSchema, loginSchema } from '../utils/validation.js';
import { ZodError } from 'zod';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    try {
      const data = registerSchema.parse(request.body);
      const result = await authService.register(data.email, data.password, data.name);
      
      return reply.status(201).send({
        success: true,
        data: result,
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

  fastify.post('/login', async (request, reply) => {
    try {
      const data = loginSchema.parse(request.body);
      const result = await authService.login(data.email, data.password);
      
      return reply.send({
        success: true,
        data: result,
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
      
      if (error instanceof Error && error.message === 'Invalid credentials') {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid email or password',
        });
      }

      if (error instanceof Error && error.message === 'Account is not active') {
        return reply.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'Your account is not active. Please contact an administrator.',
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

  fastify.post('/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken?: string };
      
      if (!refreshToken) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Refresh token is required',
        });
      }

      const tokens = await authService.refresh(refreshToken);
      
      return reply.send({
        success: true,
        data: tokens,
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid refresh token')) {
        return reply.status(401).send({
          statusCode: 401,
          error: 'Unauthorized',
          message: 'Invalid or expired refresh token',
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

  fastify.post('/logout', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      await authService.logout(request.user!.id);
      
      return reply.send({
        success: true,
        message: 'Logged out successfully',
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

  fastify.get('/me', { preHandler: [authenticate] }, async (request, reply) => {
    try {
      const user = await authService.getCurrentUser(request.user!.id);
      
      return reply.send({
        success: true,
        data: user,
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
