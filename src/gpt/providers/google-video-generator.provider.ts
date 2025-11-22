import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleAuth } from 'google-auth-library';
import * as path from 'path';
import { VideoGenerator } from '../interfaces/video-generator.interface';
import { GenerateVideoDto } from '../dto/generate-video.dto';
import { VideoGenerationResponse } from '../use-cases/shared';
import * as fs from 'fs';

@Injectable()
export class GoogleVideoGenerator implements VideoGenerator {
    private readonly logger = new Logger(GoogleVideoGenerator.name);
    private auth: GoogleAuth;

    // Configuración
    private projectId = 'topicos-project2';
    private location = 'us-central1';
    private modelId = 'veo-3.1-generate-001'; 
    private apiEndpoint = 'https://us-central1-aiplatform.googleapis.com';

    constructor(private configService: ConfigService) {
        const keyFilename = path.join(process.cwd(), 'credenciales-google-ai.json');
        
        // 1. Configuramos la autenticación manual
        this.auth = new GoogleAuth({
            keyFilename: keyFilename,
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
        });
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
                durationSeconds: "4",
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

            // --- AQUÍ EXTRAEMOS Y GUARDAMOS EL VIDEO ---
            
            // 1. Accedemos a la estructura exacta que me mostraste
            const videos = data.response?.videos;

            // Validación de seguridad: ¿Realmente hay videos?
            if (!videos || videos.length === 0) {
                // A veces Veo termina "done" pero sin video si el prompt fue bloqueado por seguridad
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

            // 3. ¡GUARDAMOS EL ARCHIVO! (Llamamos a tu método helper)
            const fileName = this.saveVideoFile(base64String, operationName);
            
            // 4. Construimos la URL para que el Frontend pueda ver el video
            // Ajusta 'process.env.SERVER_URL' a tu dominio real o localhost:3000
            const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
            const videoUrl = `${serverUrl}/generated/videos/${fileName}`;

            return {
                status: 'COMPLETED',
                url: videoUrl,      // URL pública para el frontend
                fileName: fileName  // Nombre del archivo físico
            };

        } else {
            // Si data.done es false, sigue cocinándose
            return { status: 'RUNNING' };
        }
    }

    /**
     * Convierte el string Base64 a un archivo .mp4 en tu disco local
     */
    private saveVideoFile(base64Data: string, operationId: string): string {
        try {
            // 1. Definir carpeta de destino (igual que en Azure)
            const videosDir = path.join(process.cwd(), 'generated', 'videos');
            
            // 2. Crear carpeta si no existe
            if (!fs.existsSync(videosDir)) {
                fs.mkdirSync(videosDir, { recursive: true });
            }

            // 3. Generar nombre único usando el ID de la operación
            // Limpiamos el ID para que no tenga barras '/' que rompan la ruta
            const cleanId = operationId.split('/').pop() || Date.now().toString(); 
            const fileName = `veo-${cleanId}.mp4`;
            const filePath = path.join(videosDir, fileName);

            // 4. Convertir Base64 a Buffer (Binario)
            const buffer = Buffer.from(base64Data, 'base64');

            // 5. Escribir en disco
            fs.writeFileSync(filePath, buffer);
            
            this.logger.log(`💾 Video guardado exitosamente en: ${filePath}`);
            
            // Retornar solo el nombre del archivo para que el controlador arme la URL
            return fileName;
        } catch (error) {
            this.logger.error('Error guardando el archivo de video:', error);
            throw new Error('No se pudo guardar el video en el servidor');
        }
    }
}


