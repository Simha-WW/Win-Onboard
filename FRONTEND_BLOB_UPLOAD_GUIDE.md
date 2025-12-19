# Frontend Blob Upload Implementation Guide

## Overview
This document explains how to implement direct file uploads from the frontend to Azure Blob Storage, replacing the previous base64 approach.

## Architecture

### Old Flow (Base64)
```
Frontend → Convert to Base64 → Send to Backend → Backend uploads to Blob → Save blob_name
```

### New Flow (Direct Upload)
```
Frontend → Get SAS Token from Backend → Upload directly to Azure → Send blob URL to Backend → Save URL
```

## Benefits
- **Reduced Backend Load**: Files don't pass through backend server
- **Faster Uploads**: Direct connection to Azure reduces latency
- **Better Scalability**: Backend only handles metadata, not file data
- **Cost Effective**: Less bandwidth usage on backend server

## Implementation Steps

### 1. Install Frontend Dependencies

```bash
cd Frontend
npm install @azure/storage-blob
```

### 2. Backend Setup

#### A. Blob Upload Controller
Location: `Backend/src/controllers/blob.controller.ts`

The controller provides a `/api/blob/upload-token` endpoint that generates SAS tokens for frontend uploads.

#### B. Blob Service Enhancement
Location: `Backend/src/services/blob.service.ts`

Added `generateUploadSasUrl()` method that creates SAS URLs with write permissions.

#### C. Routes Configuration
Location: `Backend/src/routes/blob.routes.ts` and `Backend/src/routes/index.ts`

Routes are mounted at `/api/blob/*`.

### 3. Frontend Integration

#### A. Blob Upload Service
Location: `Frontend/src/services/blobUpload.service.ts`

```typescript
import { blobUploadService } from '@/services/blobUpload.service';

// Upload single file
const url = await blobUploadService.uploadFile(
  file,
  'aadhaar',  // documentType: 'aadhaar' | 'pan' | 'resume'
  fresherId,
  (progress) => console.log(`Upload progress: ${progress}%`)
);

// Upload multiple files
const urls = await blobUploadService.uploadMultipleFiles(
  [
    { file: aadhaarFile, documentType: 'aadhaar' },
    { file: panFile, documentType: 'pan' },
    { file: resumeFile, documentType: 'resume' }
  ],
  fresherId,
  (docType, progress) => console.log(`${docType}: ${progress}%`)
);
```

#### B. Update Documents.tsx Component

Replace the base64 conversion with blob upload:

```typescript
// OLD CODE (Remove this)
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// NEW CODE (Add this)
import { blobUploadService } from '@/services/blobUpload.service';

const handleFileUpload = async (file: File, documentType: 'aadhaar' | 'pan' | 'resume') => {
  try {
    setUploadProgress((prev) => ({ ...prev, [documentType]: 0 }));
    
    const url = await blobUploadService.uploadFile(
      file,
      documentType,
      fresherId,  // Get from user context
      (progress) => {
        setUploadProgress((prev) => ({ ...prev, [documentType]: progress }));
      }
    );
    
    setDocumentUrls((prev) => ({ ...prev, [`${documentType}_file_url`]: url }));
    
    return url;
  } catch (error) {
    console.error(`Error uploading ${documentType}:`, error);
    throw error;
  }
};
```

#### C. Update Form Submission

Instead of sending base64 data, send URLs:

```typescript
// OLD SUBMISSION (Remove)
const formData = {
  ...otherFields,
  aadhaar_file_data: base64String,
  aadhaar_file_name: file.name,
  aadhaar_file_type: file.type,
  aadhaar_file_size: file.size
};

// NEW SUBMISSION (Use this)
const formData = {
  ...otherFields,
  aadhaar_doc_file_url: documentUrls.aadhaar_file_url,
  aadhaar_file_name: aadhaarFile.name,
  aadhaar_file_type: aadhaarFile.type,
  aadhaar_file_size: aadhaarFile.size,
  pan_file_url: documentUrls.pan_file_url,
  pan_file_name: panFile.name,
  pan_file_type: panFile.type,
  pan_file_size: panFile.size,
  resume_file_url: documentUrls.resume_file_url,
  resume_file_name: resumeFile.name,
  resume_file_type: resumeFile.type,
  resume_file_size: resumeFile.size
};
```

### 4. Backend Updates to Handle URLs

Update `bgv.service.ts` to accept URLs:

```typescript
interface Demographics {
  // ... other fields
  
  // Accept either URLs (new approach) or base64 data (backward compatibility)
  aadhaar_doc_file_url?: string;
  aadhaar_file_data?: string;
  aadhaar_file_name?: string;
  aadhaar_file_type?: string;
  aadhaar_file_size?: number;
  
  pan_file_url?: string;
  pan_file_data?: string;
  pan_file_name?: string;
  pan_file_type?: string;
  pan_file_size?: number;
  
  resume_file_url?: string;
  resume_file_data?: string;
  resume_file_name?: string;
  resume_file_type?: string;
  resume_file_size?: number;
}

// Save logic (prioritize URLs over base64)
const saveLogic = () => {
  if (data.aadhaar_doc_file_url) {
    // Save URL directly
    await pool.request()
      .input('aadhaarUrl', mssql.NVarChar(1000), data.aadhaar_doc_file_url)
      .query('UPDATE ... SET aadhaar_doc_file_url = @aadhaarUrl ...');
  } else if (data.aadhaar_file_data) {
    // Fallback: Upload base64 to blob (backward compatibility)
    const buffer = convertFileDataToBuffer(data.aadhaar_file_data);
    const { blobUrl } = await blobStorage.uploadDocument(...);
    await pool.request()
      .input('aadhaarUrl', mssql.NVarChar(1000), blobUrl)
      .query('UPDATE ... SET aadhaar_doc_file_url = @aadhaarUrl ...');
  }
};
```

### 5. Database Schema

The migration has already added these columns to `bgv_demographics`:

```sql
ALTER TABLE bgv_demographics ADD aadhaar_doc_file_url NVARCHAR(1000) NULL;
ALTER TABLE bgv_demographics ADD pan_file_url NVARCHAR(1000) NULL;
ALTER TABLE bgv_demographics ADD resume_file_url NVARCHAR(1000) NULL;
```

### 6. Security Considerations

1. **SAS Token Expiry**: Tokens expire after 1 hour (configurable)
2. **Write-Only Access**: SAS tokens only allow write/create operations
3. **User Authentication**: Only authenticated users can request upload tokens
4. **File Type Validation**: Validate file types on both frontend and backend
5. **File Size Limits**: Implement size limits (recommended: 10MB)

### 7. Error Handling

```typescript
try {
  const url = await blobUploadService.uploadFile(file, 'aadhaar', fresherId);
} catch (error) {
  if (error.message.includes('Failed to get upload token')) {
    // Backend authentication issue
    console.error('Please log in again');
  } else if (error.message.includes('Network')) {
    // Connection issue
    console.error('Please check your internet connection');
  } else {
    // Upload failed
    console.error('Upload failed. Please try again');
  }
}
```

### 8. Progress Tracking

Add upload progress indicators:

```typescript
const [uploadProgress, setUploadProgress] = useState({
  aadhaar: 0,
  pan: 0,
  resume: 0
});

await blobUploadService.uploadFile(
  file,
  'aadhaar',
  fresherId,
  (progress) => {
    setUploadProgress(prev => ({ ...prev, aadhaar: progress }));
  }
);
```

### 9. Testing Checklist

- [ ] Upload Aadhaar document
- [ ] Upload PAN document
- [ ] Upload Resume
- [ ] Verify URLs are saved in database
- [ ] Test progress indicators
- [ ] Test error handling (network failure, invalid files)
- [ ] Test SAS token expiry (wait 1+ hour)
- [ ] Verify files are accessible via HR portal
- [ ] Test concurrent uploads
- [ ] Test large files (near 10MB limit)

### 10. Migration Strategy

For gradual rollout:

1. **Phase 1**: Keep both approaches working (URL + base64)
2. **Phase 2**: Default to URL uploads, fallback to base64
3. **Phase 3**: Remove base64 support entirely

The current implementation supports Phase 2 - it will use URLs if provided, otherwise fall back to base64 upload.

## Troubleshooting

### Issue: "Failed to get upload token"
**Solution**: Check if backend is running and blob routes are registered

### Issue: "Blob upload failed"
**Solution**: Verify Azure credentials in backend `.env` file

### Issue: "SAS token expired"
**Solution**: Tokens are valid for 1 hour. Request a new token if upload takes too long

### Issue: "File not appearing in HR portal"
**Solution**: Verify URL was saved to database, check `aadhaar_doc_file_url` column

## Next Steps

1. Update `Documents.tsx` component to use the new blob upload service
2. Add UI for upload progress indicators
3. Implement retry logic for failed uploads
4. Add file type and size validation
5. Update HR verification page to read from URL columns

## Support

For questions or issues, refer to:
- Backend Blob Service: `Backend/src/services/blob.service.ts`
- Frontend Blob Service: `Frontend/src/services/blobUpload.service.ts`
- Migration Script: `Backend/database_scripts/add-blob-url-columns.js`
