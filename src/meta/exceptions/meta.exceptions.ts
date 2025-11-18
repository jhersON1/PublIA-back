import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

export class MetaException {
  static missingEnv(name: string): never {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Missing required environment variable: ${name}`,
        error: 'MissingEnv',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static validation(message: string): never {
    throw new BadRequestException({
      statusCode: HttpStatus.BAD_REQUEST,
      message,
      error: 'ValidationError',
    });
  }

  static graphApi(message: string, details?: any, status?: number): never {
    throw new HttpException(
      {
        statusCode: status ?? HttpStatus.BAD_GATEWAY,
        message,
        error: 'GraphApiError',
        details,
      },
      status ?? HttpStatus.BAD_GATEWAY,
    );
  }
}

