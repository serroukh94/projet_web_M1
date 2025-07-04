import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:5173'],
      credentials: true,
      // autoriser les en-têtes nécessaires aux JWT / GraphQL
      allowedHeaders: ['content-type', 'authorization'],
    },
  });

  // Validation globale : seules les propriétés listées dans les DTO sont gardées
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,          // convertit les payloads en classes DTO
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀  GraphQL API ready at ${await app.getUrl()}/graphql`);
}

bootstrap();
