import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: any;

// Log unhandled errors to help diagnose crashes on Vercel
process.on('unhandledRejection', (reason) => {
  console.error('[Vercel] UnhandledRejection:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Vercel] UncaughtException:', err);
});

async function bootstrapServer() {
  if (cachedServer) return cachedServer;

  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  // En serverless no llamamos a listen(); solo init() y usamos el handler de Express
  await app.init();
  cachedServer = expressApp;
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  try {
    const server = await bootstrapServer();
    return server(req, res);
  } catch (err: any) {
    console.error('[Vercel] Handler bootstrap error:', err);
    res.statusCode = 500;
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ok: false, message: 'Server error', error: err?.message }));
  }
}

