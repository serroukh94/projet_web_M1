import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ChatResolver } from './chat.resolver';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { RabbitMQModule } from './rabbitmq.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    }),
    RabbitMQModule,
  ],
  providers: [ChatResolver, MessageResolver, MessageService],
})
export class AppModule {}
