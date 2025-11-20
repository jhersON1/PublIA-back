export const AzureVideoEndpoints = {
    getAzurePostVideoUrl: () => `${process.env.AZURE_OPENAI_ENDPOINT}/openai/v1/video/generations/jobs?api-version=preview`,
    getJobStatusUrl: (jobId: string) => `${process.env.AZURE_OPENAI_ENDPOINT}/openai/v1/video/generations/jobs/${jobId}?api-version=preview`,
    getVideoDownloadUrl: (generationId: string) => `${process.env.AZURE_OPENAI_ENDPOINT}/openai/v1/video/generations/${generationId}/content/video?api-version=preview`
};
