// src/lib/services/upload/cloudinary.service.ts

import { IUploadService, UploadResult } from "./upload.interface";
import { v2 as cloudinary } from 'cloudinary';

export class CloudinaryUploadService implements IUploadService {
  constructor() {
    // Initialize Cloudinary configuration
    // This should ideally come from environment variables
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log("CloudinaryUploadService initialized.");
  }

  async uploadSingle(file: any, folder: string): Promise<UploadResult> {
    console.log(`Cloudinary: Uploading single file to folder: ${folder}`);
    try {
      // In a real application, 'file' would be a stream or buffer
      // For demonstration, we'll simulate an upload
      const result = await cloudinary.uploader.upload(file, { folder });
      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        originalFilename: result.original_filename,
      };
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      throw new Error("Failed to upload file to Cloudinary.");
    }
  }

  async uploadMultiple(files: any[], folder: string): Promise<UploadResult[]> {
    console.log(`Cloudinary: Uploading multiple files to folder: ${folder}`);
    const uploadPromises = files.map(file => this.uploadSingle(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(publicId: string): Promise<boolean> {
    console.log(`Cloudinary: Deleting file with publicId: ${publicId}`);
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error("Cloudinary delete failed:", error);
      throw new Error("Failed to delete file from Cloudinary.");
    }
  }

  getOptimizedUrl(publicId: string, transformations: object): string {
    console.log(`Cloudinary: Getting optimized URL for publicId: ${publicId} with transformations:`, transformations);
    // Example: { width: 100, height: 100, crop: "fill" }
    return cloudinary.url(publicId, transformations);
  }
}
