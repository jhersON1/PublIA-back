import { facebookSchema } from "./facebook.schema";
import { instagramSchema } from "./instagram.schema";
import { linkedinSchema } from "./linkedin.schema";
import { tiktokSchema } from "./tiktok.schema";
import { whatsappSchema } from "./whatsapp.schema";
import { facebookRules } from "./facebook.schema";
import { instagramRules } from "./instagram.schema";
import { linkedinRules } from "./linkedin.schema";
import { tiktokRules } from "./tiktok.schema";
import { whatsappRules } from "./whatsapp.schema";

export const generatePostsSchema = {
  type: "object",
  properties: {
    networks: {
      type: "object",
      properties: {
        facebook: facebookSchema,
        instagram: instagramSchema,
        linkedin: linkedinSchema,
        tiktok: tiktokSchema,
        whatsapp: whatsappSchema
      },
      required: ["facebook", "instagram", "linkedin", "tiktok", "whatsapp"],
      additionalProperties: false
    }
  },
  required: ["networks"],
  additionalProperties: false
} as const;

export const socialPostsRules = [
  `- Facebook: ${facebookRules}`,
  `- Instagram: ${instagramRules}`,
  `- LinkedIn: ${linkedinRules}`,
  `- TikTok: ${tiktokRules}`,
  `- WhatsApp: ${whatsappRules}`
].join("\n");

export { facebookSchema, instagramSchema, linkedinSchema, tiktokSchema, whatsappSchema };
