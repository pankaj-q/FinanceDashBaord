import { prisma } from '../utils/prisma.js';
import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import type { AuthenticatedUser, Role, Status } from '../types/index.js';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
const JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET || 'refresh-secret');

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  async register(email: string, password: string, name: string) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'VIEWER',
        status: 'ACTIVE',
      },
    });

    const tokens = await this.generateTokens(user);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new Error('Account is not active');
    }

    const tokens = await this.generateTokens(user);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const { payload } = await jwtVerify(refreshToken, JWT_REFRESH_SECRET);
      
      const user = await prisma.user.findUnique({
        where: { id: payload.sub as string },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const tokens = await this.generateTokens(user);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken },
      });

      return tokens;
    } catch {
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    return this.sanitizeUser(user);
  }

  private async generateTokens(user: { id: string; email: string; name: string; role: string }): Promise<TokenPair> {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      status: 'ACTIVE',
    };

    const accessToken = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('15m')
      .sign(JWT_SECRET);

    const refreshToken = await new SignJWT({ sub: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_REFRESH_SECRET);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: { id: string; email: string; name: string; role: string; status: string; createdAt: Date }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      status: user.status as Status,
      createdAt: user.createdAt,
    };
  }
}

export const authService = new AuthService();
