import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PaginatedUsersResponse, SortOrder, UsersQueryInput } from './dto/users-query.dto.js';

export interface CreateUserData {
  email: string;
  name?: string;
  password: string;
  role?: string;
  status?: string;
  pid?: string;
}

export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: string;
  status?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.client.orm.public.User
      .where({ email })
      .first();
  }

  async findById(id: number) {
    return this.prisma.client.orm.public.User
      .where({ id })
      .first();
  }

  async findByPid(pid: string) {
    return this.prisma.client.orm.public.User
      .where({ pid })
      .first();
  }

  async findByIdOrPid(identifier: string | number) {
    const str = String(identifier).trim();
    const numeric = Number(str);
    if (!Number.isNaN(numeric) && Number.isInteger(numeric) && numeric > 0 && String(numeric) === str) {
      const byId = await this.findById(numeric);
      if (byId) return byId;
    }
    return this.findByPid(str);
  }

  async create(data: CreateUserData) {
    const pid = data.pid || randomUUID();
    return this.prisma.client.orm.public.User.create({
      pid,
      email: data.email,
      name: data.name ?? null,
      password: data.password,
      role: data.role ?? 'USER',
      status: data.status ?? 'ACTIVE',
    });
  }

  async update(id: number, data: UpdateUserData) {
    const updatePayload: any = {};
    if (data.email !== undefined) updatePayload.email = data.email;
    if (data.name !== undefined) updatePayload.name = data.name ?? null;
    if (data.password !== undefined) updatePayload.password = data.password;
    if (data.role !== undefined) updatePayload.role = data.role;
    if (data.status !== undefined) updatePayload.status = data.status;

    await this.prisma.client.orm.public.User
      .where({ id })
      .update(updatePayload);

    return this.findById(id);
  }

  async updateStatus(id: number, status: string) {
    await this.prisma.client.orm.public.User
      .where({ id })
      .update({ status });

    return this.findById(id);
  }

  async updateRefreshToken(id: number, hashedRefreshToken: string | null) {
    return this.prisma.client.orm.public.User
      .where({ id })
      .update({
        hashedRefreshToken: hashedRefreshToken ?? null,
      });
  }

  async findAll() {
    return this.prisma.client.orm.public.User.all();
  }

  async findPaginated(input: UsersQueryInput = {}): Promise<PaginatedUsersResponse> {
    const page = Math.max(1, input.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, input.pageSize ?? 10));
    const skip = (page - 1) * pageSize;
    const search = input.search?.trim();
    const role = input.role?.trim();
    const status = input.status?.trim();
    const sortBy = input.sortBy || 'createdAt';
    const sortOrder = input.sortOrder || SortOrder.DESC;

    let collection = this.prisma.client.orm.public.User as any;

    if (role && role !== 'ALL') {
      collection = collection.where({ role });
    }

    if (status && status !== 'ALL') {
      collection = collection.where({ status });
    }

    if (search) {
      collection = collection.where((u: any) =>
        u.email.ilike(`%${search}%`).or(u.pid.ilike(`%${search}%`))
      );
    }

    // Run total count query
    const countResult = await collection.aggregate((b: any) => ({
      total: b.count(),
    }));
    const totalCount = Number(countResult?.total ?? 0);

    const isAsc = String(sortOrder).toUpperCase() === 'ASC';

    // Apply sorting
    if (sortBy === 'email') {
      collection = collection.orderBy((u: any) =>
        isAsc ? u.email.asc() : u.email.desc()
      );
    } else if (sortBy === 'pid') {
      collection = collection.orderBy((u: any) =>
        isAsc ? u.pid.asc() : u.pid.desc()
      );
    } else if (sortBy === 'role') {
      collection = collection.orderBy((u: any) =>
        isAsc ? u.role.asc() : u.role.desc()
      );
    } else if (sortBy === 'status') {
      collection = collection.orderBy((u: any) =>
        isAsc ? u.status.asc() : u.status.desc()
      );
    } else if (sortBy === 'id') {
      collection = collection.orderBy((u: any) =>
        isAsc ? u.id.asc() : u.id.desc()
      );
    } else {
      collection = collection.orderBy((u: any) =>
        isAsc ? u.createdAt.asc() : u.createdAt.desc()
      );
    }

    const rows = await collection.offset(skip).limit(pageSize).all();
    const items = Array.isArray(rows) ? rows : await rows.toArray();

    return {
      items,
      totalCount,
      page,
      pageSize,
      pageCount: Math.ceil(totalCount / pageSize) || 1,
    };
  }
}
