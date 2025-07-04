// src/auth/dto/login.input.ts
import { Field, InputType } from '@nestjs/graphql';
import { IsString, Length } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsString()           
  @Length(3, 20)               
  username: string;

  @Field()
  @Length(6, 50)
  password: string;
}
