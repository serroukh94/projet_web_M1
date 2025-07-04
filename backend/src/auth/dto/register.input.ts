import { Field, InputType } from '@nestjs/graphql';
import { IsAlphanumeric, Length } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsAlphanumeric()
  @Length(3, 20)
  username: string;

  @Field()
  @Length(6, 50)
  password: string;
}
