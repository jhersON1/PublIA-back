import { Injectable, Logger } from '@nestjs/common';
import OpenAI from "openai";
import { buildChatPrompt } from "../../prompts/chat.prompt";
import { chatResponseSchema } from "../../schemas";
import { extractOutputText } from "../../utils";
import { GptExceptionHandler } from "../../exceptions/gpt.exceptions";
import { ChatResponse, ChatUseCaseOptions } from "../shared";
import { GptModels } from "../gpt-model/gpt-models";

@Injectable()
export class ChatUseCase {
  private readonly logger = new Logger(ChatUseCase.name);

  async execute(
    openai: OpenAI,
    options: ChatUseCaseOptions
  ): Promise<ChatResponse> {
    const { prompt, locale = "es-ES", previousResponseId } = options;

    try {
      const response = await openai.responses.create({
        model: GptModels.Chat,
        instructions: buildChatPrompt(locale),
        input: prompt,
        text: {
          format: {
            type: "json_schema",
            name: "ChatResponse",
            strict: true,
            schema: chatResponseSchema
          }
        },
        max_output_tokens: 500,
        store: true,
        ...(previousResponseId && { previous_response_id: previousResponseId })
      });

      const content = extractOutputText(response);
      const parsed = JSON.parse(content);

      return {
        message: parsed.message,
        context: parsed.context,
        responseId: response.id
      };
    } catch (error) {
      this.logger.error('Error in chat use case', error);
      GptExceptionHandler.handleJsonParseError(error as Error);
    }
  }
}
