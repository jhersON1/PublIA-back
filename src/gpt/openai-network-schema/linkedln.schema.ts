export const linkedinSchema = {
  type: "object",
  properties: {
    platform: { const: "linkedin" },
    text: { type: "string", minLength: 1 },
    hashtags: {
      type: "array",
      items: { type: "string", minLength: 1 },
      maxItems: 8
    },
    character_count: { type: "number", minimum: 1, maximum: 3000 },
    tone: { const: "professional" }
  },
  required: ["platform", "text", "hashtags", "character_count", "tone"],
  additionalProperties: false
} as const;
