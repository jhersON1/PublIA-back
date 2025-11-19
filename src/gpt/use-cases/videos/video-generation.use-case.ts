import OpenAI from 'openai';
import { GptExceptionHandler } from '../../exceptions/gpt.exceptions';
import { VideoGenerationResponse, VideoGenerationUseCaseOptions } from '../shared';
import { GptModels } from '../gpt-model/gpt-models';
import { CloudinaryService } from '../../../cloudinary/cloudinary.service';
import * as fs from 'fs';
import * as path from 'path';

export const videoGenerationUseCase = async (
  azureOpenai: OpenAI,
  cloudinaryService: CloudinaryService,
  { prompt, previousResponseId }: VideoGenerationUseCaseOptions
): Promise<VideoGenerationResponse> => {

  try {
    console.log('🎬 Iniciando generación de video con Azure OpenAI...');
    console.log('📝 Prompt:', prompt);

    // Iniciar generación del video - Azure usa la ruta directa sin /videos
    let video = await azureOpenai.videos.create({
      model: GptModels.VideoGeneration,  // En Azure esto puede ser ignorado si ya está en la URL
      prompt: prompt,
    });

    console.log('✅ Video generation started: ', JSON.stringify(video, null, 2));
    let progress = video.progress ?? 0;

    // Polling hasta que el video esté listo
    while (video.status === 'in_progress' || video.status === 'queued') {
      video = await azureOpenai.videos.retrieve(video.id);
      progress = video.progress ?? 0;

      // Display progress bar
      const barLength = 30;
      const filledLength = Math.floor((progress / 100) * barLength);
      const bar = '='.repeat(filledLength) + '-'.repeat(barLength - filledLength);
      const statusText = video.status === 'queued' ? 'Queued' : 'Processing';

      process.stdout.write(`\r${statusText}: [${bar}] ${progress.toFixed(1)}%`);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    process.stdout.write('\n');

    // Verificar si falló
    if (video.status === 'failed') {
      throw new Error('Video generation failed');
    }

    console.log('✅ Video generation completed: ', video);
    console.log('📥 Downloading video content...');

    // Descargar contenido del video
    const content = await azureOpenai.videos.downloadContent(video.id);
    const body = content.arrayBuffer();
    const buffer = Buffer.from(await body);

    // Asegurar que existe el directorio generated/videos
    const videosDir = path.join(process.cwd(), 'generated', 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Guardar video con nombre único
    const fileName = `video-${video.id}-${Date.now()}.mp4`;
    const filePath = path.join(videosDir, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`💾 Wrote ${fileName}`);

    // Construir URL del video
    const videoUrl = `${process.env.SERVER_URL}/gpt/video/${fileName}`;

    return {
      url: videoUrl,
      responseId: video.id
    };
  } catch (error: any) {
    console.error('❌ Error en video generation:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      type: error.type,
      code: error.code,
      response: error.response?.data || error.response
    });

    throw new Error(`Error generando video: ${error.message || 'Unknown error'}`);
  }
};
