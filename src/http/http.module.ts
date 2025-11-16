import { Module } from '@nestjs/common';
import { HttpService } from './http.service';

// Módulo HTTP compartido para llamadas salientes.
// Exporta un servicio simple basado en fetch con timeout y manejo
// uniforme de respuestas/errores. No depende de axios ni RxJS.
@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}

