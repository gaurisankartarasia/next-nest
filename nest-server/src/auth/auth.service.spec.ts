import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import argon2 from 'argon2';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<UsersService>;
  let jwtService: Partial<JwtService>;

  beforeEach(() => {
    usersService = {
      findByEmail: vi.fn(),
      findById: vi.fn(),
      create: vi.fn(),
      updateRefreshToken: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn().mockImplementation((payload) => Promise.resolve(`token-for-${payload.email}`)),
      verifyAsync: vi.fn(),
    };

    authService = new AuthService(
      usersService as UsersService,
      jwtService as JwtService,
    );
  });

  it('should register a new user with hashed password and return tokens', async () => {
    (usersService.findByEmail as any).mockResolvedValue(null);
    const mockCreatedUser = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      password: 'hashedpassword',
      hashedRefreshToken: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (usersService.create as any).mockResolvedValue(mockCreatedUser);
    (usersService.updateRefreshToken as any).mockResolvedValue(mockCreatedUser);

    const result = await authService.register({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    });

    expect(result).toBeDefined();
    expect(result.user.email).toBe('test@example.com');
    expect(result.accessToken).toBe('token-for-test@example.com');
    expect(result.refreshToken).toBe('token-for-test@example.com');
    expect(usersService.create).toHaveBeenCalled();
    expect(usersService.updateRefreshToken).toHaveBeenCalled();
  });

  it('should login an existing user with correct password', async () => {
    const passwordHash = await argon2.hash('secret123');
    const mockUser = {
      id: 2,
      email: 'login@example.com',
      name: 'Login User',
      role: 'USER',
      password: passwordHash,
      hashedRefreshToken: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (usersService.findByEmail as any).mockResolvedValue(mockUser);
    (usersService.updateRefreshToken as any).mockResolvedValue(mockUser);

    const result = await authService.login({
      email: 'login@example.com',
      password: 'secret123',
    });

    expect(result.user.email).toBe('login@example.com');
    expect(result.accessToken).toBe('token-for-login@example.com');
  });

  it('should reject login with wrong password', async () => {
    const passwordHash = await argon2.hash('correctpassword');
    const mockUser = {
      id: 3,
      email: 'badpw@example.com',
      name: 'User',
      role: 'USER',
      password: passwordHash,
      hashedRefreshToken: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    (usersService.findByEmail as any).mockResolvedValue(mockUser);

    await expect(
      authService.login({
        email: 'badpw@example.com',
        password: 'wrongpassword',
      }),
    ).rejects.toThrow('Invalid email or password');
  });

  it('should refresh tokens when valid refresh token is provided', async () => {
    const rawRefreshToken = 'valid-refresh-token';
    const hashedRefresh = await argon2.hash(rawRefreshToken);
    const mockUser = {
      id: 4,
      email: 'refresh@example.com',
      name: 'Refresh User',
      role: 'USER',
      password: 'pwd',
      hashedRefreshToken: hashedRefresh,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    (jwtService.verifyAsync as any).mockResolvedValue({
      sub: 4,
      email: 'refresh@example.com',
      role: 'USER',
    });
    (usersService.findById as any).mockResolvedValue(mockUser);
    (usersService.updateRefreshToken as any).mockResolvedValue(mockUser);

    const result = await authService.refreshTokens(rawRefreshToken);
    expect(result).toBeDefined();
    expect(result.user.id).toBe(4);
    expect(usersService.updateRefreshToken).toHaveBeenCalled();
  });

  it('should logout by setting hashedRefreshToken to null', async () => {
    (usersService.updateRefreshToken as any).mockResolvedValue(null);

    const success = await authService.logout(1);
    expect(success).toBe(true);
    expect(usersService.updateRefreshToken).toHaveBeenCalledWith(1, null);
  });
});

