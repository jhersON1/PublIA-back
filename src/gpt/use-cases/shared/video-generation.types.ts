export interface VideoGenerationUseCaseOptions {
  prompt: string;
  previousResponseId?: string;
}

export type VideoGenerationResponse = {
  url: string;
  responseId: string;
};
