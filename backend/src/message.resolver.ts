import { Args, Mutation, Resolver, Subscription } from '@nestjs/graphql';
import { Message } from './models/message.model';
import { RabbitMQService } from './rabbitmq.service';
import { pubSub } from './pubsub';
import { users } from './datastore';

@Resolver(() => Message)
export class MessageResolver {
  constructor(private readonly rabbitmq: RabbitMQService) {}

  @Mutation(() => Message)
  async sendMessage(
    @Args('conversationId') conversationId: string,
    @Args('content') content: string,
  ): Promise<Message> {
    const messagePayload = { conversationId, content, authorId: 'currentUserId' };
    this.rabbitmq.sendMessage('new_message', messagePayload);
    return {
      id: 'temp-id',
      content,
      author: users[0] ?? { id: 'temp', username: 'temp', createdAt: new Date().toISOString() },
      createdAt: new Date().toISOString(),
    };
  }

  @Subscription(() => Message, {
    filter: (payload, variables) =>
      payload.messageAdded.conversationId === variables.conversationId,
  })
  messageAdded(@Args('conversationId') _id: string) {
    return pubSub.asyncIterableIterator('messageAdded');
  }
}

