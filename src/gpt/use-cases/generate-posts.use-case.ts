import OpenAI from "openai";
import { generatePostsSchema } from "../openai-network-schema";
import { getGeneratePostsInstruction } from "./instructions";
import { GptExceptionHandler } from "../exceptions/gpt.exceptions";

interface Options {
  prompt: string;
  locale?: string;
}

export type GeneratePostsResponse = {
  networks: {
    facebook: {
      platform: "facebook";
      text: string;
      hashtags: string[];
      character_count: number;
    };
    instagram: {
      platform: "instagram";
      text: string;
      hashtags: string[];
      character_count: number;
      suggested_image_prompt: string;
    };
    linkedin: {
      platform: "linkedin";
      text: string;
      hashtags: string[];
      character_count: number;
      tone: "professional";
    };
  };
};

const extractJsonPayload = (response: any): string => {
  const content = response.output_text?.trim();
  
  if (!content) {
    GptExceptionHandler.handleOpenAIResponseError("La respuesta de OpenAI llegó vacía (sin contenido).");
  }

  return content;
};

export const generatePostsUseCase = async (
  openai: OpenAI,
  { prompt, locale = "es-ES" }: Options
): Promise<GeneratePostsResponse> => {
  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions: getGeneratePostsInstruction(locale),
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

  const rawJson = extractJsonPayload(response);

  try {
    return JSON.parse(rawJson) as GeneratePostsResponse;
  } catch (error) {
    GptExceptionHandler.handleJsonParseError(error as Error);
  }
};
