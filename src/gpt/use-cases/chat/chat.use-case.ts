import OpenAI from "openai";
import { buildChatPrompt } from "../../prompts/chat.prompt";
import { chatResponseSchema } from "../../schemas";
import { extractOutputText } from "../../utils";
import { GptExceptionHandler } from "../../exceptions/gpt.exceptions";
import { ChatResponse, ChatUseCaseOptions } from "../shared";

export const chatUseCase = async (
  openai: OpenAI,
  { prompt, locale = "es-ES", previousResponseId }: ChatUseCaseOptions
): Promise<ChatResponse> => {

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
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
