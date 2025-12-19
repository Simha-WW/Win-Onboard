# 🚀 Quick Start: Blob Storage Integration

## Changes Made

I've integrated Azure Blob Storage for document uploads. Here's what was added:

### Backend Changes

1. **New Service**: `src/services/blob.service.ts`
   - Handles file uploads to Azure Blob Storage
   - Automatic fallback to database storage if not configured
   - Secure SAS token generation for file access

2. **Updated Service**: `src/services/bgv.service.ts`
   - Modified to use blob storage for document uploads
   - Stores blob names instead of binary data (when configured)
   - Backward compatible with database storage

3. **Database Migration**: `database_scripts/add-blob-storage-columns.js`
   - Adds blob_name columns to bgv_demographics table

4. **Dependencies Added**:
   - `@azure/storage-blob` - Azure SDK
   - `uuid` - Unique file naming
   - `multer` - File upload handling

### Frontend Changes

The `HrBGVVerification.tsx` now handles binary file viewing with:
- Detection of document fields vs regular fields
- "View Document" button for binary files
- Support for base64, Buffer objects, and data URLs
- Proper MIME type detection

## Setup Instructions

### Option 1: Use Azure Blob Storage (Recommended for Production)

```bash
# 1. Install dependencies
cd Backend
npm install

# 2. Set up Azure (see BLOB_STORAGE_SETUP.md for details)
# Add to .env:
AZURE_STORAGE_CONNECTION_STRING=your_connection_string_here
AZURE_STORAGE_CONTAINER_NAME=bgv-documents

# 3. Run database migration
npm run db:add-blob-storage

# 4. Restart server
npm run dev
```

### Option 2: Use Database Storage (For Development)

```bash
# Just don't set the Azure environment variables
# System will automatically use database VARBINARY storage
cd Backend
npm run dev
```

## How It Works

### Document Upload Flow

```
User uploads file → Frontend (base64) → Backend → Blob Storage
                                              ↓
                                         Store blob_name in DB
```

### Document Retrieval Flow (HR View)

```
HR views document → Backend generates SAS URL → Opens in new tab
                         ↓
                    (expires in 60 min)
```

### File Organization

```
bgv-documents/
  └── freshers/
      └── {fresherId}/
          ├── aadhaar/{timestamp}_{uuid}.pdf
          ├── pan/{timestamp}_{uuid}.pdf
          └── resume/{timestamp}_{uuid}.pdf
```

## Testing

### Test Blob Storage

```bash
# Run the backend
cd Backend
npm run dev

# In another terminal, upload a document via the frontend
# Check logs for:
# ✅ Aadhaar uploaded: freshers/123/aadhaar/1234567890_abc123.pdf
```

### Test Fallback to Database

```bash
# Comment out AZURE_STORAGE_CONNECTION_STRING in .env
# Restart server - should see:
# ⚠️ Azure Storage connection string not found. Using local file storage.
```

## Benefits

✅ **Scalable**: No database size limits
✅ **Fast**: Direct blob access, no database overhead  
✅ **Secure**: Private containers with SAS tokens
✅ **Cost-effective**: ~$0.018/GB/month vs database storage
✅ **Flexible**: Easy fallback to database storage
✅ **Production-ready**: Enterprise-grade storage solution

## Next Steps

1. **Development**: Use database storage (no setup needed)
2. **Staging/Production**: Set up Azure Blob Storage
3. **Migration**: Use provided scripts to migrate existing files

## Files Modified/Created

### Backend
- ✅ `src/services/blob.service.ts` (NEW)
- ✅ `src/services/bgv.service.ts` (MODIFIED - blob integration)
- ✅ `database_scripts/add-blob-storage-columns.js` (NEW)
- ✅ `BLOB_STORAGE_SETUP.md` (NEW)
- ✅ `package.json` (MODIFIED - dependencies & scripts)
- ✅ `.env.example` (MODIFIED - Azure config)

### Frontend
- ✅ `src/pages/hr/HrBGVVerification.tsx` (MODIFIED - binary file handling)

## Troubleshooting

**Issue**: Files not uploading
- Check AZURE_STORAGE_CONNECTION_STRING is set
- Verify container exists
- Check network connectivity

**Issue**: "View Document" not working
- Check browser console for errors
- Verify file data format in API response
- Check SAS token generation

**Issue**: Database errors
- Run migration: `npm run db:add-blob-storage`
- Check if columns already exist

## Support

See detailed setup guide: `BLOB_STORAGE_SETUP.md`

For questions, check:
1. Application logs
2. Azure Portal → Storage Account → Monitoring
3. Network tab in browser DevTools
