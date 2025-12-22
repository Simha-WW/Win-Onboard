/**
 * Policies Service
 * Handles fetching company policy documents from Azure Blob Storage
 */

import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, StorageSharedKeyCredential } from '@azure/storage-blob';

interface PolicyDocument {
  id: string;
  name: string;
  fileName: string;
  type: string;
  size: string;
  status: 'required' | 'optional';
  blobUrl: string;
  sasUrl?: string;
}

export class PoliciesService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string = 'policies';
  private accountName: string;
  private accountKey: string;

  constructor() {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

    if (!connectionString) {
      throw new Error('Azure Storage connection string not found');
    }

    this.blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    
    // Extract account name and key from connection string
    const accountNameMatch = connectionString.match(/AccountName=([^;]+)/);
    const accountKeyMatch = connectionString.match(/AccountKey=([^;]+)/);
    
    if (!accountNameMatch || !accountKeyMatch) {
      throw new Error('Could not extract account credentials from connection string');
    }
    
    this.accountName = accountNameMatch[1]!;
    this.accountKey = accountKeyMatch[1]!;
  }

  /**
   * Generate SAS URL for a blob
   */
  private generateSasUrl(blobName: string): string {
    try {
      const sharedKeyCredential = new StorageSharedKeyCredential(
        this.accountName,
        this.accountKey
      );

      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      // Generate SAS token valid for 1 hour
      const sasToken = generateBlobSASQueryParameters(
        {
          containerName: this.containerName,
          blobName: blobName,
          permissions: BlobSASPermissions.parse('r'), // Read only
          startsOn: new Date(),
          expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour
        },
        sharedKeyCredential
      ).toString();

      return `${blobClient.url}?${sasToken}`;
    } catch (error) {
      console.error('Error generating SAS URL:', error);
      throw error;
    }
  }

  /**
   * Format file size to human readable format
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /**
   * Determine document status based on name
   */
  private getDocumentStatus(name: string): 'required' | 'optional' {
    const requiredDocs = ['employee handbook', 'code of conduct', 'emergency procedures', 'it security'];
    const lowerName = name.toLowerCase();
    return requiredDocs.some(doc => lowerName.includes(doc)) ? 'required' : 'optional';
  }

  /**
   * Get friendly name from filename
   */
  private getFriendlyName(fileName: string): string {
    // Remove .pdf extension and clean up the name
    let name = fileName.replace(/\.pdf$/i, '');
    
    // Handle specific mappings
    if (name.toLowerCase().includes('employee handbook')) {
      return 'Employee Handbook';
    }
    if (name.toLowerCase().includes('it security')) {
      return 'IT Security Policy';
    }
    
    return name;
  }

  /**
   * List all policy documents from blob storage
   */
  async listPolicies(): Promise<PolicyDocument[]> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      const policies: PolicyDocument[] = [];

      // List all blobs in the policies container
      for await (const blob of containerClient.listBlobsFlat()) {
        if (blob.name.toLowerCase().endsWith('.pdf')) {
          const blobClient = containerClient.getBlobClient(blob.name);
          const sasUrl = this.generateSasUrl(blob.name);

          policies.push({
            id: blob.name,
            name: this.getFriendlyName(blob.name),
            fileName: blob.name,
            type: 'PDF',
            size: this.formatFileSize(blob.properties.contentLength || 0),
            status: this.getDocumentStatus(blob.name),
            blobUrl: blobClient.url,
            sasUrl: sasUrl
          });
        }
      }

      // Add placeholder documents if they don't exist
      const existingNames = policies.map(p => p.name.toLowerCase());
      
      const placeholders = [
        { name: 'Benefits Guide', status: 'optional' as const },
        { name: 'Code of Conduct', status: 'required' as const },
        { name: 'Emergency Procedures', status: 'required' as const },
        { name: 'Org Chart', status: 'optional' as const }
      ];

      placeholders.forEach((placeholder, index) => {
        if (!existingNames.some(name => name.includes(placeholder.name.toLowerCase()))) {
          policies.push({
            id: `placeholder-${index}`,
            name: placeholder.name,
            fileName: '',
            type: 'PDF',
            size: 'N/A',
            status: placeholder.status,
            blobUrl: '',
            sasUrl: undefined
          });
        }
      });

      // Sort: required first, then by name
      policies.sort((a, b) => {
        if (a.status === b.status) {
          return a.name.localeCompare(b.name);
        }
        return a.status === 'required' ? -1 : 1;
      });

      return policies;
    } catch (error) {
      console.error('Error listing policies:', error);
      throw error;
    }
  }

  /**
   * Check if policies container exists
   */
  async checkContainer(): Promise<boolean> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      return await containerClient.exists();
    } catch (error) {
      console.error('Error checking container:', error);
      return false;
    }
  }
}

export const policiesService = new PoliciesService();
