import OpenAI from "openai";
import { getChatInstruction } from "./instructions";
import { GptExceptionHandler } from "../exceptions/gpt.exceptions";

interface Options {
  prompt: string;
  locale?: string;
}

export type ChatResponse = {
  message: string;
  context: string;
};

export const chatUseCase = async (
  openai: OpenAI,
  { prompt, locale = "es-ES" }: Options
): Promise<ChatResponse> => {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions: getChatInstruction(locale),
    input: `${prompt}\n\nResponde en formato JSON.`,
    text: {
      format: { type: "json_object" }
    },
    max_output_tokens: 500
  });

  const content = response.output_text?.trim();
  
  if (!content) {
    GptExceptionHandler.handleOpenAIResponseError();
  }

  try {
    return JSON.parse(content) as ChatResponse;
  } catch (error) {
    GptExceptionHandler.handleJsonParseError(error as Error);
  }
};
