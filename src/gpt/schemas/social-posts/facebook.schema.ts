export const facebookSchema = {
  type: "object",
  description:
    "Tono casual o formal; emojis permitidos; hashtags opcionales; texto largo permitido.",
  properties: {
    platform: { type: "string", const: "facebook" },
    text: { type: "string", minLength: 1 },
    hashtags: {
      type: "array",
      items: { type: "string", minLength: 1 },
      maxItems: 8
    },
    character_count: { type: "number", minimum: 1, maximum: 63206 }
  },
  required: ["platform", "text", "hashtags", "character_count"],
  additionalProperties: false
} as const;

const fbMax: number = (facebookSchema as any).properties.character_count.maximum;
export const facebookRules = `casual o formal; emojis OK; hashtags opcionales; texto largo permitido`;
