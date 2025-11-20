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

@Injectable()
export class GeneratePostsUseCase {
  private readonly logger = new Logger(GeneratePostsUseCase.name);

  async execute(
    openai: OpenAI,
    options: GeneratePostsUseCaseOptions
  ): Promise<GeneratePostsResponse> {
    const { prompt, locale = "es-ES" } = options;

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

      return JSON.parse(rawJson) as GeneratePostsResponse;
    } catch (error) {
      this.logger.error('Error in generate posts use case', error);
      GptExceptionHandler.handleJsonParseError(error as Error);
    }
  }
}
