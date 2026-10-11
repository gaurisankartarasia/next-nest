import { Field, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { User } from '../models/user.model.js';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Sort direction order',
});

@InputType()
export class UsersQueryInput {
  @Field(() => Int, { defaultValue: 1, nullable: true })
  page?: number = 1;

  @Field(() => Int, { defaultValue: 10, nullable: true })
  pageSize?: number = 10;

  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => String, { nullable: true })
  role?: string;

  @Field(() => String, { nullable: true })
  status?: string;

  @Field(() => String, { defaultValue: 'createdAt', nullable: true })
  sortBy?: string = 'createdAt';

  @Field(() => SortOrder, { defaultValue: SortOrder.DESC, nullable: true })
  sortOrder?: SortOrder = SortOrder.DESC;
}

@ObjectType()
export class PaginatedUsersResponse {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  pageCount: number;
}

