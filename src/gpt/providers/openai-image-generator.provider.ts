import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { ImageGenerator } from '../interfaces/image-generator.interface';
import { GenerateImageDto } from '../dto';
import { GptModels } from '../use-cases/gpt-model/gpt-models';

@Injectable()
export class OpenAiImageGenerator implements ImageGenerator {
    private readonly logger = new Logger(OpenAiImageGenerator.name);
    private openai: OpenAI;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async generateImage(options: GenerateImageDto): Promise<{ imageBase64: string; responseId?: string }> {
        const { prompt, previousResponseId } = options;

        try {
            const response = await this.openai.responses.create({
                model: GptModels.ImageGeneration,
                input: prompt,
                tools: [{ type: 'image_generation' }],
                store: true,
                ...(previousResponseId && { previous_response_id: previousResponseId }),
            });

            const imageGenerationCalls = response.output.filter(
                (output) => output.type === 'image_generation_call',
            );

            if (imageGenerationCalls.length === 0) {
                throw new Error('No se generó ninguna imagen');
            }

            return {
                imageBase64: imageGenerationCalls[0].result as string,
                responseId: response.id,
            };
        } catch (error) {
            this.logger.error('Error generating image with OpenAI', error);
            throw error;
        }
    }
}
