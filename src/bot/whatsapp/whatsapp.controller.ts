import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { WhatsappService } from './whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) { }

  @Post('status')
  @UseInterceptors(FileInterceptor('file'))
  async createStatus(
    @Body('text') text: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!text && !file) {
      throw new BadRequestException('Must provide text or file');
    }

    if (file) {
      await this.whatsappService.postStatus(file);
    } else {
      await this.whatsappService.postStatus(text);
    }

    return { message: 'Status posted successfully' };
  }
}
