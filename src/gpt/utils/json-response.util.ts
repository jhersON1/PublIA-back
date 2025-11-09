import { GptExceptionHandler } from "../exceptions/gpt.exceptions";

type OpenAiResponseLike = {
  output_text?: string | null;
} | null | undefined;

export const extractOutputText = (
  response: OpenAiResponseLike,
  errorMessage?: string
): string => {
  const content = response?.output_text?.trim();

  if (!content) {
    GptExceptionHandler.handleOpenAIResponseError(errorMessage);
  }

  return content;
};
