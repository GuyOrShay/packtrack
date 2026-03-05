import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  const host = '0.0.0.0';
  const protocol = 'http';

  logger.log(`CORS enabled with wildcard origin (*)`);

  await app.listen(port, '0.0.0.0');
  logger.log(`Server listening on ${protocol}://${host}:${port}`);
  logger.log(`Local URL: ${protocol}://localhost:${port}`);
}

bootstrap();
