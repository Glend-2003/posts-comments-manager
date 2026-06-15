import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = this.extractMessage(exception);
    } else {
      // Error no controlado: log completo en el servidor, mensaje generico al cliente.
      this.logger.error(
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      success: false,
      message,
      status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private extractMessage(exception: HttpException): string {
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const { message } = exceptionResponse as { message?: string | string[] };
      // class-validator devuelve un array de mensajes; lo unimos para no perderlos.
      if (Array.isArray(message)) {
        return message.join(', ');
      }
      if (typeof message === 'string') {
        return message;
      }
    }

    return exception.message;
  }
}
