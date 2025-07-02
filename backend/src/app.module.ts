import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ChatResolver } from './chat.resolver';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { RabbitMQModule } from './rabbitmq.module';
import { User, UserSchema } from './schemas/user.schema';
import { Message, MessageSchema } from './schemas/message.schema';
import { Conversation, ConversationSchema } from './schemas/conversation.schema';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),   
    MongooseModule.forRoot(process.env.MONGO_URI),
    // enrôle nos 3 collections
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Conversation.name, schema: ConversationSchema },
    ]),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),

    RabbitMQModule,
  ],
  providers: [ChatResolver, MessageResolver, MessageService],
})
export class AppModule {}
