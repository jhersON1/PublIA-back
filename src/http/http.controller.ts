import { Controller } from '@nestjs/common';
import { HttpService } from './http.service';

@Controller('http')
export class HttpController {
  constructor(private readonly httpService: HttpService) {}
}
