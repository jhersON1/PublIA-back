import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { VideoGenerationResponse } from '../shared';
import { GenerateVideoDto } from '../../dto/generate-video.dto';
import { GptModels } from '../gpt-model/gpt-models';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideoGenerationUseCase {
  private readonly logger = new Logger(VideoGenerationUseCase.name);

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

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Azure OpenAI Error: ${response.status} - ${errorText}`);
      }

      const initialData = await response.json();
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
      const downloadUrlObj = new URL(url);
      const jobsPath = '/jobs';
      if (downloadUrlObj.pathname.endsWith(jobsPath)) {
        downloadUrlObj.pathname = downloadUrlObj.pathname.slice(0, -jobsPath.length);
      }
      if (downloadUrlObj.pathname.endsWith('/')) {
        downloadUrlObj.pathname = downloadUrlObj.pathname.slice(0, -1);
      }

      downloadUrlObj.pathname = `${downloadUrlObj.pathname}/${generationId}/content/video`;
      const downloadUrl = downloadUrlObj.toString();

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

      const response = await fetch(url, {
        headers: { 'api-key': apiKey }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Polling Error: ${response.status} - ${errorText}`);
      }

      data = await response.json();
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

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to download video: ${response.status} - ${errorText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
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
