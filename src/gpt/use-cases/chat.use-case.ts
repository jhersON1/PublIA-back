import OpenAI from "openai";
import { getChatInstruction } from "./instructions";
import { GptExceptionHandler } from "../exceptions/gpt.exceptions";
import { chatResponseSchema } from "../openai-network-schema";

interface Options {
  prompt: string;
  locale?: string;
  previousResponseId?: string;
}

export type ChatResponse = {
  message: string;
  context: string;
  responseId: string;
};

export const chatUseCase = async (
  openai: OpenAI,
  { prompt, locale = "es-ES", previousResponseId }: Options
): Promise<ChatResponse> => {
  console.log('📩 Chat Input:', { prompt, previousResponseId });

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions: getChatInstruction(locale),
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

  const content = response.output_text?.trim();
  
  if (!content) {
    GptExceptionHandler.handleOpenAIResponseError();
  }

  try {
    const parsed = JSON.parse(content);
    return {
      message: parsed.message,
      context: parsed.context,
      responseId: response.id
    };
  } catch (error) {
    GptExceptionHandler.handleJsonParseError(error as Error);
  }
};
