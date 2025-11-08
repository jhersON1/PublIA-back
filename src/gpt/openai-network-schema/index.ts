import { facebookSchema } from "./facebook.schema";
import { instagramSchema } from "./instagram.schema";
import { linkedinSchema } from "./linkedln.schema";

export const socialPostsSchema = {
  type: "object",
  properties: {
    message: { type: "string", minLength: 1 },
    networks: {
      type: "object",
      properties: {
        facebook: facebookSchema,
        instagram: instagramSchema,
        linkedin: linkedinSchema
      },
      required: ["facebook", "instagram", "linkedin"],
      additionalProperties: false
    }
  },
  required: ["message", "networks"],
  additionalProperties: false
} as const;
