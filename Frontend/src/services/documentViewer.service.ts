/**
 * Document Viewer Service
 * Handles authenticated viewing of documents from Azure Blob Storage
 */

import { API_BASE_URL } from '../config';

class DocumentViewerService {
  /**
   * Open a blob document in a popup with authentication
   * @param blobUrl - Full Azure Blob Storage URL
   * @param documentName - Optional name for the popup window
   */
  async viewBlobDocument(blobUrl: string, documentName: string = 'Document'): Promise<void> {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('Authentication required');
      }

      // Request SAS URL from backend
      const response = await fetch(`${API_BASE_URL}/blob/view-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ blobUrl })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate view token');
      }

      const { sasUrl } = await response.json();

      // Open document in a new tab
      const newTab = window.open(sasUrl, '_blank');

      if (!newTab) {
        throw new Error('Popup blocked. Please allow popups for this site.');
      }
    } catch (error: any) {
      console.error('Error viewing document:', error);
      throw error;
    }
  }

  /**
   * Check if a value is a blob URL
   * @param value - Value to check
   */
  isBlobUrl(value: any): boolean {
    if (typeof value !== 'string') return false;
    
    // Check if it's an Azure Blob Storage URL
    return value.includes('.blob.core.windows.net/');
  }

  /**
   * Extract file name from blob URL
   * @param blobUrl - Full blob URL
   */
  extractFileName(blobUrl: string): string {
    try {
      const parts = blobUrl.split('/');
      const fileName = parts[parts.length - 1];
      // Remove query parameters if present
      return fileName.split('?')[0];
    } catch {
      return 'Document';
    }
  }
}

export const documentViewerService = new DocumentViewerService();
