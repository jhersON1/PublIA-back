export const tiktokSchema = {
    type: "object",
    description:
        "Tono dinámico y viral; hashtags populares; incluir 'suggested_video_prompt'.",
    properties: {
        platform: { type: "string", const: "tiktok" },
        text: { type: "string", minLength: 1 },
        hashtags: {
            type: "array",
            items: { type: "string", minLength: 1 },
            maxItems: 10
        },
        character_count: { type: "number", minimum: 1, maximum: 2200 },
        suggested_video_prompt: { type: "string", minLength: 1 }
    },
    required: [
        "platform",
        "text",
        "hashtags",
        "character_count",
        "suggested_video_prompt"
    ],
    additionalProperties: false
} as const;

const tkMax: number = (tiktokSchema as any).properties.character_count.maximum;
export const tiktokRules = `dinámico y viral; hashtags populares; <= ${tkMax} caracteres; incluir "suggested_video_prompt"`;
