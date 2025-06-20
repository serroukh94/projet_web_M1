import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { users, conversations } from './datastore';
import { User } from './models/user.model';
import { Conversation } from './models/conversation.model';
import { v4 as uuidv4 } from 'uuid';

@Resolver()
export class ChatResolver {

  // Queries
  @Query(() => User, { nullable: true })
  me(): User | undefined {
    return users[0];
  }

  @Query(() => [Conversation])
  conversations(): Conversation[] {
    return conversations;
  }

  @Query(() => Conversation, { nullable: true })
  conversation(@Args('id', { type: () => ID }) id: string): Conversation | undefined {
    return conversations.find(c => c.id === id);
  }

  // Mutations
  @Mutation(() => User)
  createUser(@Args('username') username: string): User {
    const user: User = { id: uuidv4(), username, createdAt: new Date().toISOString() };
    users.push(user);
    return user;
  }

}

