import { Injectable, Inject } from '@nestjs/common';
import { GenerateVideoDto } from '../../dto';
import type { VideoGenerator } from '../../interfaces/video-generator.interface';
import { ChatService } from '../../../chat/chat.service';

@Injectable()
export class VideoGenerationUseCase {
  constructor(
    @Inject('VideoGenerator') private readonly videoGenerator: VideoGenerator,
    private readonly chatService: ChatService,
  ) { }

  async execute(options: GenerateVideoDto) {
    const videoResponse = await this.videoGenerator.generateVideo(options);

    if (options.chatId) {
      await this.chatService.addMessage({
        chatId: options.chatId,
        sender: 'ai',
        content: 'Video generado',
        type: 'video',
        mediaUrl: videoResponse.url
      });
    }

    return videoResponse;
  }
}
