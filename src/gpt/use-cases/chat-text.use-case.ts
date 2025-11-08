import OpenAI from "openai";
import { socialPostsSchema } from "../openai-network-schema";


interface Options {
  prompt: string;        // brief/idea base
  locale?: string;       // ej: "es-ES" (opcional)
}

export type SocialPostsResponse = {
  message: string;
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

const extractJsonPayload = (response: OpenAI.Chat.Completions.ChatCompletion): string => {
  const content = response.choices[0]?.message?.content?.trim();
  
  if (!content) {
    throw new Error("La respuesta de OpenAI llegó vacía (sin contenido).");
  }

  return content;
};

export const chatTextUseCase = async (
  openai: OpenAI,
  { prompt, locale = "es-ES" }: Options
): Promise<SocialPostsResponse> => {
  const system = `
Eres un redactor de social media senior. Escribe SIEMPRE en ${locale}.
Genera publicaciones para Facebook, Instagram y LinkedIn a partir del brief.

Reglas por red (según la tabla):
- Facebook: casual/formal; emojis OK; hashtags opcionales; texto largo permitido.
- Instagram: visual/casual; emojis; hashtags IMPORTANTES y al final; ≤ 2200 chars; incluir "suggested_image_prompt".
- LinkedIn: profesional/corporativo; pocos o ningún emoji; hashtags moderados; ≤ 3000 chars.

Instrucciones:
- Adapta la redacción y el enfoque a cada audiencia.
- Calcula "character_count" como la longitud del campo "text".
- Devuelve SOLO JSON válido que cumpla el schema. No incluyas nada fuera del JSON.
`.trim();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Brief: ${prompt}. Devuelve "networks" como un objeto con las claves "facebook", "instagram" y "linkedin".`
      }
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "SocialPostsResponse",
        strict: true,
        schema: socialPostsSchema
      }
    },
    max_tokens: 1200,
    temperature: 0.7
  });

  const rawJson = extractJsonPayload(response);

  try {
    return JSON.parse(rawJson) as SocialPostsResponse;
  } catch (error) {
    throw new Error(
      `No se pudo parsear la respuesta JSON de OpenAI: ${(error as Error).message}`
    );
  }
};
