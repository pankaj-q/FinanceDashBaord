import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import { prisma } from './utils/prisma.js';
import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { recordRoutes } from './routes/record.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';

const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
});

async function start() {
  try {
    await fastify.register(cors, {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://finance-dashboard.example.com']
        : ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
    });

    await fastify.register(helmet, {
      contentSecurityPolicy: false,
    });

    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute',
      errorResponseBuilder: () => ({
        statusCode: 429,
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
      }),
    });

    await fastify.register(jwt, {
      secret: process.env.JWT_SECRET || 'secret',
    });

    fastify.get('/api/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(userRoutes, { prefix: '/api/users' });
    await fastify.register(recordRoutes, { prefix: '/api/records' });
    await fastify.register(dashboardRoutes, { prefix: '/api/dashboard' });

    fastify.setErrorHandler((error, request, reply) => {
      request.log.error(error);
      
      if (error.validation) {
        return reply.status(400).send({
          statusCode: 400,
          error: 'Validation Error',
          message: error.message,
          details: error.validation,
        });
      }

      return reply.status(error.statusCode || 500).send({
        statusCode: error.statusCode || 500,
        error: error.name || 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
      });
    });

    const port = parseInt(process.env.PORT || '3001');
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    
    console.log(`\n🚀 Finance Dashboard API running at http://${host}:${port}`);
    console.log(`📚 API Documentation: http://localhost:${port}/api/health\n`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

const shutdown = async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
