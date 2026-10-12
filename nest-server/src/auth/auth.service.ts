import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';
import type { Response } from 'express';
import { UsersService } from '../users/users.service.js';
import { LoginInput, RegisterInput } from './dto/auth.dto.js';
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
} from '../users/dto/user-management.dto.js';

import { CaptchaService } from './captcha.service.js';

export const REFRESH_COOKIE_NAME = 'refreshToken';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly captchaService: CaptchaService,
  ) {}

  setRefreshTokenCookie(res: Response, refreshToken: string) {
    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearRefreshTokenCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  }

  async register(input: RegisterInput) {
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const hashedPassword = await argon2.hash(input.password);
    const user = await this.usersService.create({
      email: input.email,
      name: input.name,
      password: hashedPassword,
      role: input.role || 'USER',
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async login(input: LoginInput) {
    // Verify server-side captcha if provided or enforced
    if (!input.captchaId || !input.captchaCode) {
      throw new BadRequestException('Security captcha code is required to sign in.');
    }
    this.captchaService.verify(input.captchaId, input.captchaCode);

    const user = await this.usersService.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await argon2.verify(user.password, input.password);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Account is inactive. Please contact an administrator.');
    }

    if (user.status === 'DELETED') {
      throw new UnauthorizedException('Wrong credentials. Invalid email or password.');
    }

    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Your account has been banned. Access denied.');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-2026-nest-next',
      });

      const userId = Number(payload.sub);
      if (!userId || isNaN(userId)) {
        throw new ForbiddenException('Access Denied: Invalid refresh token payload');
      }

      const user = await this.usersService.findById(userId);
      if (!user || !user.hashedRefreshToken) {
        throw new ForbiddenException('Access Denied: Invalid refresh token');
      }

      if (user.status === 'INACTIVE') {
        throw new ForbiddenException('Account is inactive. Access denied.');
      }

      if (user.status === 'DELETED') {
        throw new ForbiddenException('Account has been removed.');
      }

      if (user.status === 'BANNED') {
        throw new ForbiddenException('Your account has been banned. Access denied.');
      }

      const refreshTokenMatches = await argon2.verify(
        user.hashedRefreshToken,
        refreshToken,
      );
      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access Denied: Refresh token does not match');
      }

      // Generate NEW access & refresh tokens (Token Rotation)
      const tokens = await this.generateTokens(user.id, user.email, user.role);
      // Invalidate old refresh token by saving hash of the NEW refresh token
      await this.updateRefreshTokenHash(user.id, tokens.refreshToken);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      };
    } catch (err) {
      if (err instanceof ForbiddenException || err instanceof BadRequestException) {
        throw err;
      }
      console.error('Error during token refresh:', err);
      throw new ForbiddenException('Access Denied: Refresh token invalid or expired');
    }
  }

  async logout(userId: number): Promise<boolean> {
    await this.usersService.updateRefreshToken(userId, null);
    return true;
  }

  async createUser(input: CreateUserInput) {
    const existing = await this.usersService.findByEmail(input.email);
    if (existing) {
      throw new BadRequestException('A user with this email already exists');
    }

    const hashedPassword = await argon2.hash(input.password);
    return this.usersService.create({
      email: input.email,
      name: input.name,
      password: hashedPassword,
      role: input.role || 'USER',
      status: input.status || 'ACTIVE',
    });
  }

  async updateUser(input: UpdateUserInput) {
    const existing = await this.usersService.findByIdOrPid(input.id);
    if (!existing) {
      throw new NotFoundException(`User with ID or PID "${input.id}" not found`);
    }
    const numericId = existing.id;

    if (input.email && input.email !== existing.email) {
      const emailTaken = await this.usersService.findByEmail(input.email);
      if (emailTaken && emailTaken.id !== numericId) {
        throw new BadRequestException('A user with this email already exists');
      }
    }

    let hashedPassword: string | undefined = undefined;
    if (input.password && input.password.trim() !== '') {
      hashedPassword = await argon2.hash(input.password);
    }

    const updated = await this.usersService.update(numericId, {
      email: input.email,
      name: input.name,
      password: hashedPassword,
      role: input.role,
      status: input.status,
    });

    if (!updated) {
      throw new NotFoundException(`User with ID or PID "${input.id}" could not be retrieved after update`);
    }

    return updated;
  }

  async updateUserStatus(input: UpdateUserStatusInput) {
    const existing = await this.usersService.findByIdOrPid(input.id);
    if (!existing) {
      throw new NotFoundException(`User with ID or PID "${input.id}" not found`);
    }
    const numericId = existing.id;

    const updated = await this.usersService.updateStatus(numericId, input.status);
    if (!updated) {
      throw new NotFoundException(`User with ID or PID "${input.id}" could not be retrieved after update`);
    }

    return updated;
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-access-key-2026-nest-next',
        expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
      }),
      this.jwtService.signAsync(payload, {
        secret:
          process.env.JWT_REFRESH_SECRET || 'super-secret-jwt-refresh-key-2026-nest-next',
        expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async updateRefreshTokenHash(userId: number, refreshToken: string) {
    const hash = await argon2.hash(refreshToken);
    await this.usersService.updateRefreshToken(userId, hash);
  }
}
