const AZURE_ENDPOINT_BASE = 'https://rodri-mi69p75c-swedencentral.cognitiveservices.azure.com/openai/v1/video/generations';

export const AzureVideoEndpoints = {
    getJobStatusUrl: (jobId: string) => `${AZURE_ENDPOINT_BASE}/jobs/${jobId}?api-version=preview`,
    getVideoDownloadUrl: (generationId: string) => `${AZURE_ENDPOINT_BASE}/${generationId}/content/video?api-version=preview`
};
