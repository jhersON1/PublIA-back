import OpenAI from 'openai';
import { GptExceptionHandler } from '../../exceptions/gpt.exceptions';
import { ImageGenerationResponse, ImageGenerationUseCaseOptions } from '../shared';
import { GptModels } from '../gpt-model/gpt-models';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';

export const imageGenerationUseCase = async (
  openai: OpenAI,
  cloudinaryService: CloudinaryService,
  { prompt, previousResponseId }: ImageGenerationUseCaseOptions
): Promise<ImageGenerationResponse> => {

  try {
    const response = await openai.responses.create({
      model: GptModels.ImageGeneration,
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
    // const fileName = await downloadBase64ImageAsPng(imageBase64);
    // const url = `${process.env.SERVER_URL}/gpt/image-generation/${fileName}`;

    // Subir imagen a Cloudinary
    const cloudinaryResult = await cloudinaryService.uploadImage(imageBase64, 'generated-images');

    return {
      url: cloudinaryResult.secure_url,
      responseId: response.id
    };
  } catch (error) {
    GptExceptionHandler.handleJsonParseError(error as Error);
  }
};
