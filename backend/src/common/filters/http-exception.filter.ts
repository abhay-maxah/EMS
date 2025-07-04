import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  error: string;
  message: string | string[];
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus?.() ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = 'Internal server error';
    let error = exception.name;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const safeResponse = exceptionResponse as Record<string, unknown>;
      if (
        typeof safeResponse.message === 'string' ||
        Array.isArray(safeResponse.message)
      ) {
        message = safeResponse.message;
      }
      if (typeof safeResponse.error === 'string') {
        error = safeResponse.error;
      }
    } else if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    const responseBody: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error,
      message,
    };

    response.status(status).json(responseBody);
  }
}
