import { Injectable, Inject } from '@nestjs/common';
import { v2 as Cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(
    @Inject('CLOUDINARY') private readonly cloudinary: typeof Cloudinary,
  ) {}

  async uploadImage(
    base64Image: string,
    folder: string = 'images',
  ): Promise<UploadApiResponse> {
    try {
      const base64Data = base64Image.startsWith('data:image')
        ? base64Image
        : `data:image/png;base64,${base64Image}`;

      const result = await this.cloudinary.uploader.upload(base64Data, {
        folder,
        resource_type: 'image',
      });

      return result;
    } catch (error: any) {
      throw new Error(`Error al subir imagen a Cloudinary: ${error.message}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'images',
  ): Promise<UploadApiResponse> {
    try {
      return await new Promise<UploadApiResponse>((resolve, reject) => {
        this.cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
          },
          (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            if (error) return reject(error);
            resolve(result);
          },
        ).end(file.buffer);
      });
    } catch (error: any) {
      throw new Error(`Error al subir archivo a Cloudinary: ${error.message}`);
    }
  }
}
