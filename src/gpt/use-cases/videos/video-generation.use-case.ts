import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { VideoGenerationResponse } from '../shared';
import { GenerateVideoDto } from '../../dto/generate-video.dto';
import { GptModels } from '../gpt-model/gpt-models';
import * as fs from 'fs';
import * as path from 'path';
import { HttpService } from '../../../http/http.service';
import { AzureVideoEndpoints } from '../gpt-model/gpt-endpoints';
import { AzureVideoGenerationJob } from '../shared/azure-video-types';

@Injectable()
export class VideoGenerationUseCase {
  private readonly logger = new Logger(VideoGenerationUseCase.name);

  constructor(private readonly httpService: HttpService) { }

  async execute(
    azureOpenai: OpenAI,
    options: GenerateVideoDto
  ): Promise<VideoGenerationResponse> {
    const { prompt, height, width, n_seconds, n_variants } = options;
    const apiKey = azureOpenai.apiKey;

    try {
      this.logger.log('🎬 Iniciando generación de video con Azure OpenAI (Sora)...');

      // 1. Create Job
      const createUrl = AzureVideoEndpoints.getAzurePostVideoUrl();

      const body = {
        model: GptModels.VideoGeneration,
        prompt: prompt,
        height: height || 480,
        width: width || 480,
        n_seconds: n_seconds || 2,
        n_variants: n_variants || 1
      };

      const initialData = await this.httpService.postJson<AzureVideoGenerationJob>(createUrl, body, {
        headers: {
          'api-key': apiKey
        }
      });

      const jobId = initialData.id;
      this.logger.log(`✅ Video generation job started: ${jobId}`);

      // 2. Polling
      const pollUrl = AzureVideoEndpoints.getJobStatusUrl(jobId);
      const videoData = await this.pollVideoStatus(pollUrl, apiKey);

      if (videoData.status === 'failed' || videoData.status === 'cancelled') {
        throw new Error(`Video generation failed: ${JSON.stringify(videoData.error || videoData.status)}`);
      }

      // 3. Extract Generation ID
      let generationId = null;
      if (videoData.generations && videoData.generations.length > 0) {
        generationId = videoData.generations[0].id;
      }

      if (!generationId) {
        throw new Error(`No generation ID found in response. Response: ${JSON.stringify(videoData)}`);
      }

      // 4. Construct Download URL
      const downloadUrl = AzureVideoEndpoints.getVideoDownloadUrl(generationId);

      this.logger.log(`📥 Downloading video content from: ${downloadUrl}`);

      // 5. Download Video
      const fileName = await this.downloadAndSaveVideo(downloadUrl, apiKey);
      const videoUrl = `${process.env.SERVER_URL}/gpt/video/${fileName}`;

      return {
        url: videoUrl,
        responseId: jobId
      };

    } catch (error: any) {
      this.logger.error('❌ Error en video generation', error.stack);
      throw new Error(`Error generando video: ${error.message || 'Unknown error'}`);
    }
  }

  private async pollVideoStatus(
    url: string,
    apiKey: string,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<AzureVideoGenerationJob> {
    let status = 'running';
    let data: AzureVideoGenerationJob | null = null;
    let attempts = 0;

    while (status !== 'succeeded' && status !== 'failed' && status !== 'cancelled' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      data = await this.httpService.get<AzureVideoGenerationJob>(url, {
        headers: { 'api-key': apiKey }
      });

      status = data.status;
      this.logger.debug(`Polling status: ${status}`);
      attempts++;
    }

    if (!data || (status !== 'succeeded' && status !== 'failed' && status !== 'cancelled')) {
      throw new Error(`Polling timed out without completion. Last status: ${status}`);
    }

    return data;
  }

  private async downloadAndSaveVideo(url: string, apiKey?: string): Promise<string> {
    const headers: any = {};
    if (apiKey) {
      headers['api-key'] = apiKey;
    }

    // Use arraybuffer response type for video
    const arrayBuffer = await this.httpService.request<ArrayBuffer>(url, {
      method: 'GET',
      headers,
      responseType: 'arraybuffer',
      timeoutMs: 1000 * 60 * 10, // 10 minutes
    });

    const buffer = Buffer.from(arrayBuffer);

    const videosDir = path.join(process.cwd(), 'generated', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    const fileName = `video-${Date.now()}.mp4`;
    const filePath = path.join(videosDir, fileName);
    fs.writeFileSync(filePath, buffer);

    this.logger.log(`💾 Wrote ${fileName}`);
    return fileName;
  }
}
