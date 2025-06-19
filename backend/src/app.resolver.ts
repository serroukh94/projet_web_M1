import { Query, Resolver } from '@nestjs/graphql';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
class Hello {
  @Field(() => ID)
  id: number;

  @Field()
  message: string;
}

@Resolver(() => Hello)
export class AppResolver {
  @Query(() => Hello)
  hello(): Hello {
    return { id: 1, message: 'Hello World!' };
  }
}