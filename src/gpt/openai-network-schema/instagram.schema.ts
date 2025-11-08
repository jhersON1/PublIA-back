export const instagramSchema = {
  type: "object",
  properties: {
    platform: { const: "instagram" },
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
