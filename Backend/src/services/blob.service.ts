/**
 * Blob Storage Service
 * Handles document uploads to Azure Blob Storage
 */

import { BlobServiceClient, ContainerClient, BlobSASPermissions } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

interface UploadResult {
  blobName: string;
  blobUrl: string;
  contentType: string;
  size: number;
}

export class BlobStorageService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'bgv-documents';

    if (!connectionString) {
      console.warn('⚠️ Azure Storage connection string not found. Using local file storage.');
      // Fallback to local storage if Azure is not configured
      this.blobServiceClient = null as any;
    } else {
      this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.initializeContainer();
    }
  }

  /**
   * Initialize blob container if it doesn't exist
   */
  private async initializeContainer(): Promise<void> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const exists = await containerClient.exists();

      if (!exists) {
        await containerClient.create();
        console.log(`✅ Blob container '${this.containerName}' created (private access)`);
      }
    } catch (error) {
      console.error('Error initializing blob container:', error);
      throw error;
    }
  }

  /**
   * Upload a file buffer to blob storage
   * @param buffer File buffer
   * @param originalFilename Original filename
   * @param contentType MIME type
   * @param fresherIdnumber Fresher ID for organizing files
   * @param documentType Type of document (e.g., 'aadhaar', 'pan', 'resume')
   * @returns Upload result with blob URL
   */
  async uploadDocument(
    buffer: Buffer,
    originalFilename: string,
    contentType: string,
    fresherId: number,
    documentType: string
  ): Promise<UploadResult> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage is not configured. Please set AZURE_STORAGE_CONNECTION_STRING.');
    }

    try {
      const fileExtension = path.extname(originalFilename);
      const blobName = this.generateBlobName(fresherId, documentType, fileExtension);

      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      // Upload with metadata
      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: contentType
        },
        metadata: {
          fresherId: fresherId.toString(),
          documentType: documentType,
          originalFilename: originalFilename,
          uploadDate: new Date().toISOString()
        }
      });

      return {
        blobName,
        blobUrl: blockBlobClient.url,
        contentType,
        size: buffer.length
      };
    } catch (error: any) {
      console.error('Error uploading to blob storage:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  /**
   * Generate a unique blob name with organized folder structure
   * Format: freshers/{fresherId}/{documentType}/{timestamp}_{uuid}.ext
   */
  private generateBlobName(fresherId: number, documentType: string, extension: string): string {
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0]; // First segment of UUID
    return `freshers/${fresherId}/${documentType}/${timestamp}_${uniqueId}${extension}`;
  }

  /**
   * Generate a SAS URL for uploading documents from frontend
   * @param blobName Name of the blob to upload
   * @param expiryMinutes Minutes until the SAS token expires (default: 60)
   * @returns SAS URL for document upload with write permissions
   */
  async generateUploadSasUrl(blobName: string, expiryMinutes: number = 60): Promise<string> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage is not configured.');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const blockBlobClient = blobClient.getBlockBlobClient();

      // Generate SAS token with write permissions for upload
      const permissions = new BlobSASPermissions();
      permissions.write = true;
      permissions.create = true;
      
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: permissions,
        expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000)
      });

      return sasUrl;
    } catch (error: any) {
      console.error('Error generating upload SAS URL:', error);
      throw new Error(`Failed to generate upload URL: ${error.message}`);
    }
  }

  /**
   * Get a SAS token URL for secure document access
   * @param blobName Name of the blob
   * @param expiryMinutes Minutes until the SAS token expires (default: 60)
   * @returns SAS URL for document access
   */
  async generateSasUrl(blobName: string, expiryMinutes: number = 60): Promise<string> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage is not configured.');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);
      const blockBlobClient = blobClient.getBlockBlobClient();

      // Generate SAS token with read permissions
      const permissions = new BlobSASPermissions();
      permissions.read = true;
      
      const sasUrl = await blockBlobClient.generateSasUrl({
        permissions: permissions,
        expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000)
      });

      return sasUrl;
    } catch (error: any) {
      console.error('Error generating SAS URL:', error);
      throw new Error(`Failed to generate document access URL: ${error.message}`);
    }
  }

  /**
   * Download a document from blob storage
   * @param blobName Name of the blob
   * @returns File buffer
   */
  async downloadDocument(blobName: string): Promise<Buffer> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage is not configured.');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      const downloadResponse = await blobClient.download();
      const chunks: Buffer[] = [];

      for await (const chunk of downloadResponse.readableStreamBody!) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      return Buffer.concat(chunks);
    } catch (error: any) {
      console.error('Error downloading from blob storage:', error);
      throw new Error(`Failed to download document: ${error.message}`);
    }
  }

  /**
   * Delete a document from blob storage
   * @param blobName Name of the blob
   */
  async deleteDocument(blobName: string): Promise<void> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage is not configured.');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      await blobClient.deleteIfExists();
      console.log(`✅ Deleted blob: ${blobName}`);
    } catch (error: any) {
      console.error('Error deleting blob:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  /**
   * List all documents for a specific fresher
   * @param fresherId Fresher ID
   * @returns Array of blob names
   */
  async listFresherDocuments(fresherId: number): Promise<string[]> {
    if (!this.blobServiceClient) {
      throw new Error('Azure Blob Storage is not configured.');
    }

    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const prefix = `freshers/${fresherId}/`;
      const blobNames: string[] = [];

      for await (const blob of containerClient.listBlobsFlat({ prefix })) {
        blobNames.push(blob.name);
      }

      return blobNames;
    } catch (error: any) {
      console.error('Error listing blobs:', error);
      throw new Error(`Failed to list documents: ${error.message}`);
    }
  }

  /**
   * Check if blob storage is configured
   */
  isConfigured(): boolean {
    return this.blobServiceClient !== null;
  }
}

// Export singleton instance
export const blobStorage = new BlobStorageService();
