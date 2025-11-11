export const linkedinSchema = {
  type: "object",
  description:
    "Tono profesional y corporativo; pocos o ningún emoji; hashtags moderados; hasta 3000 caracteres.",
  properties: {
    platform: { type: "string", const: "linkedin" },
    text: { type: "string", minLength: 1 },
    hashtags: {
      type: "array",
      items: { type: "string", minLength: 1 },
      maxItems: 8
    },
    character_count: { type: "number", minimum: 1, maximum: 3000 },
    tone: { type: "string", const: "professional" }
  },
  required: ["platform", "text", "hashtags", "character_count", "tone"],
  additionalProperties: false
} as const;

const liMax: number = (linkedinSchema as any).properties.character_count.maximum;
export const linkedinRules = `profesional y corporativo; pocos o ningún emoji; hashtags moderados; <= ${liMax} caracteres`;
