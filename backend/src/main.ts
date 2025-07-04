import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Middleware to parse cookies
  app.use(cookieParser());

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Error Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Allowed origins
  const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.45:5173', // Replace with your IP
  ];

  // CORS Setup
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // Allow requests like Postman, Curl (without origin)
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // Allow cookies, tokens via cookies
  });

  // Load Port from .env or default to 3000
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);

  console.log(`🚀 Application is running at: ${await app.getUrl()}`);
}
bootstrap();
