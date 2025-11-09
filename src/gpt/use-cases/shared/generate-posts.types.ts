export interface GeneratePostsUseCaseOptions {
  prompt: string;
  locale?: string;
}

export type GeneratePostsResponse = {
  networks: {
    facebook: {
      platform: "facebook";
      text: string;
      hashtags: string[];
      character_count: number;
    };
    instagram: {
      platform: "instagram";
      text: string;
      hashtags: string[];
      character_count: number;
      suggested_image_prompt: string;
    };
    linkedin: {
      platform: "linkedin";
      text: string;
      hashtags: string[];
      character_count: number;
      tone: "professional";
    };
  };
};
