import { Controller } from '@nestjs/common';
import { WinstonLogsService } from './winston-logs.service';

@Controller('winston-logs')
export class WinstonLogsController {
  constructor(private readonly winstonLogsService: WinstonLogsService) {}
}
