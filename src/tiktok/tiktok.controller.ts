import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TiktokService } from './tiktok.service';
import { TikTokVideoUploadService } from './use-cases/tiktok-video-upload.service';

@Controller('tiktok')
export class TiktokController {
  constructor(
    private readonly tiktokService: TiktokService,
    private readonly videoUploadService: TikTokVideoUploadService,
  ) { }

  /**
   * Endpoint para publicar un video a TikTok desde el escritorio local
   * Este endpoint maneja todo el flujo: inicialización + subida del video
   * @param file Video file desde form-data
   */
  @Post('publish-tiktok')
  @UseInterceptors(FileInterceptor('file'))
  async publishVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo de video');
    }

    return this.videoUploadService.uploadVideoToTikTok(file);
  }

  /**
   * Endpoint para publicar un video a TikTok desde una URL (ej: Cloudinary)
   * Este endpoint descarga el video de la URL, lo convierte a Buffer y lo sube a TikTok
   * @param body Objeto con la URL del video
   */
  @Post('publish-tiktok-from-url')
  async publishVideoFromUrl(@Body('video_url') videoUrl: string) {
    if (!videoUrl) {
      throw new BadRequestException('No se ha proporcionado la URL del video');
    }

    return this.videoUploadService.uploadVideoFromUrl(videoUrl);
  }
}
