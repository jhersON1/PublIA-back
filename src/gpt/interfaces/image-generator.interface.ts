import { GenerateImageDto } from '../dto';

export interface ImageGenerator {
    generateImage(options: GenerateImageDto): Promise<{ imageBase64: string; responseId?: string }>;
}
