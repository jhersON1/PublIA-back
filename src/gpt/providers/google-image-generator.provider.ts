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
        // 1. Ruta al archivo JSON (tu llave)
        // Asegúrate de que el archivo se llame así y esté en la raíz del proyecto
        // User previously said 'credenciales-google-ai.json', but snippet says 'credenciales.json'.
        // I will use 'credenciales-google-ai.json' to match the file we know exists from previous steps.
        const keyFilename = path.join(process.cwd(), 'credenciales-google-ai.json');

        // 2. Configuramos el cliente
        const clientOptions = {
            apiEndpoint: 'us-central1-aiplatform.googleapis.com',
            keyFilename: keyFilename, // <--- Aquí le pasamos el JSON directo
        };

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
