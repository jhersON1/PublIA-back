import OpenAI from "openai";
import { socialPostsSchema } from "../openai-network-schema";


interface Options {
  prompt: string;        // brief/idea base
  locale?: string;       // ej: "es-ES" (opcional)
}

export type SocialPostsResponse = {
  message: string;
  networks: Array<
    | {
      platform: "facebook";
      text: string;
      hashtags: string[];
      character_count: number;
    }
    | {
      platform: "instagram";
      text: string;
      hashtags: string[];
      character_count: number;
      suggested_image_prompt: string;
    }
    | {
      platform: "linkedin";
      text: string;
      hashtags: string[];
      character_count: number;
      tone: "professional";
    }
  >;
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

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Brief: ${prompt}. Devuelve exactamente 3 items (facebook, instagram, linkedin) en "networks".`
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "SocialPostsResponse",
        strict: true,
        schema: socialPostsSchema
      }
    },
    // Opcionales:
    // verbosity: "medium",
    // reasoning_effort: "medium",
    temperature: 0.5,
    max_output_tokens: 1200
  });

  // Fallback seguro:
  const text = response.output_text ?? "{}";
  return JSON.parse(text) as SocialPostsResponse;
};
