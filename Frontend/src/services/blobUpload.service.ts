import { BlockBlobClient } from '@azure/storage-blob';

export interface UploadTokenResponse {
  sasUrl: string;
  blobName: string;
  expiresIn: number;
}

/**
 * Azure Blob Storage Upload Service
 * Handles direct file uploads from frontend to Azure Blob Storage
 */
class BlobUploadService {
  private baseUrl: string;

  constructor() {
    // Use environment variable or default to backend URL
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  /**
   * Get upload token (SAS URL) from backend
   */
  async getUploadToken(
    fileName: string,
    documentType: 'aadhaar' | 'pan' | 'resume' | 'education',
    fresherId: number
  ): Promise<UploadTokenResponse> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`${this.baseUrl}/blob/upload-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileName,
        documentType,
        fresherId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get upload token');
    }

    return response.json();
  }

  /**
   * Upload file directly to Azure Blob Storage
   * @param file File to upload
   * @param documentType Type of document (aadhaar, pan, resume, education)
   * @param fresherId Fresher ID
   * @returns Blob URL of uploaded file
   */
  async uploadFile(
    file: File,
    documentType: 'aadhaar' | 'pan' | 'resume' | 'education',
    fresherId: number,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      console.log('🔵 Starting upload for:', { fileName: file.name, documentType, fresherId, fileSize: file.size });
      
      // Step 1: Get SAS token from backend
      console.log('🔵 Step 1: Requesting SAS token from backend...');
      const { sasUrl, blobName } = await this.getUploadToken(
        file.name,
        documentType,
        fresherId
      );
      console.log('✅ SAS token received:', { blobName, sasUrlLength: sasUrl.length });

      // Step 2: Upload file directly to Azure Blob Storage
      console.log('🔵 Step 2: Uploading to Azure Blob Storage...');
      const blockBlobClient = new BlockBlobClient(sasUrl);
      
      // Upload with progress tracking
      await blockBlobClient.uploadData(file, {
        onProgress: (progress) => {
          if (onProgress) {
            const percentage = (progress.loadedBytes / file.size) * 100;
            console.log(`📊 Upload progress: ${Math.round(percentage)}%`);
            onProgress(Math.round(percentage));
          }
        },
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      });

      // Return the permanent blob URL (without SAS token)
      const blobUrl = sasUrl.split('?')[0];
      console.log('✅ Upload complete! Blob URL:', blobUrl);
      
      return blobUrl;
    } catch (error: any) {
      console.error('❌ Error uploading file to blob storage:', error);
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        stack: error.stack
      });
      throw new Error(`Failed to upload ${documentType}: ${error.message}`);
    }
  }

  /**
   * Upload multiple files
   * @param files Array of files with their types
   * @param fresherId Fresher ID
   * @param onProgress Progress callback for all files
   * @returns Object with blob URLs for each document type
   */
  async uploadMultipleFiles(
    files: Array<{ file: File; documentType: 'aadhaar' | 'pan' | 'resume' }>,
    fresherId: number,
    onProgress?: (documentType: string, progress: number) => void
  ): Promise<Record<string, string>> {
    const uploadPromises = files.map(async ({ file, documentType }) => {
      const url = await this.uploadFile(
        file,
        documentType,
        fresherId,
        (progress) => onProgress?.(documentType, progress)
      );
      return { documentType, url };
    });

    const results = await Promise.all(uploadPromises);
    
    // Convert array to object
    return results.reduce((acc, { documentType, url }) => {
      acc[`${documentType}_file_url`] = url;
      return acc;
    }, {} as Record<string, string>);
  }
}

// Export singleton instance
export const blobUploadService = new BlobUploadService();
