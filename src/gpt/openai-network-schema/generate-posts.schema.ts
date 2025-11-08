import { facebookSchema } from "./facebook.schema";
import { instagramSchema } from "./instagram.schema";
import { linkedinSchema } from "./linkedln.schema";

export const generatePostsSchema = {
  type: "object",
  properties: {
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
  required: ["networks"],
  additionalProperties: false
} as const;
