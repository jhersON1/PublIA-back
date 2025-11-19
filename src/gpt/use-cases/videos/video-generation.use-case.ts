import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { VideoGenerationResponse } from '../shared';
import { GenerateVideoDto } from '../../dto/generate-video.dto';
import { GptModels } from '../gpt-model/gpt-models';
import * as fs from 'fs';
import * as path from 'path';
import { HttpService } from '../../../http/http.service';

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
    const baseURL = azureOpenai.baseURL;

    try {
      this.logger.log('🎬 Iniciando generación de video con Azure OpenAI (Sora)...');

      const url = baseURL;
      const body = {
        model: GptModels.VideoGeneration,
        prompt: prompt,
        height: height || 1080,
        width: width || 1920,
        n_seconds: n_seconds || 5,
        n_variants: n_variants || 1
      };

      const initialData = await this.httpService.postJson<any>(url, body, {
        headers: {
          'api-key': apiKey
        }
      });

      this.logger.log(`✅ Video generation job started: ${initialData.id}`);

      // Polling
      const videoData = await this.pollVideoStatus(url, apiKey, initialData.id);

      if (videoData.status === 'failed') {
        throw new Error(`Video generation failed: ${JSON.stringify(videoData.error)}`);
      }

      // Check for generations array
      let generationId = null;
      if (videoData.generations && videoData.generations.length > 0) {
        generationId = videoData.generations[0].id;
      }

      if (!generationId) {
        throw new Error('No generation ID found in response');
      }

      // Construct download URL
      const downloadUrl = this.constructDownloadUrl(url, generationId);

      this.logger.log(`📥 Downloading video content...`);

      const fileName = await this.downloadAndSaveVideo(downloadUrl, apiKey);
      const videoUrl = `${process.env.SERVER_URL}/gpt/video/${fileName}`;

      return {
        url: videoUrl,
        responseId: videoData.id
      };

    } catch (error: any) {
      this.logger.error('❌ Error en video generation', error.stack);
      throw new Error(`Error generando video: ${error.message || 'Unknown error'}`);
    }
  }

  private constructDownloadUrl(baseUrl: string, generationId: string): string {
    const urlObj = new URL(baseUrl);
    const jobsPath = '/jobs';

    if (urlObj.pathname.endsWith(jobsPath)) {
      urlObj.pathname = urlObj.pathname.slice(0, -jobsPath.length);
    }

    if (urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }

    urlObj.pathname = `${urlObj.pathname}/${generationId}/content/video`;
    return urlObj.toString();
  }

  private async pollVideoStatus(
    createUrl: string,
    apiKey: string,
    jobId: string,
    maxAttempts: number = 60,
    intervalMs: number = 5000
  ): Promise<any> {
    let status = 'running';
    let data: any = null;
    let attempts = 0;

    // Construct polling URL
    const urlObj = new URL(createUrl);
    const pathname = urlObj.pathname.endsWith('/') ? urlObj.pathname.slice(0, -1) : urlObj.pathname;
    urlObj.pathname = `${pathname}/${jobId}`;
    if (!urlObj.searchParams.has('api-version')) {
      urlObj.searchParams.append('api-version', 'preview');
    }
    const url = urlObj.toString();

    while (status !== 'succeeded' && status !== 'failed' && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));

      data = await this.httpService.get<any>(url, {
        headers: { 'api-key': apiKey }
      });

      status = data.status;
      attempts++;
    }

    if (status !== 'succeeded' && status !== 'failed') {
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
      responseType: 'arraybuffer'
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
