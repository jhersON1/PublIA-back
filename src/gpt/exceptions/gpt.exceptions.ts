import { HttpException, HttpStatus } from '@nestjs/common';

export class GptExceptionHandler {
  static handleOpenAIResponseError(message: string = 'La respuesta de la IA llegó vacía.'): never {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: message,
        error: 'AI Response Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static handleJsonParseError(originalError: Error): never {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `No se pudo parsear la respuesta JSON de la IA: ${originalError.message}`,
        error: 'JSON Parse Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
