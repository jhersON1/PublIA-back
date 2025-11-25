import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';
import { VideoGenerator } from '../interfaces/video-generator.interface';
import { GenerateVideoDto } from '../dto/generate-video.dto';
import { VideoGenerationResponse } from '../use-cases/shared';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';

@Injectable()
export class GoogleVideoGenerator implements VideoGenerator {
    private readonly logger = new Logger(GoogleVideoGenerator.name);
    private auth: GoogleAuth;

    // Configuración
    private projectId = 'topicos-project2';
    private location = 'us-central1';
    private modelId = 'veo-3.1-generate-001';
    private apiEndpoint = 'https://us-central1-aiplatform.googleapis.com';

    constructor(
        private configService: ConfigService,
        private cloudinaryService: CloudinaryService,
    ) {
        const options: any = {
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        };

        // Verificamos si existe la variable de entorno con el JSON completo (para Vercel)
        if (process.env.GOOGLE_CREDENTIALS_JSON) {
            try {
                options.credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
                this.logger.log('🔐 Usando credenciales desde variable de entorno GOOGLE_CREDENTIALS_JSON');
            } catch (error) {
                this.logger.error('❌ Error al parsear GOOGLE_CREDENTIALS_JSON', error);
            }
        } else {
            // Fallback: Usar archivo local (para desarrollo)
            const keyFilename = path.join(process.cwd(), 'credenciales-google-ai.json');
            options.keyFilename = keyFilename;
            this.logger.log(`📂 Usando credenciales desde archivo local: ${keyFilename}`);
        }

        // 1. Configuramos la autenticación manual
        this.auth = new GoogleAuth(options);
    }

    async generateVideo(options: GenerateVideoDto): Promise<VideoGenerationResponse> {
        const { prompt } = options;

        try {
            // Paso 1: Obtener Ticket
            const operationName = await this.startVideoGeneration(prompt);

            // Paso 2: Polling (Esperar activamente)
            let status = 'RUNNING';
            let result: any;
            let attempts = 0;
            const maxAttempts = 60; // 10 minutos máximo (60 * 10s)

            while (status === 'RUNNING' && attempts < maxAttempts) {
                this.logger.debug(`⏳ Esperando video (Veo)... Intento ${attempts + 1}`);
                await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10s

                const check = await this.checkVideoStatus(operationName);
                status = check.status;

                if (status === 'COMPLETED') {
                    result = check.data;
                } else if (status === 'FAILED') {
                    throw new Error(`Fallo en Veo: ${JSON.stringify(check.error)}`);
                }
                attempts++;
            }

            if (status !== 'COMPLETED') {
                throw new Error('Timeout: El video tardó demasiado en generarse.');
            }

            // Aquí result contiene la respuesta final. 
            // Para Veo, suele devolver el video en base64 o un link.
            // Retornamos el ID por ahora para cumplir interfaz.
            return {
                url: 'VIDEO_READY_CHECK_LOGS',
                responseId: operationName
            };

        } catch (error) {
            this.logger.error('❌ Error fatal en generación de video:', error);
            throw error;
        }
    }

    async startVideoGeneration(prompt: string): Promise<string> {
        // Construimos la URL manualmente (Igual que el CURL)
        const url = `${this.apiEndpoint}/v1beta1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}:predictLongRunning`;

        // Obtenemos el Token fresco
        const client = await this.auth.getClient();
        const token = await client.getAccessToken();

        const body = {
            instances: [{ prompt: prompt }],
            parameters: {
                aspectRatio: "16:9",
                sampleCount: 1,
                durationSeconds: 4,
                personGeneration: "allow_all",
                resolution: "720p"
            }
        };

        this.logger.log(`🎬 Enviando petición REST a: ${url}`);

        // Hacemos el fetch nativo
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        // La respuesta debe tener el campo "name" (Operation ID)
        if (!data.name) {
            throw new Error(`Respuesta inesperada de Google: ${JSON.stringify(data)}`);
        }

        this.logger.log(`✅ Operación iniciada. ID: ${data.name}`);
        return data.name;
    }

    async checkVideoStatus(operationName: string): Promise<any> {
        // URL para consultar estado (:fetchPredictOperation)
        const url = `${this.apiEndpoint}/v1beta1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}:fetchPredictOperation`;

        const client = await this.auth.getClient();
        const token = await client.getAccessToken();

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ operationName: operationName })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error HTTP consultando estado ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (data.done) {
            this.logger.log('✨ ¡El video está LISTO en Google!');

            if (data.error) {
                return { status: 'FAILED', error: data.error };
            }

            // --- EXTRAER Y SUBIR A CLOUDINARY ---

            // 1. Accedemos a la estructura exacta de la respuesta
            const videos = data.response?.videos;

            // Validación de seguridad: ¿Realmente hay videos?
            if (!videos || videos.length === 0) {

                this.logger.warn('La operación terminó pero no hay videos en el array.');
                return {
                    status: 'FAILED',
                    error: 'Filtro de seguridad activado o error desconocido en generación.'
                };
            }

            // 2. Obtenemos el Base64 del primer video
            const base64String = videos[0].bytesBase64Encoded;

            if (!base64String) {
                throw new Error('La propiedad bytesBase64Encoded viene vacía.');
            }

            // 3. Convertir Base64 a Buffer
            const videoBuffer = Buffer.from(base64String, 'base64');
            this.logger.log(`Video convertido a buffer. Tamaño: ${videoBuffer.length} bytes`);

            // 4. Subir a Cloudinary
            const cleanId = operationName.split('/').pop() || Date.now().toString();
            const cloudinaryResult = await this.cloudinaryService.uploadVideo(
                videoBuffer,
                'ai-generated-videos',
                `veo-${cleanId}`
            );

            this.logger.log(`✅ Video subido a Cloudinary: ${cloudinaryResult.secure_url}`);

            // 5. Retornar la URL pública de Cloudinary para el frontend
            return {
                status: 'COMPLETED',
                url: cloudinaryResult.secure_url,  // URL pública de Cloudinary
                cloudinary_id: cloudinaryResult.public_id
            };

        } else {
            // Si data.done es false, sigue cocinándose
            return { status: 'RUNNING' };
        }
    }
}

