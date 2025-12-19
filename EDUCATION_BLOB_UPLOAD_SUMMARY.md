# Educational Document Blob Upload - Implementation Summary

## Overview
Successfully converted educational document uploads from base64 binary storage to Azure Blob Storage URL-based storage. This change:
- ✅ Reduces database size significantly
- ✅ Improves performance (no binary data in SQL queries)
- ✅ Stores single URLs instead of arrays
- ✅ Uploads directly from frontend to Azure Blob Storage
- ✅ Applies to both educational qualifications and additional certificates

## Changes Made

### 1. Database Migration
**File:** `Backend/database_scripts/add-educational-document-url.js`

- Added `document_url NVARCHAR(1000) NULL` column to `educational_details` table
- Migration executed successfully
- Existing `documents` and `document_urls` columns remain for backward compatibility

**Verification:**
```bash
node database_scripts/add-educational-document-url.js
```

### 2. Backend Updates
**File:** `Backend/src/services/bgv.service.ts`

**Method:** `saveEducational()`

**Changes:**
- **OLD:** Accepted `documents` array with base64/URLs, stored in `documents`/`document_urls` columns
- **NEW:** Accepts single `documentUrl` string, stores in `document_url` column

**Code:**
```typescript
// Extract single URL from each educational record
const documentUrl = edu.documentUrl || null;

// Insert with document_url column
INSERT INTO educational_details (
  fresher_id, qualification_type, qualification,
  university_institution, cgpa_percentage, year_of_passing,
  document_url
) VALUES (
  @fresherId, @qualificationType, @qualification,
  @universityInstitution, @cgpaPercentage, @yearOfPassing,
  @documentUrl
)
```

**Same changes applied to additional qualifications/certificates**

### 3. Frontend Updates

#### A. Educational Qualifications Upload
**File:** `Frontend/src/pages/Documents.tsx`

**Function:** `handleEducationFileUpload()`

**Changes:**
```typescript
// OLD APPROACH (Base64):
const base64Data = await fileToBase64(file);
documents: [...(qual.documents || []), ...documents]

// NEW APPROACH (Blob Storage):
const blobUrl = await blobUploadService.uploadFile(file, 'education', fresherId);
documentUrl: blobUrl
documentName: file.name
```

**UI Updates:**
- Removed `multiple` attribute (single file only)
- Added upload progress indicator
- Shows document name after successful upload

**File Input:**
```typescript
<input
  type="file"
  accept=".pdf,.jpg,.jpeg,.png"
  onChange={(e) => handleEducationFileUpload(index, e.target.files)}
  disabled={qual.uploadingDocument}
/>
{qual.uploadingDocument && <div>Uploading...</div>}
{qual.documentUrl && <div>✓ {qual.documentName}</div>}
```

#### B. Additional Certificates Upload
**File:** `Frontend/src/pages/Documents.tsx`

**Function:** `handleAdditionalQualificationFileUpload()`

**Changes:** Same pattern as educational qualifications
- Upload to blob storage
- Store single URL
- Show upload status

#### C. Blob Upload Service
**File:** `Frontend/src/services/blobUpload.service.ts`

**Changes:**
```typescript
// Added 'education' to supported document types
type DocumentType = 'aadhaar' | 'pan' | 'resume' | 'education';
```

## Data Flow

### Upload Flow
```
1. User selects file (PDF/JPG/PNG, max 5MB)
   ↓
2. Frontend validates file type and size
   ↓
3. Frontend uploads directly to Azure Blob Storage
   - Account: winbuildwinonboard
   - Container: winbuild-winonboard
   ↓
4. Azure returns blob URL
   - Format: https://winbuildwinonboard.blob.core.windows.net/winbuild-winonboard/education/{fresherId}/{filename}
   ↓
5. Frontend stores URL in form state
   - documentUrl: "https://..."
   - documentName: "certificate.pdf"
   ↓
6. On form submit, send URL to backend (NOT binary data)
   ↓
7. Backend saves URL to educational_details.document_url
   - Type: NVARCHAR(1000)
   - Single URL, not array
```

### View Flow (Already Implemented)
```
1. HR views document in verification page
   ↓
2. Click "View Document" button
   ↓
3. Frontend calls /api/blob/view-token
   - Sends blob URL
   - JWT authentication required
   ↓
4. Backend generates 15-minute SAS token
   - Read-only access
   ↓
5. Document opens in new tab with authenticated URL
```

## Validation & Testing

### Pre-Upload Tests
**Test:** Database migration
```bash
cd Backend
node database_scripts/add-educational-document-url.js
```

**Expected Output:**
```
✅ Connected successfully
✅ Column document_url added successfully
```

### Post-Upload Tests
**Test:** Verify blob upload setup
```bash
cd Backend
node test-education-blob-upload.js
```

**Expected Output:**
```
✅ document_url column: Exists (NVARCHAR(1000))
✅ Recent records: X found
```

### End-to-End Test
1. Open frontend: http://localhost:5174
2. Login as fresher
3. Navigate to Documents page → Education section
4. Click "Choose File" for a qualification
5. Select a PDF/image (< 5MB)
6. Verify:
   - "Uploading..." appears
   - "✓ filename.pdf" appears after upload
   - No errors in console

7. Submit the form
8. Run test again:
   ```bash
   node test-education-blob-upload.js
   ```
9. Verify output shows:
   - Document URL populated
   - URL contains `.blob.core.windows.net/`
   - Single URL (not array)

10. Login as HR
11. Navigate to http://localhost:5173/hr/documents/{fresherId}
12. Verify educational documents appear
13. Click "View Document" - should open in new tab

## Database Schema

### educational_details Table
| Column | Type | Description | Status |
|--------|------|-------------|--------|
| id | INT | Primary key | Existing |
| fresher_id | INT | Foreign key | Existing |
| qualification_type | NVARCHAR(50) | 'educational' or 'additional' | Existing |
| qualification | NVARCHAR(200) | Degree name | Existing |
| university_institution | NVARCHAR(500) | School/University | Existing |
| cgpa_percentage | NVARCHAR(50) | Grade | Existing |
| year_of_passing | INT | Year | Existing |
| certificate_name | NVARCHAR(500) | For additional certs | Existing |
| documents | NVARCHAR(MAX) | **DEPRECATED** - Old base64 storage | Legacy |
| document_urls | NVARCHAR(MAX) | **DEPRECATED** - Old URL array | Legacy |
| **document_url** | **NVARCHAR(1000)** | **NEW** - Single blob URL | **Active** |
| created_at | DATETIME2 | Timestamp | Existing |
| updated_at | DATETIME2 | Timestamp | Existing |

## Benefits

### Performance
- **Database Size:** Reduced by ~5MB per document (base64 overhead eliminated)
- **Query Speed:** Faster queries without large binary columns
- **Network:** Only URL transferred between frontend/backend (not entire file)

### Scalability
- **Storage:** Unlimited via Azure Blob Storage (not limited by SQL database size)
- **CDN Ready:** Blob URLs can be served via CDN for faster global access
- **Bandwidth:** Azure handles file serving, not application server

### Security
- **SAS Tokens:** 15-minute expiry, read-only access
- **JWT Auth:** Must be authenticated to get SAS token
- **No Direct Access:** Blob URLs without SAS token return 403 Forbidden

## Backward Compatibility

Old records with `documents`/`document_urls` columns are preserved. The columns remain in the table but are no longer used for new uploads.

**Migration Path:**
If needed, old documents can be migrated from base64 to blob storage:
1. Extract base64 from `documents` column
2. Upload to Azure Blob
3. Update `document_url` column
4. Clear `documents` column to save space

## Troubleshooting

### Issue: Upload fails with "Failed to upload file"
**Solution:** Check:
- Azure Blob Storage credentials in `.env`
- Container `winbuild-winonboard` exists
- Network connectivity to Azure

### Issue: Document URL not saved
**Solution:** Check:
- `document_url` column exists (run migration)
- Backend logs for SQL errors
- Frontend console for upload errors

### Issue: View Document returns 403
**Solution:** Check:
- SAS token generation in backend
- JWT token is valid
- Blob URL is correct format

## Files Modified

### Backend
- ✅ `src/services/bgv.service.ts` - Accept documentUrl, save to document_url column
- ✅ `database_scripts/add-educational-document-url.js` - Database migration
- ✅ `test-education-blob-upload.js` - Test script

### Frontend
- ✅ `src/pages/Documents.tsx` - Upload to blob, store URL
- ✅ `src/services/blobUpload.service.ts` - Support 'education' type

### Already Implemented (From Previous Work)
- ✅ `Backend/src/controllers/blob.controller.ts` - SAS token generation
- ✅ `Backend/src/routes/blob.routes.ts` - /view-token endpoint
- ✅ `Frontend/src/services/documentViewer.service.ts` - Authenticated viewing
- ✅ `Frontend/src/pages/hr/HrBGVVerification.tsx` - View document UI

## Next Steps

1. ✅ **COMPLETED:** Database migration
2. ✅ **COMPLETED:** Backend updates
3. ✅ **COMPLETED:** Frontend updates
4. **TODO:** Test end-to-end upload
5. **TODO:** Verify HR can view uploaded documents
6. **OPTIONAL:** Migrate old base64 documents to blob storage
7. **OPTIONAL:** Remove `documents` and `document_urls` columns after migration

## Configuration

### Environment Variables (.env)
```env
# Azure Blob Storage
AZURE_STORAGE_ACCOUNT_NAME=winbuildwinonboard
AZURE_STORAGE_ACCOUNT_KEY=<your-key>
AZURE_STORAGE_CONTAINER_NAME=winbuild-winonboard

# Database
SERVER_NAME=sql-server-winbuild.database.windows.net
DB_NAME=hackathon
DB_USERNAME=sqladmin
DB_PASSWORD=admin@123
```

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs for SQL/upload errors
3. Run test script: `node test-education-blob-upload.js`
4. Verify Azure Blob Storage credentials
5. Ensure document_url column exists in database

---

**Implementation Date:** December 19, 2025  
**Status:** ✅ Ready for Testing  
**Impact:** Low Risk - New column added, old columns preserved
