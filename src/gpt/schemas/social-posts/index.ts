import { facebookSchema } from "./facebook.schema";
import { instagramSchema } from "./instagram.schema";
import { linkedinSchema } from "./linkedin.schema";
import { facebookRules } from "./facebook.schema";
import { instagramRules } from "./instagram.schema";
import { linkedinRules } from "./linkedin.schema";

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

export const socialPostsRules = [
  `- Facebook: ${facebookRules}`,
  `- Instagram: ${instagramRules}`,
  `- LinkedIn: ${linkedinRules}`
].join("\n");

export { facebookSchema, instagramSchema, linkedinSchema };
