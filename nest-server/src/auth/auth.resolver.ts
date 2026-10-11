import { UnauthorizedException, UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { User } from '../users/models/user.model.js';
import { PaginatedUsersResponse, UsersQueryInput } from '../users/dto/users-query.dto.js';
import {
  CreateUserInput,
  UpdateUserInput,
  UpdateUserStatusInput,
} from '../users/dto/user-management.dto.js';
import { UsersService } from '../users/users.service.js';
import { AuthService, REFRESH_COOKIE_NAME } from './auth.service.js';
import { AuthResponse, LoginInput, RefreshTokenInput, RegisterInput } from './dto/auth.dto.js';

interface GraphQLContext {
  req: Request;
  res: Response;
}

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') input: RegisterInput,
    @Context() context: GraphQLContext,
  ): Promise<AuthResponse> {
    const result = await this.authService.register(input);
    if (context.res) {
      this.authService.setRefreshTokenCookie(context.res, result.refreshToken);
    }
    return result;
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: LoginInput,
    @Context() context: GraphQLContext,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(input);
    if (context.res) {
      this.authService.setRefreshTokenCookie(context.res, result.refreshToken);
    }
    return result;
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Context() context: GraphQLContext,
    @Args('input', { type: () => RefreshTokenInput, nullable: true }) input?: RefreshTokenInput,
  ): Promise<AuthResponse> {
    const token = context.req?.cookies?.[REFRESH_COOKIE_NAME] || input?.refreshToken;
    if (!token) {
      throw new UnauthorizedException('No refresh token found in httpOnly cookie');
    }

    const result = await this.authService.refreshTokens(token);
    if (context.res) {
      this.authService.setRefreshTokenCookie(context.res, result.refreshToken);
    }
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(
    @CurrentUser() user: { id: number },
    @Context() context: GraphQLContext,
  ): Promise<boolean> {
    await this.authService.logout(user.id);
    if (context.res) {
      this.authService.clearRefreshTokenCookie(context.res);
    }
    return true;
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard)
  async me(@CurrentUser() user: User): Promise<User> {
    return user;
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard)
  async users(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Query(() => PaginatedUsersResponse)
  @UseGuards(GqlAuthGuard)
  async paginatedUsers(
    @Args('input', { type: () => UsersQueryInput, nullable: true })
    input?: UsersQueryInput,
  ): Promise<PaginatedUsersResponse> {
    return this.usersService.findPaginated(input ?? {});
  }

  @Query(() => User, { nullable: true })
  @UseGuards(GqlAuthGuard)
  async user(
    @Args('id', { type: () => ID }) id: string | number,
  ): Promise<User | null> {
    const strId = String(id);
    const numericId = Number(strId);
    if (!Number.isNaN(numericId) && Number.isInteger(numericId) && numericId > 0 && String(numericId) === strId) {
      return this.usersService.findById(numericId);
    }
    return this.usersService.findByPid(strId);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async createUser(
    @Args('input') input: CreateUserInput,
  ): Promise<User> {
    return this.authService.createUser(input);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(
    @Args('input') input: UpdateUserInput,
  ): Promise<User> {
    return this.authService.updateUser(input);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUserStatus(
    @Args('input') input: UpdateUserStatusInput,
  ): Promise<User> {
    return this.authService.updateUserStatus(input);
  }
}
