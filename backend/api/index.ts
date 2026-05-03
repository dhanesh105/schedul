import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';

const server = express();

export const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );

  // Enable CORS for frontend requests
  app.enableCors({
    origin: process.env.FRONTEND_URL 
      ? [process.env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'] 
      : ['http://localhost:3000', 'http://localhost:3001'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  await app.init();
};

createNestServer(server)
  .then(() => console.log('Nest Ready for Vercel'))
  .catch(err => console.error('Nest broken', err));

export default server;
