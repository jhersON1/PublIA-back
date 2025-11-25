import { Injectable, Logger } from '@nestjs/common';
import OpenAI from "openai";
import { buildGeneratePostsPrompt } from "../../prompts/generate-posts.prompt";
import { generatePostsSchema } from "../../schemas";
import { extractOutputText } from "../../utils";
import { GptExceptionHandler } from "../../exceptions/gpt.exceptions";
import {
  GeneratePostsResponse,
  GeneratePostsUseCaseOptions
} from "../shared";
import { GptModels } from "../gpt-model/gpt-models";
import { ChatService } from '../../../chat/chat.service';

@Injectable()
export class GeneratePostsUseCase {
  private readonly logger = new Logger(GeneratePostsUseCase.name);

  constructor(private readonly chatService: ChatService) { }

  async execute(
    openai: OpenAI,
    options: GeneratePostsUseCaseOptions
  ): Promise<GeneratePostsResponse> {
    const { prompt, locale = "es-ES", chatId } = options;

    try {
      const response = await openai.responses.create({
        model: GptModels.GeneratePosts,
        instructions: buildGeneratePostsPrompt(locale),
        input: `Brief: ${prompt}. Genera publicaciones optimizadas para cada red social.`,
        text: {
          format: {
            type: "json_schema",
            name: "GeneratePostsResponse",
            strict: true,
            schema: generatePostsSchema
          }
        },
        max_output_tokens: 1200
      });

      const rawJson = extractOutputText(
        response,
        "La respuesta de OpenAI llegó vacía (sin contenido)."
      );

      const result = JSON.parse(rawJson) as GeneratePostsResponse;

      if (chatId) {
        const savedMessage = await this.chatService.addMessage({
          chatId,
          sender: 'ai-posts',
          content: JSON.stringify(result),
          type: 'text',
          metadata: { isPosts: true }
        });
        result.messageId = savedMessage._id.toString();
      }

      return result;
    } catch (error) {
      this.logger.error('Error in generate posts use case', error);
      GptExceptionHandler.handleJsonParseError(error as Error);
    }
  }
}
