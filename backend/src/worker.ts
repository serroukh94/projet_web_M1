import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService],
})
class WorkerModule {}

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(WorkerModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://user:password@localhost:5672'],
      queue: 'chat_queue',
    },
  });
  await app.listen();
}

bootstrap();

