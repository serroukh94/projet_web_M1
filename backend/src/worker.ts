import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WorkerModule } from './worker.module';

/**
 * Bootstrap : démarre le micro-service branché sur RabbitMQ.
 */
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(WorkerModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://user:password@localhost:5672'],
      queue: 'chat_queue',
      queueOptions: { durable: true },
    },
  });

  await app.listen();
  console.log('🟢 RabbitMQ worker UP – listening on chat_queue');
}

bootstrap();
