import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-jwt-access-key-2026-nest-next',
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(Number(payload.sub));
    if (!user) {
      throw new UnauthorizedException('User not found or deactivated');
    }
    if (user.status === 'INACTIVE') {
      throw new UnauthorizedException('Account is inactive. Access denied.');
    }
    if (user.status === 'DELETED') {
      throw new UnauthorizedException('Account not found.');
    }
    if (user.status === 'BANNED') {
      throw new UnauthorizedException('Your account has been banned. Access denied.');
    }
    return user;
  }
}

