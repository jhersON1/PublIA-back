import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// Importamos la librería nativa de Vertex AI
import { PredictionServiceClient, helpers } from '@google-cloud/aiplatform';
import * as path from 'path';
import { ImageGenerator } from '../interfaces/image-generator.interface';
import { GenerateImageDto } from '../dto';

@Injectable()
export class GoogleImageGenerator implements ImageGenerator {
    private readonly logger = new Logger(GoogleImageGenerator.name);
    private predictionServiceClient: PredictionServiceClient;

    // TUS DATOS
    private projectId = 'topicos-project2';
    private location = 'us-central1';
    // Usamos el modelo estándar que vimos en tu cuota
    private modelId = 'imagen-4.0-generate-001';

    constructor(private configService: ConfigService) {
        // 1. Configuramos el cliente
        const clientOptions: any = {
            apiEndpoint: 'us-central1-aiplatform.googleapis.com',
        };

        // Verificamos si existe la variable de entorno con el JSON completo (para Vercel)
        if (process.env.GOOGLE_CREDENTIALS_JSON) {
            try {
                const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
                clientOptions.credentials = credentials;
                this.logger.log('🔐 Usando credenciales desde variable de entorno GOOGLE_CREDENTIALS_JSON');
            } catch (error) {
                this.logger.error('❌ Error al parsear GOOGLE_CREDENTIALS_JSON', error);
            }
        } else {
            // Fallback: Usar archivo local (para desarrollo)
            const keyFilename = path.join(process.cwd(), 'credenciales-google-ai.json');
            clientOptions.keyFilename = keyFilename;
            this.logger.log(`📂 Usando credenciales desde archivo local: ${keyFilename}`);
        }

        this.predictionServiceClient = new PredictionServiceClient(clientOptions);
    }

    async generateImage(options: GenerateImageDto): Promise<{ imageBase64: string; responseId?: string }> {
        const { prompt } = options;

        // Construimos la ruta (Endpoint)
        const endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}`;

        // Preparamos el prompt al estilo Vertex AI (no estilo Gemini)
        const instance = helpers.toValue({ prompt: prompt });

        const parameters = helpers.toValue({
            sampleCount: 1,
            aspectRatio: '1:1'
        });

        const request = {
            endpoint,
            instances: [instance],
            parameters
        };

        try {
            this.logger.log(`🎨 Usando cuota de Vertex AI para: ${this.modelId}`);

            const [response] = await this.predictionServiceClient.predict(request as any);

            if (!response.predictions || response.predictions.length === 0) {
                throw new Error('Vertex AI no devolvió predicciones (Revisa filtros de seguridad).');
            }

            // Decodificar la respuesta
            const prediction = response.predictions[0];

            const imageBase64 = prediction.structValue?.fields?.bytesBase64Encoded?.stringValue;

            if (!imageBase64) throw new Error('No se encontró base64 en la respuesta');

            return {
                imageBase64: imageBase64,
                responseId: 'vertex-' + Date.now(),
            };

        } catch (error) {
            this.logger.error('Error en Vertex AI:', error);
            throw error;
        }
    }
}
