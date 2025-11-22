import { Injectable, Inject } from '@nestjs/common';
import { VideoGenerationResponse } from '../shared';
import { GenerateVideoDto } from '../../dto/generate-video.dto';
import type { VideoGenerator } from '../../interfaces/video-generator.interface';

@Injectable()
export class VideoGenerationUseCase {
  constructor(
    @Inject('VideoGenerator') private readonly videoGenerator: VideoGenerator,
  ) { }

  async execute(options: GenerateVideoDto): Promise<VideoGenerationResponse> {
    return this.videoGenerator.generateVideo(options);
  }
}
