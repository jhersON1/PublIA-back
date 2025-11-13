import OpenAI from 'openai';
import { GptExceptionHandler } from '../../exceptions/gpt.exceptions';
import { ImageGenerationResponse, ImageGenerationUseCaseOptions } from '../shared';
import { downloadBase64ImageAsPng } from '../../helpers';

export const imageGenerationUseCase = async (
  openai: OpenAI,
  { prompt, previousResponseId }: ImageGenerationUseCaseOptions
): Promise<ImageGenerationResponse> => {

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      tools: [{ type: "image_generation" }],
      store: true,
      ...(previousResponseId && { previous_response_id: previousResponseId })
    });

    const imageGenerationCalls = response.output.filter(
      (output) => output.type === "image_generation_call"
    );

    if (imageGenerationCalls.length === 0) {
      throw new Error("No se generó ninguna imagen");
    }

    const imageBase64 = imageGenerationCalls[0].result as string;

    // Guardar imagen como PNG
    const fileName = await downloadBase64ImageAsPng(imageBase64);
    const url = `${process.env.SERVER_URL}/gpt/image-generation/${fileName}`;

    return {
      url,
      responseId: response.id
    };
  } catch (error) {
    GptExceptionHandler.handleJsonParseError(error as Error);
  }
};
