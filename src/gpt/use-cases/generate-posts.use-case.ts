import OpenAI from "openai";
import { generatePostsSchema } from "../openai-network-schema";

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
    throw new Error("La respuesta de OpenAI llegó vacía (sin contenido).");
  }

  return content;
};

export const generatePostsUseCase = async (
  openai: OpenAI,
  { prompt, locale = "es-ES" }: Options
): Promise<GeneratePostsResponse> => {
  const instructions = `
Eres un redactor de social media senior. Escribe SIEMPRE en ${locale}.
Genera publicaciones para Facebook, Instagram y LinkedIn a partir del brief proporcionado.

Reglas por red:
- Facebook: casual/formal; emojis OK; hashtags opcionales; texto largo permitido.
- Instagram: visual/casual; emojis; hashtags IMPORTANTES y al final; ≤ 2200 chars; incluir "suggested_image_prompt".
- LinkedIn: profesional/corporativo; pocos o ningún emoji; hashtags moderados; ≤ 3000 chars.

Instrucciones:
- Adapta la redacción y el enfoque a cada audiencia.
- Calcula "character_count" como la longitud del campo "text".
- Devuelve SOLO JSON válido que cumpla el schema. No incluyas nada fuera del JSON.
`.trim();

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions: instructions,
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
    throw new Error(
      `No se pudo parsear la respuesta JSON de OpenAI: ${(error as Error).message}`
    );
  }
};
