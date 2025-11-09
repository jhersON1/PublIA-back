export const chatResponseSchema = {
  type: "object",
  properties: {
    message: { 
      type: "string", 
      minLength: 1 
    },
    context: { 
      type: "string" 
    }
  },
  required: ["message", "context"],
  additionalProperties: false
} as const;
