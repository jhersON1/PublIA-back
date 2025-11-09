import { HttpException, HttpStatus } from '@nestjs/common';

export class GptExceptionHandler {
  static handleOpenAIResponseError(message: string = 'La respuesta de OpenAI llegó vacía.'): never {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: message,
        error: 'OpenAI Response Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  static handleJsonParseError(originalError: Error): never {
    throw new HttpException(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `No se pudo parsear la respuesta JSON de OpenAI: ${originalError.message}`,
        error: 'JSON Parse Error',
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
