import { AppError } from './app-error';

export class ServiceUnavailableError extends AppError {
  constructor(message = 'External service unavailable') {
    super(message, 503);
  }
}
