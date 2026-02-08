// src/lib/services/upload/upload.interface.ts

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  originalFilename?: string;
  // Add any other relevant properties from your upload service's response
}

export interface IUploadService {
  uploadSingle(file: File, folder: string): Promise<UploadResult>;
  uploadMultiple(files: File[], folder: string): Promise<UploadResult[]>;
  deleteFile(publicId: string): Promise<boolean>;
  getOptimizedUrl(publicId: string, transformations: object): string;
}

export enum UploadProvider {
  CLOUDINARY = "cloudinary",
  AWS_S3 = "aws_s3",
  AZURE_BLOB = "azure_blob",
}
