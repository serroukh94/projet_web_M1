import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { User, UserSchema } from './schemas/user.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';

import { MessageController } from './message.controller';
import { MessageService } from './message.service';

/**
 * Module dédié au micro-service RabbitMQ.
 * – charge .env
 * – connecte MongoDB
 * – déclare les schémas nécessaires
 * – expose le contrôleur et le service
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MongooseModule.forFeature([
      { name: User.name,         schema: UserSchema },
      { name: Message.name,      schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),
  ],
  controllers: [MessageController],
  providers:   [MessageService],
})
export class WorkerModule {}
