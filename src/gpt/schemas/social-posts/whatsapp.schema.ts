export const whatsappSchema = {
    type: "object",
    description:
        "Tono directo y conversacional; ideal para mensajería rápida; sin hashtags obligatorios.",
    properties: {
        platform: { type: "string", const: "whatsapp" },
        text: { type: "string", minLength: 1 },
        character_count: { type: "number", minimum: 1, maximum: 65535 }
    },
    required: ["platform", "text", "character_count"],
    additionalProperties: false
} as const;

export const whatsappRules = `directo y conversacional; ideal para mensajería; sin hashtags`;
