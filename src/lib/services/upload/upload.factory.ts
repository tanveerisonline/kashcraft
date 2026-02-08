// src/lib/services/upload/upload.factory.ts

import { IUploadService, UploadProvider } from "./upload.interface";
import { CloudinaryUploadService } from "./cloudinary.service";
// import { AwsS3UploadService } from "./aws-s3.service"; // Future implementation
// import { AzureBlobUploadService } from "./azure-blob.service"; // Future implementation

export class UploadServiceFactory {
  static create(provider: UploadProvider): IUploadService {
    switch (provider) {
      case UploadProvider.CLOUDINARY:
        return new CloudinaryUploadService();
      // case UploadProvider.AWS_S3:
      //   return new AwsS3UploadService();
      // case UploadProvider.AZURE_BLOB:
      //   return new AzureBlobUploadService();
      default:
        throw new Error(`Unsupported upload provider: ${provider}`);
    }
  }
}
