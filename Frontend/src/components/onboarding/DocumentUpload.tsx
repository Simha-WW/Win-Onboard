/**
 * Document Upload component with drag & drop functionality
 * Handles file uploads with progress animation and validation
 */

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  FiUpload, 
  FiFile, 
  FiCheck, 
  FiX, 
  FiAlertCircle,
  FiDownload
} from 'react-icons/fi';
import { clsx } from 'clsx';
import type { Document } from '../../utils/demoData';

interface DocumentUploadProps {
  onUpload?: (files: File[]) => Promise<void>;
  existingDocs?: Document[];
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

/**
 * Drag & drop file upload with animated feedback and file management
 */
export const DocumentUpload = ({
  onUpload,
  existingDocs = [],
  maxSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword']
}: DocumentUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadSuccess, setUploadSuccess] = useState<string[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!onUpload) return;

    // Initialize progress for all files
    const progressMap: Record<string, number> = {};
    acceptedFiles.forEach(file => {
      progressMap[file.name] = 0;
    });
    setUploadProgress(progressMap);

    try {
      // Simulate upload progress
      for (const file of acceptedFiles) {
        // Animate progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 50));
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: i
          }));
        }
      }

      await onUpload(acceptedFiles);
      
      // Mark as successful
      setUploadSuccess(prev => [...prev, ...acceptedFiles.map(f => f.name)]);
      
      // Clear progress after delay
      setTimeout(() => {
        setUploadProgress({});
        setUploadSuccess([]);
      }, 3000);

    } catch (error) {
      console.error('Upload failed:', error);
      setUploadProgress({});
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    maxSize,
    accept: allowedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
  });

  const getDocumentIcon = (type: string) => {
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('word')) return '📝';
    return '📎';
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return <FiCheck className="text-green-600" />;
      case 'rejected':
        return <FiX className="text-red-600" />;
      case 'pending':
        return <FiAlertCircle className="text-yellow-600" />;
      default:
        return <FiFile className="text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className={clsx(
        'border-2 border-dashed transition-all duration-200 cursor-pointer',
        isDragActive 
          ? 'border-[var(--brand-primary)] bg-blue-50' 
          : 'border-slate-300 hover:border-[var(--brand-accent)]'
      )}>
        <div {...getRootProps()} className="text-center py-12">
          <input {...getInputProps()} />
          
          <motion.div
            animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <FiUpload className={clsx(
              'w-12 h-12 mx-auto mb-4',
              isDragActive ? 'text-[var(--brand-primary)]' : 'text-slate-400'
            )} />
          </motion.div>

          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {isDragActive ? 'Drop files here' : 'Upload Documents'}
          </h3>
          
          <p className="text-slate-600 mb-4">
            Drag & drop files here, or click to select
          </p>
          
          <Button variant="outline" size="sm">
            Choose Files
          </Button>
          
          <p className="text-xs text-slate-500 mt-3">
            Max file size: {maxSize / 1024 / 1024}MB. 
            Supported: PDF, JPG, PNG, DOC
          </p>
        </div>
      </Card>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <Card variant="outlined" className="border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-red-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800 mb-2">Upload Failed</h4>
              {fileRejections.map(({ file, errors }) => (
                <div key={file.name} className="text-sm text-red-700">
                  <span className="font-medium">{file.name}:</span>{' '}
                  {errors.map(e => e.message).join(', ')}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Upload Progress */}
      <AnimatePresence>
        {Object.keys(uploadProgress).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <Card key={fileName} className="border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📄</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{fileName}</span>
                      <span className="text-sm text-slate-600">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <motion.div
                        className="bg-[var(--brand-primary)] h-1.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                  {uploadSuccess.includes(fileName) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-green-600"
                    >
                      <FiCheck className="w-5 h-5" />
                    </motion.div>
                  )}
                </div>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Existing Documents */}
      {existingDocs.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Uploaded Documents
          </h3>
          <div className="space-y-3">
            {existingDocs.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{doc.name}</h4>
                      <p className="text-sm text-slate-600">
                        {doc.size} • Uploaded {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {getStatusIcon(doc.status)}
                      <span className="text-sm capitalize text-slate-600">
                        {doc.status}
                      </span>
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <FiDownload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};