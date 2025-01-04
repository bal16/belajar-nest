import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ZodError } from 'zod';

@Catch(ZodError, HttpException)
export class ErrorFilter implements ExceptionFilter {
  catch(e, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    if (e instanceof HttpException) {
      response.status(e.getStatus()).json({
        errors: e.getResponse(),
      });
    } else if (e instanceof ZodError) {
      response.status(400).json({
        errors: 'Validation error ',
        data: e.errors,
      });
    } else {
      response.status(500).json({
        errors: e.message,
      });
    }
  }
}
