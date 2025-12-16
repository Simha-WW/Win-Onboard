/**
 * Documents Page - File upload and management
 */

import { useEffect, useState } from 'react';
import { DocumentUpload } from '../components/onboarding/DocumentUpload';
import { documentsApi, type Document } from '../utils/api';

export const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const loadDocs = async () => {
      const data = await documentsApi.getDocuments();
      setDocuments(data);
    };
    loadDocs();
  }, []);

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      const doc = await documentsApi.uploadDocument(file);
      setDocuments(prev => [...prev, doc]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900">Document Upload</h1>
      <p className="text-slate-600">
        Upload required documents to complete your onboarding process.
      </p>
      
      <DocumentUpload 
        onUpload={handleUpload}
        existingDocs={documents}
      />
    </div>
  );
};