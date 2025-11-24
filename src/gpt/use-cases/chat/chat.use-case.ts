import { Injectable, Logger } from '@nestjs/common';
import OpenAI from "openai";
import { buildChatPrompt } from "../../prompts/chat.prompt";
import { chatResponseSchema } from "../../schemas";
import { extractOutputText } from "../../utils";
import { GptExceptionHandler } from "../../exceptions/gpt.exceptions";
import { ChatResponse, ChatUseCaseOptions } from "../shared";
import { GptModels } from "../gpt-model/gpt-models";
import { ChatService } from '../../../chat/chat.service';
import { ChatTextDto } from '../../dto/chat-text.dto';

@Injectable()
export class ChatUseCase {
  private readonly logger = new Logger(ChatUseCase.name);

  constructor(private readonly chatService: ChatService) { }

  async execute(
    openai: OpenAI,
    options: ChatTextDto
  ): Promise<ChatResponse> {
    const { prompt, previousResponseId, chatId } = options;

    try {
      if (chatId) {
        await this.chatService.addMessage({
          chatId,
          sender: 'user',
          content: prompt,
          type: 'text'
        });
      }

      const response = await openai.responses.create({
        model: GptModels.Chat,
        instructions: buildChatPrompt("es-ES"), // Default locale
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

      if (chatId) {
        await this.chatService.addMessage({
          chatId,
          sender: 'ai',
          content: parsed.message,
          type: 'text',
          metadata: { context: parsed.context }
        });
      }

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
