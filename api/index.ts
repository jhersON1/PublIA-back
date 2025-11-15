import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

async function bootstrapServer() {
  if (cachedServer) return cachedServer;

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  // En serverless no llamamos a listen(); solo init() y usamos el handler de Express
  await app.init();
  cachedServer = app.getHttpAdapter().getInstance();
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrapServer();
  return server(req, res);
}

