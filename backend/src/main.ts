import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow Postman/curl with no origin

      const allowedOrigins = [
        'http://localhost:5173',
        'http://192.168.1.45:5173',
        'https://employee-8a0eb.web.app',
        'https://a6b13a213722.ngrok-free.app',
      ];

      const isAllowed = allowedOrigins.includes(origin);
      if (isAllowed) {
        return callback(null, origin); // ✅ Echo back exact origin (needed for credentials)
      }

      console.warn(`❌ CORS blocked request from: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true, // ✅ Required for cookies/sessions
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`🚀 Application is running at: ${await app.getUrl()}`);
}

bootstrap();
