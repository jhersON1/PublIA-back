import { socialPostsRules } from "../schemas";

export const buildGeneratePostsPrompt = (locale: string = "es-ES"): string => {
  return `
Eres un redactor de social media senior. Escribe SIEMPRE en ${locale}.
Genera publicaciones para Facebook, Instagram y LinkedIn a partir del brief proporcionado.

Reglas por red:
${socialPostsRules}

Instrucciones:
- Adapta la redacción y el enfoque a cada audiencia.
- Calcula "character_count" como la longitud del campo "text".
- Devuelve SOLO JSON válido que cumpla el schema. No incluyas nada fuera del JSON.
`.trim();
};

