# Azure Blob Storage Setup Guide

This guide walks you through setting up Azure Blob Storage for document uploads in the WinOnboard BGV system.

## Why Blob Storage?

- **Scalability**: Handle unlimited documents without database size constraints
- **Cost-Effective**: Pay only for storage used, much cheaper than database storage
- **Performance**: Faster file access and reduced database load
- **Security**: Secure file access with SAS tokens
- **Compliance**: Better data management for regulatory requirements

## Setup Steps

### 1. Create Azure Storage Account

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" → "Storage account"
3. Fill in the details:
   - **Resource Group**: Create new or select existing
   - **Storage account name**: e.g., `winonboardstorage` (must be globally unique)
   - **Region**: Choose closest to your users
   - **Performance**: Standard
   - **Redundancy**: LRS (Locally Redundant Storage) for development, GRS for production
4. Click "Review + Create" → "Create"

### 2. Get Connection String

1. Navigate to your storage account
2. Go to "Security + networking" → "Access keys"
3. Copy the "Connection string" from key1 or key2

### 3. Create Container

1. In your storage account, go to "Data storage" → "Containers"
2. Click "+ Container"
3. Name: `bgv-documents`
4. Public access level: **Private** (important for security)
5. Click "Create"

### 4. Configure Environment Variables

Add to your `.env` file:

```env
# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=winonboardstorage;AccountKey=YOUR_KEY_HERE;EndpointSuffix=core.windows.net
AZURE_STORAGE_CONTAINER_NAME=bgv-documents
```

### 5. Run Database Migration

Add blob storage columns to the database:

```bash
cd Backend
node database_scripts/add-blob-storage-columns.js
```

### 6. Install Dependencies

```bash
cd Backend
npm install @azure/storage-blob uuid
```

### 7. Restart Application

```bash
npm run dev
```

## Folder Structure in Blob Storage

Documents are organized as:
```
bgv-documents/
  └── freshers/
      └── {fresherId}/
          ├── aadhaar/
          │   └── {timestamp}_{uuid}.pdf
          ├── pan/
          │   └── {timestamp}_{uuid}.pdf
          ├── resume/
          │   └── {timestamp}_{uuid}.pdf
          └── education/
              └── {timestamp}_{uuid}.pdf
```

## Features

### Automatic Fallback
If Azure Blob Storage is not configured, the system automatically falls back to database storage (VARBINARY columns).

### Secure Access
- Files are stored with private access
- SAS (Shared Access Signature) tokens are generated for temporary access
- Tokens expire after 60 minutes by default

### File Management
```typescript
// Upload file
const result = await blobStorage.uploadDocument(
  buffer,
  'filename.pdf',
  'application/pdf',
  fresherId,
  'aadhaar'
);

// Generate secure download URL
const sasUrl = await blobStorage.generateSasUrl(result.blobName);

// Download file
const buffer = await blobStorage.downloadDocument(blobName);

// Delete file
await blobStorage.deleteDocument(blobName);

// List all files for a fresher
const files = await blobStorage.listFresherDocuments(fresherId);
```

## Cost Estimation

### Azure Blob Storage Pricing (approximate, check current rates)

- **Storage**: ~$0.018 per GB/month (Hot tier)
- **Operations**: 
  - Write: $0.05 per 10,000 operations
  - Read: $0.004 per 10,000 operations

### Example Cost for 1000 Users
- Average 5 documents per user × 2MB each = 10GB
- Monthly storage cost: $0.18
- Operations: negligible

**Much cheaper than database storage!**

## Local Development Without Azure

For local development without Azure:

1. Comment out blob storage variables in `.env`
2. System will automatically use database storage
3. No code changes needed - automatic fallback

## Troubleshooting

### "Azure Blob Storage is not configured"
- Check if `AZURE_STORAGE_CONNECTION_STRING` is set in `.env`
- Verify connection string format
- Restart the application after adding environment variables

### "Container not found"
- Ensure container name matches `AZURE_STORAGE_CONTAINER_NAME`
- Verify container exists in Azure Portal
- Container is created automatically if connection string is valid

### "Invalid connection string"
- Check for extra spaces or line breaks in `.env`
- Ensure you copied the complete connection string
- Try regenerating the access key in Azure Portal

## Security Best Practices

1. **Never commit** connection strings to git
2. Use **Azure Key Vault** for production secrets
3. Enable **Soft Delete** for blob recovery
4. Set up **Lifecycle Management** for old files
5. Enable **Azure Monitor** for audit logs
6. Use **Azure AD authentication** instead of connection strings (advanced)

## Migration from Database to Blob

If you have existing files in the database:

```bash
# Run migration script (coming soon)
node scripts/migrate-files-to-blob.js
```

This will:
1. Extract all files from database
2. Upload to blob storage
3. Update database with blob names
4. Verify integrity
5. Optionally remove binary data from database

## Support

For issues or questions:
1. Check Azure Blob Storage documentation
2. Review application logs
3. Contact IT support team

## Next Steps

After setup:
- [x] Azure Storage Account created
- [x] Connection string configured
- [x] Container created
- [x] Database migration run
- [x] Application tested
- [ ] Configure lifecycle management policies
- [ ] Set up monitoring and alerts
- [ ] Plan backup strategy
