export const facebookSchema = {
  type: "object",
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
