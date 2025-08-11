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

  // ✅ Flexible CORS rules
  const allowedOrigins = [
    /^http:\/\/localhost:\d+$/, // localhost:any-port
    /^http:\/\/192\.168\.1\.\d+:\d+$/, // local network IPs
    /^https:\/\/employee-[a-z0-9-]+\.web\.app$/, // Firebase subdomains
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        // No origin: Postman, curl, server-to-server calls
        return callback(null, true);
      }

      const isAllowed = allowedOrigins.some((pattern) => pattern.test(origin));
      if (isAllowed) {
        return callback(null, true);
      }

      // 🚫 Log rejected origins
      console.warn(`❌ CORS blocked request from: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`🚀 Application is running at: ${await app.getUrl()}`);
}

bootstrap();
