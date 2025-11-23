import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '../../http/http.service';
import { TIKTOK_VIDEO_INIT_URL, TIKTOK_BEARER_TOKEN } from '../config/tiktok.urls';
import { VideoInitRequest, VideoInitResponse } from '../dto/upload-video.dto';

/**
 * Servicio para manejar la subida de videos a TikTok
 * Implementa el flujo de dos pasos: inicializar -> subir
 */
@Injectable()
export class TikTokVideoUploadService {
    private readonly logger = new Logger(TikTokVideoUploadService.name);

    constructor(private readonly httpService: HttpService) { }

    /**
     * Paso 1: Inicializar la subida de video
     * @param videoSize Tamaño del video en bytes
     * @returns Respuesta con publish_id y upload_url
     */
    private async initializeUpload(videoSize: number): Promise<VideoInitResponse> {
        this.logger.log(`Inicializando subida de video. Tamaño: ${videoSize} bytes`);

        // Determinar chunk_size según requerimientos de TikTok:
        // - Videos < 5MB: subir completo (chunk_size = video_size)
        // - Videos >= 5MB y <= 64MB: subir completo (chunk_size = video_size)
        // - Videos > 64MB: necesitan múltiples chunks (no implementado aún)
        const MIN_CHUNK_SIZE = 5 * 1024 * 1024; // 5 MB
        const MAX_SINGLE_CHUNK_SIZE = 64 * 1024 * 1024; // 64 MB

        let chunkSize = videoSize;
        let totalChunkCount = 1;

        if (videoSize > MAX_SINGLE_CHUNK_SIZE) {
            this.logger.warn(
                `Video de ${videoSize} bytes excede 64MB. Se subirá como un solo chunk pero TikTok podría requerir múltiples chunks.`,
            );
            // Para videos muy grandes, TikTok requiere múltiples chunks
            // Por ahora intentamos con un chunk, pero esto podría fallar
        }

        const requestBody: VideoInitRequest = {
            source_info: {
                source: 'FILE_UPLOAD',
                video_size: videoSize,
                chunk_size: chunkSize,
                total_chunk_count: totalChunkCount,
            },
        };

        this.logger.log(`Sending init request to TikTok: ${JSON.stringify(requestBody)}`);

        try {
            const response = await this.httpService.postJson<VideoInitResponse>(
                TIKTOK_VIDEO_INIT_URL,
                requestBody,
                {
                    headers: {
                        Authorization: `Bearer ${TIKTOK_BEARER_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            this.logger.log(`Inicialización exitosa. Publish ID: ${response.data.publish_id}`);
            return response;
        } catch (error: any) {
            const status = error.status || error.response?.status;
            const errorData = error.body || error.response?.data || error.message;
            this.logger.error(`Error al inicializar subida. Status: ${status}. Data: ${JSON.stringify(errorData)}`, error.stack);
            throw new Error(`Error al inicializar subida de video a TikTok: ${JSON.stringify(errorData)}`);
        }
    }

    /**
     * Paso 2: Subir el video al URL proporcionado
     * @param uploadUrl URL de subida obtenido del paso 1
     * @param videoBuffer Buffer del video a subir
     * @param videoSize Tamaño total del video
     */
    private async uploadVideoFile(uploadUrl: string, videoBuffer: Buffer, videoSize: number): Promise<void> {
        this.logger.log(`Subiendo video a TikTok. URL: ${uploadUrl}, Tamaño: ${videoSize} bytes`);

        try {
            // Convertir Buffer a Uint8Array para compatibilidad con fetch
            const videoData = new Uint8Array(videoBuffer);

            // Construir Content-Range header: bytes {FIRST_BYTE}-{LAST_BYTE}/{TOTAL_BYTE_LENGTH}
            const firstByte = 0;
            const lastByte = videoSize - 1;
            const contentRange = `bytes ${firstByte}-${lastByte}/${videoSize}`;

            await this.httpService.request(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'video/mp4',
                    'Content-Length': videoSize.toString(),
                    'Content-Range': contentRange,
                },
                body: videoData,
            });

            this.logger.log('Video subido exitosamente');
        } catch (error: any) {
            this.logger.error(`Error al subir video: ${error.message}`, error.stack);
            throw new Error(`Error al subir video a TikTok: ${error.message}`);
        }
    }

    /**
     * Método principal: Orquesta el flujo completo de subida de video
     * @param file Archivo de video de Multer
     * @returns Respuesta formateada para el usuario
     */
    async uploadVideoToTikTok(file: Express.Multer.File) {
        if (!file || !file.buffer) {
            throw new Error('El archivo de video es inválido o no contiene datos');
        }

        this.logger.log(`Iniciando subida de video: ${file.originalname}, Tamaño: ${file.size} bytes`);

        // Validar que hay un bearer token configurado
        if (!TIKTOK_BEARER_TOKEN) {
            throw new Error('TIKTOK_BEARER_TOKEN no está configurado en las variables de entorno');
        }

        // Paso 1: Inicializar la subida
        const initResponse = await this.initializeUpload(file.size);

        // Verificar que la inicialización fue exitosa
        if (initResponse.error.code !== 'ok') {
            throw new Error(`Error de TikTok: ${initResponse.error.message} (${initResponse.error.log_id})`);
        }

        // Paso 2: Subir el archivo al URL proporcionado
        await this.uploadVideoFile(initResponse.data.upload_url, file.buffer, file.size);

        this.logger.log(`Subida completa. Publish ID: ${initResponse.data.publish_id}`);

        // Retornar respuesta formateada para el usuario
        return {
            success: true,
            message: 'Su video se subió correctamente, revise su borrador',
            publish_id: initResponse.data.publish_id,
        };
    }

    /**
     * Publica un video a TikTok desde una URL (para videos en Cloudinary)
     * @param videoUrl URL del video (ej: URL de Cloudinary)
     * @returns Respuesta formateada para el usuario
     */
    async uploadVideoFromUrl(videoUrl: string) {
        this.logger.log(`Descargando video desde URL: ${videoUrl}`);

        try {
            // 1. Descargar el video desde la URL
            const response = await fetch(videoUrl);

            if (!response.ok) {
                throw new Error(`Error al descargar el video: HTTP ${response.status}`);
            }

            // 2. Convertir la respuesta a ArrayBuffer y luego a Buffer
            const arrayBuffer = await response.arrayBuffer();
            const videoBuffer = Buffer.from(arrayBuffer);

            this.logger.log(`Video descargado. Tamaño: ${videoBuffer.length} bytes`);

            // 3. Crear un objeto que simule Express.Multer.File
            const mockFile: Express.Multer.File = {
                buffer: videoBuffer,
                size: videoBuffer.length,
                originalname: `video-from-url-${Date.now()}.mp4`,
                mimetype: 'video/mp4',
                fieldname: 'file',
                encoding: '7bit',
                stream: null as any,  // Not used in our upload process
                destination: '',
                filename: '',
                path: '',
            };

            // 4. Usar el método existente para subir a TikTok
            return await this.uploadVideoToTikTok(mockFile);

        } catch (error: any) {
            this.logger.error(`Error al publicar video desde URL: ${error.message}`, error.stack);
            throw new Error(`Error al publicar video desde URL: ${error.message}`);
        }
    }
}
