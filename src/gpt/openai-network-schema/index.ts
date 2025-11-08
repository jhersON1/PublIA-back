import { facebookSchema } from "./facebook.schema";
import { instagramSchema } from "./instagram.schema";
import { linkedinSchema } from "./linkedln.schema";

export const networksOneOf = [facebookSchema, instagramSchema, linkedinSchema] as const;

export const socialPostsSchema = {
  type: "object",
  properties: {
    message: { type: "string", minLength: 1 },
    networks: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        oneOf: networksOneOf
      }
    }
  },
  required: ["message", "networks"],
  additionalProperties: false
} as const;
