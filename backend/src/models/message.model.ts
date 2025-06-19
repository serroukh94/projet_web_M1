import { Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType()
export class Message {
  @Field(() => ID)
  id: string;

  @Field()
  content: string;

  @Field(() => User)
  author: User;

  @Field()
  createdAt: string;
}
