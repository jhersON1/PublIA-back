import { GenerateVideoDto } from '../dto/generate-video.dto';
import { VideoGenerationResponse } from '../use-cases/shared';

export interface VideoGenerator {
    generateVideo(options: GenerateVideoDto): Promise<VideoGenerationResponse>;
}
