import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field()
  email: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field()
  password: string;

  @Field(() => String, { defaultValue: 'USER', nullable: true })
  role?: string;

  @Field(() => String, { defaultValue: 'ACTIVE', nullable: true })
  status?: string;
}

@InputType()
export class UpdateUserInput {
  @Field(() => ID)
  id: number;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => String, { nullable: true })
  name?: string;

  @Field(() => String, { nullable: true })
  password?: string;

  @Field(() => String, { nullable: true })
  role?: string;

  @Field(() => String, { nullable: true })
  status?: string;
}

@InputType()
export class UpdateUserStatusInput {
  @Field(() => ID)
  id: number;

  @Field()
  status: string;
}

