export interface ImageGenerationUseCaseOptions {
  prompt: string;
  previousResponseId?: string;
}

export type ImageGenerationResponse = {
  url: string;
  responseId: string;
};
