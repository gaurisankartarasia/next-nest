import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/models/user.model.js';

@InputType()
export class LoginInput {
  @Field()
  email: string;

  @Field()
  password: string;
}

@InputType()
export class RegisterInput {
  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  role?: string;
}

@InputType()
export class RefreshTokenInput {
  @Field({ nullable: true })
  refreshToken?: string;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field({ nullable: true })
  refreshToken?: string;

  @Field(() => User)
  user: User;
}
