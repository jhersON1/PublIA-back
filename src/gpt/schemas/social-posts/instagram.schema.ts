export const instagramSchema = {
  type: "object",
  description:
    "Tono visual y casual; emojis recomendados; hashtags importantes y al final; hasta 2200 caracteres; incluir 'suggested_image_prompt'.",
  properties: {
    platform: { type: "string", const: "instagram" },
    text: { type: "string", minLength: 1 },
    hashtags: {
      type: "array",
      items: { type: "string", minLength: 1 },
      maxItems: 30
    },
    character_count: { type: "number", minimum: 1, maximum: 2200 },
    suggested_image_prompt: { type: "string", minLength: 1 }
  },
  required: [
    "platform",
    "text",
    "hashtags",
    "character_count",
    "suggested_image_prompt"
  ],
  additionalProperties: false
} as const;

const igMax: number = (instagramSchema as any).properties.character_count.maximum;
export const instagramRules = `visual y casual; emojis; hashtags IMPORTANTES y al final; <= ${igMax} caracteres; incluir "suggested_image_prompt"`;
