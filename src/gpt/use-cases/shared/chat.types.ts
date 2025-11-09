export interface ChatUseCaseOptions {
  prompt: string;
  locale?: string;
  previousResponseId?: string;
}

export type ChatResponse = {
  message: string;
  context: string;
  responseId: string;
};
