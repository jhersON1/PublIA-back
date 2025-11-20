/**
 * DTO para la información de origen del video
 */
export interface SourceInfo {
    source: 'FILE_UPLOAD';
    video_size: number;
    chunk_size: number;
    total_chunk_count: number;
}

/**
 * DTO para el request de inicialización de subida de video
 */
export interface VideoInitRequest {
    source_info: SourceInfo;
}

/**
 * DTO para los datos de respuesta de inicialización
 */
export interface VideoInitData {
    publish_id: string;
    upload_url: string;
}

/**
 * DTO para el error de respuesta de TikTok
 */
export interface TikTokError {
    code: string;
    message: string;
    log_id: string;
}

/**
 * DTO para la respuesta completa de inicialización de video
 */
export interface VideoInitResponse {
    data: VideoInitData;
    error: TikTokError;
}
