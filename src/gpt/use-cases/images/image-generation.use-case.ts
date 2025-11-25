import { Injectable, Logger, Inject } from '@nestjs/common';
import { GptExceptionHandler } from '../../exceptions/gpt.exceptions';
import { ImageGenerationResponse } from '../shared';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import { GenerateImageDto } from '../../dto';
import type { ImageGenerator } from '../../interfaces/image-generator.interface';
import { ChatService } from '../../../chat/chat.service';
import mongoose from 'mongoose';

@Injectable()
export class ImageGenerationUseCase {
  private readonly logger = new Logger(ImageGenerationUseCase.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
    @Inject('ImageGenerator') private readonly imageGenerator: ImageGenerator,
    private readonly chatService: ChatService,
  ) { }

  async execute(
    options: GenerateImageDto
  ): Promise<ImageGenerationResponse> {
    try {
      const { imageBase64, responseId } = await this.imageGenerator.generateImage(options);

      // Subir imagen a Cloudinary
      const cloudinaryResult = await this.cloudinaryService.uploadImage(imageBase64, 'generated-images');

      if (options.messageId) {
        await this.chatService.updateMessageMedia(options.messageId, 'instagram', cloudinaryResult.secure_url);
      } else if (options.chatId) {
        await this.chatService.addMessage({
          chatId: options.chatId,
          sender: 'ai',
          content: 'Imagen generada',
          type: 'image',
          mediaUrl: cloudinaryResult.secure_url
        });
      }

      return {
        url: cloudinaryResult.secure_url,
        responseId: responseId || 'N/A'
      };
    } catch (error) {
      this.logger.error('Error generating image', error);
      GptExceptionHandler.handleJsonParseError(error as Error);

    }
  }
}
