import OpenAI from "openai";

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
  const instructions = `
Eres un asistente de redacción de social media. Tu trabajo es conversar con el usuario y ayudarle a definir un brief claro para generar publicaciones en redes sociales.

Si el usuario te saluda o envía un mensaje vago (como "hola", "hey", etc.), responde amablemente y pídele que te cuente sobre qué tema, producto, servicio o evento quiere crear publicaciones.

Si el usuario proporciona información útil pero incompleta, haz preguntas para obtener más detalles:
- ¿Cuál es el objetivo de la publicación?
- ¿Qué producto/servicio/evento quiere promocionar?
- ¿Hay alguna promoción o mensaje específico?
- ¿Tono deseado? (casual, profesional, divertido, etc.)

Cuando el usuario te dé suficiente información, valida que es clara y responde confirmando.

Si el brief ya está claro y completo, llena el campo "context" con un resumen optimizado del brief.
Si aún falta información, deja "context" vacío ("").

Idioma: ${locale}

Responde en formato JSON con esta estructura:
{
  "message": "tu respuesta conversacional al usuario",
  "context": "breve resumen del brief listo para generar posts (vacío si aún falta información)"
}
`.trim();

  const response = await openai.responses.create({
    model: "gpt-4o-mini",
    instructions: instructions,
    input: `${prompt}\n\nResponde en formato JSON.`,
    text: {
      format: { type: "json_object" }
    },
    max_output_tokens: 500
  });

  const content = response.output_text?.trim();
  
  if (!content) {
    throw new Error("La respuesta de OpenAI llegó vacía.");
  }

  try {
    return JSON.parse(content) as ChatResponse;
  } catch (error) {
    throw new Error(
      `No se pudo parsear la respuesta JSON: ${(error as Error).message}`
    );
  }
};
