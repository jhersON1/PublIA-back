import OpenAI from "openai";
import { buildGeneratePostsPrompt } from "../../prompts/generate-posts.prompt";
import { generatePostsSchema } from "../../schemas";
import { extractOutputText } from "../../utils";
import { GptExceptionHandler } from "../../exceptions/gpt.exceptions";
import {
  GeneratePostsResponse,
  GeneratePostsUseCaseOptions
} from "../shared";

export const generatePostsUseCase = async (
  openai: OpenAI,
  { prompt, locale = "es-ES" }: GeneratePostsUseCaseOptions
): Promise<GeneratePostsResponse> => {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
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

  try {
    return JSON.parse(rawJson) as GeneratePostsResponse;
  } catch (error) {
    GptExceptionHandler.handleJsonParseError(error as Error);
  }
};
