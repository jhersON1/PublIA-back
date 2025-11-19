export interface AzureVideoGeneration {
    object: 'video.generation';
    id: string;
    job_id: string;
    created_at: number;
    width: number;
    height: number;
    n_seconds: number;
    prompt: string;
}

export interface AzureVideoGenerationJob {
    object: 'video.generation.job';
    id: string;
    status: 'preprocessing' | 'running' | 'succeeded' | 'failed' | 'cancelled';
    created_at: number;
    finished_at: number | null;
    expires_at: number | null;
    generations: AzureVideoGeneration[];
    prompt: string;
    model: string;
    n_variants: number;
    n_seconds: number;
    height: number;
    width: number;
    inpaint_items: any | null;
    failure_reason: string | null;
    error?: any;
}
