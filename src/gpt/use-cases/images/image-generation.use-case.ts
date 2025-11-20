import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { GptExceptionHandler } from '../../exceptions/gpt.exceptions';
import { ImageGenerationResponse } from '../shared';
import { GptModels } from '../gpt-model/gpt-models';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import { GenerateImageDto } from '../../dto';

@Injectable()
export class ImageGenerationUseCase {
  private readonly logger = new Logger(ImageGenerationUseCase.name);

  constructor(
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async execute(
    openai: OpenAI,
    options: GenerateImageDto
  ): Promise<ImageGenerationResponse> {
    const { prompt, previousResponseId } = options;

    try {
      const response = await openai.responses.create({
        model: GptModels.ImageGeneration,
        input: prompt,
        tools: [{ type: "image_generation" }],
        store: true,
        ...(previousResponseId && { previous_response_id: previousResponseId })
      });

      const imageGenerationCalls = response.output.filter(
        (output) => output.type === "image_generation_call"
      );

      if (imageGenerationCalls.length === 0) {
        throw new Error("No se generó ninguna imagen");
      }

      const imageBase64 = imageGenerationCalls[0].result as string;

      // Subir imagen a Cloudinary
      const cloudinaryResult = await this.cloudinaryService.uploadImage(imageBase64, 'generated-images');

      return {
        url: cloudinaryResult.secure_url,
        responseId: response.id
      };
    } catch (error) {
      this.logger.error('Error generating image', error);
      GptExceptionHandler.handleJsonParseError(error as Error);
    }
  }
}
