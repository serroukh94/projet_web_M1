import {Args, ID, Mutation, Resolver, Subscription,} from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { pubSub } from '../pubsub';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

import { Message, MessageDocument } from '../schemas/message.schema';
import { User, UserDocument } from '../schemas/user.schema';

import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private readonly rabbitmq: RabbitMQService,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  // ────────────────────────────────────────────────────────────
  // Mutation : envoi d’un message (auth requise)
  // ────────────────────────────────────────────────────────────
  @Mutation(() => Message)
  @UseGuards(GqlAuthGuard)
  async sendMessage(
    @Args('conversationId', { type: () => ID }) conversationId: string,
    @Args('content') content: string,
    @CurrentUser() user: { userId: string; username: string },
  ): Promise<Message> {
    // 1) Auteur courant (issu du token)
    const author = {
      id: user.userId,
      username: user.username,
      createdAt: new Date(), // valeur temporaire ; sera peuplée côté worker
    };

    // 2) Publier l’événement dans RabbitMQ
    this.rabbitmq.sendMessage('new_message', {
      conversationId,
      content,
      authorId: author.id,
    });

    // 3) Réponse optimiste (sans aller en base)
    return {
      id: new Types.ObjectId().toHexString(), // ID temporaire du message
      content,
      author,
      createdAt: new Date(),
      conversationId,
    } as Message;
  }

  // ────────────────────────────────────────────────────────────
  // Subscription : nouveau message dans une conversation
  // ────────────────────────────────────────────────────────────
  @Subscription(() => Message, {
    filter: (payload, variables) =>
      payload.messageAdded.conversationId === variables.conversationId,
  })
  messageAdded(@Args('conversationId') _id: string) {
    return pubSub.asyncIterableIterator('messageAdded');
  }
}
