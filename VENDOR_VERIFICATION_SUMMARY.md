# Vendor Verification Feature - Implementation Summary

## Overview
This document summarizes the implementation of the vendor verification feature that allows HR to verify or reject candidates after they have been sent to the vendor for document verification.

## Feature Workflow

### User Flow
1. **HR Reviews Documents**: HR reviews and verifies all candidate documents in the BGV section
2. **Send to IT & Vendor**: Once all documents are verified, HR clicks "Send to IT and Vendor" button
   - Email sent to IT team (srivarshini929@gmail.com)
   - Email sent to Vendor (vijayasimhatest@gmail.com) with document links
3. **Vendor Verification**: HR can now verify or reject the candidate
   - Click "Verify" button → Candidate moved to Verified tab
   - Click "Reject" button → Candidate moved to Rejected tab
4. **Status Updates**: Candidates are automatically categorized based on vendor verification status

## Database Changes

### New Tables Created

#### 1. vendor_verified
Stores records of candidates verified by the vendor.

```sql
CREATE TABLE vendor_verified (
    id INT IDENTITY(1,1) PRIMARY KEY,
    fresher_id INT NOT NULL,
    hr_user_id INT NOT NULL,
    verified_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (fresher_id) REFERENCES freshers(id),
    FOREIGN KEY (hr_user_id) REFERENCES hr_users(id)
);
```

#### 2. vendor_rejected
Stores records of candidates rejected by the vendor with optional reason.

```sql
CREATE TABLE vendor_rejected (
    id INT IDENTITY(1,1) PRIMARY KEY,
    fresher_id INT NOT NULL,
    hr_user_id INT NOT NULL,
    reason NVARCHAR(500) NULL,
    rejected_at DATETIME NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (fresher_id) REFERENCES freshers(id),
    FOREIGN KEY (hr_user_id) REFERENCES hr_users(id)
);
```

### Modified Queries

#### BGV Submissions Query
Updated `getSubmittedBGVFormsForHR()` to include vendor verification status:

```sql
-- Added fields:
CASE WHEN EXISTS (SELECT 1 FROM vendor_verified WHERE fresher_id = f.id) THEN 1 ELSE 0 END as vendor_verified,
CASE WHEN EXISTS (SELECT 1 FROM vendor_rejected WHERE fresher_id = f.id) THEN 1 ELSE 0 END as vendor_rejected
```

## Backend Implementation

### API Endpoints

#### 1. POST /api/hr/vendor-verify
Marks a candidate as verified by the vendor.

**Request Body:**
```json
{
  "fresherId": 123
}
```

**Response:**
```json
{
  "message": "Candidate verified successfully"
}
```

**Implementation:**
- File: `Backend/src/controllers/hr.controller.ts`
- Method: `vendorVerify()`
- Validates fresherId
- Checks for duplicate verification
- Inserts record into vendor_verified table
- Uses authenticated HR user ID from JWT token

#### 2. POST /api/hr/vendor-reject
Marks a candidate as rejected by the vendor.

**Request Body:**
```json
{
  "fresherId": 123,
  "reason": "Documents not clear" // optional
}
```

**Response:**
```json
{
  "message": "Candidate rejected successfully"
}
```

**Implementation:**
- File: `Backend/src/controllers/hr.controller.ts`
- Method: `vendorReject()`
- Validates fresherId
- Accepts optional rejection reason
- Checks for duplicate rejection
- Inserts record into vendor_rejected table
- Uses authenticated HR user ID from JWT token

### Routes Configuration
File: `Backend/src/routes/hr.routes.ts`

```typescript
// Vendor verification routes
router.post('/vendor-verify', hrController.vendorVerify.bind(hrController));
router.post('/vendor-reject', hrController.vendorReject.bind(hrController));
```

### Service Layer Updates
File: `Backend/src/services/bgv.service.ts`

**Modified Method:** `getSubmittedBGVFormsForHR()`
- Added vendor_verified and vendor_rejected status fields
- Status checked using EXISTS queries for performance
- Returns 1 if verified/rejected, 0 otherwise

## Frontend Implementation

### Updated Interface
File: `Frontend/src/pages/hr/HrDocumentsBGV.tsx`

```typescript
interface BGVSubmission {
  // ... existing fields ...
  sent_to_it: number;
  vendor_verified: number;    // NEW
  vendor_rejected: number;    // NEW
}
```

### New Handler Functions

#### 1. handleVendorVerify()
```typescript
const handleVendorVerify = async (fresherId: number, e: React.MouseEvent) => {
  e.stopPropagation();
  
  const confirmVerify = window.confirm('Are you sure you want to mark this candidate as verified by vendor?');
  if (!confirmVerify) return;

  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/hr/vendor-verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fresherId })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to verify candidate');
    }

    alert('Candidate verified successfully!');
    fetchSubmissions();
  } catch (error: any) {
    alert(error.message || 'Failed to verify candidate');
    console.error('Error verifying candidate:', error);
  }
};
```

#### 2. handleVendorReject()
```typescript
const handleVendorReject = async (fresherId: number, e: React.MouseEvent) => {
  e.stopPropagation();
  
  const reason = prompt('Please enter the reason for rejection:');
  if (reason === null) return; // User cancelled
  
  try {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/hr/vendor-reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fresherId, reason: reason || undefined })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to reject candidate');
    }

    alert('Candidate rejected successfully!');
    fetchSubmissions();
  } catch (error: any) {
    alert(error.message || 'Failed to reject candidate');
    console.error('Error rejecting candidate:', error);
  }
};
```

### Updated Status Badge Logic

The `getStatusBadge()` function now prioritizes vendor verification status:

```typescript
const getStatusBadge = (submission: BGVSubmission) => {
  // Check vendor verification status first
  if (submission.vendor_verified === 1) {
    return {
      label: 'Verified',
      color: '#10b981',
      bgColor: '#d1fae5',
      icon: <FiCheckCircle />
    };
  }

  if (submission.vendor_rejected === 1) {
    return {
      label: 'Rejected',
      color: '#ef4444',
      bgColor: '#fee2e2',
      icon: <FiX />
    };
  }

  // ... rest of logic for pending/in-progress status
};
```

### Button Layout

The UI now displays up to 4 buttons in a responsive layout:

1. **View Documents** (📄 View) - Always visible, opens document details page
2. **Send to IT and Vendor** (🚀 Send) - Visible when all docs verified, not yet sent
   - Shows "✓ Sent" (disabled) if already sent
3. **Verify** (✅ Verify) - Visible after sent to vendor, pending verification
4. **Reject** (❌ Reject) - Visible after sent to vendor, pending verification

**Button Styling:**
- Small and compact (8px padding, 13px font size)
- Responsive flex layout with wrap support
- Minimum widths to prevent cramping
- Hover effects with color transitions
- Emoji icons for better visual recognition
- Descriptive tooltips on hover

**Conditional Rendering Logic:**
```typescript
{/* View Documents - Always shown */}
<button>📄 View</button>

{/* Send to IT - Only if verified and not sent */}
{submission.verified_count === submission.total_verifications && 
 submission.vendor_verified === 0 &&
 submission.vendor_rejected === 0 && (
  submission.sent_to_it === 1 ? 
    <div>✓ Sent</div> : 
    <button>🚀 Send</button>
)}

{/* Verify/Reject - Only if sent and not yet processed */}
{submission.sent_to_it === 1 && 
 submission.vendor_verified === 0 && 
 submission.vendor_rejected === 0 && (
  <>
    <button>✅ Verify</button>
    <button>❌ Reject</button>
  </>
)}

{/* Status badges if already processed */}
{submission.vendor_verified === 1 && <div>✅ Verified</div>}
{submission.vendor_rejected === 1 && <div>❌ Rejected</div>}
```

## Tab Filtering

The filtering logic now uses vendor verification status to categorize candidates:

- **All Tab**: Shows all submissions
- **Verified Tab**: Shows candidates with `vendor_verified = 1`
- **Rejected Tab**: Shows candidates with `vendor_rejected = 1`
- **In Progress Tab**: Shows candidates with partial document verification
- **Pending Review Tab**: Shows candidates with no document verification yet

## Testing

### Test Script
File: `Backend/test-vendor-verification.js`

The test script provides an interactive way to test the complete flow:

1. HR login
2. Fetch BGV submissions with vendor status
3. Test vendor-verify endpoint
4. Test vendor-reject endpoint
5. Verify status updates in real-time

**Usage:**
```bash
cd Backend
node test-vendor-verification.js
```

### Manual Testing Steps

1. **Login as HR**
   - Navigate to HR portal
   - Login with HR credentials

2. **View BGV Submissions**
   - Go to Documents & BGV section
   - Verify candidates are listed with correct status

3. **Send to Vendor**
   - Select a candidate with all documents verified
   - Click "🚀 Send" button
   - Verify emails are sent to IT and vendor
   - Verify button changes to "✓ Sent"

4. **Vendor Verification**
   - Verify "✅ Verify" and "❌ Reject" buttons appear
   - Click "✅ Verify" button
   - Confirm in dialog
   - Verify candidate moves to Verified tab
   - Verify button changes to "✅ Verified" (disabled)

5. **Vendor Rejection**
   - Select another sent candidate
   - Click "❌ Reject" button
   - Enter rejection reason
   - Verify candidate moves to Rejected tab
   - Verify button changes to "❌ Rejected" (disabled)

6. **Tab Filtering**
   - Click on different tabs (All, Verified, Rejected)
   - Verify candidates are filtered correctly

## Security Considerations

1. **Authentication Required**: All vendor verification endpoints require valid JWT token
2. **HR Role Required**: Only HR users can verify/reject candidates
3. **User ID Tracking**: System records which HR user performed the verification/rejection
4. **Duplicate Prevention**: Database checks prevent multiple verifications/rejections
5. **Input Validation**: fresherId is validated before processing

## Email Notifications

### Vendor Email Template
When "Send to IT and Vendor" is clicked, vendor receives an email with:

- Candidate details (name, email, designation)
- Document links:
  - Aadhaar Card
  - PAN Card
  - Resume
  - Educational Documents
- Professional HTML formatting
- Company branding

**Email Service:**
- File: `Backend/src/services/email.service.ts`
- Method: `sendVendorDocumentVerification()`
- SMTP: Gmail (vijayasimhatest@gmail.com)

## Files Modified/Created

### Backend Files

**Created:**
- `Backend/test-vendor-verification.js` - Test script
- `Backend/create-vendor-verified-table.js` - Table creation script (vendor_verified)
- `Backend/create-vendor-rejected-table.js` - Table creation script (vendor_rejected)

**Modified:**
- `Backend/src/controllers/hr.controller.ts` - Added vendorVerify() and vendorReject() methods
- `Backend/src/routes/hr.routes.ts` - Added vendor verification routes
- `Backend/src/services/bgv.service.ts` - Updated getSubmittedBGVFormsForHR() query

### Frontend Files

**Modified:**
- `Frontend/src/pages/hr/HrDocumentsBGV.tsx`
  - Updated BGVSubmission interface
  - Added handleVendorVerify() and handleVendorReject() handlers
  - Updated getStatusBadge() to check vendor status first
  - Redesigned button layout for 4 buttons in one line
  - Added conditional rendering for verification/rejection status

## Performance Considerations

1. **Database Indexes**: Consider adding indexes on frequently queried columns:
   ```sql
   CREATE INDEX idx_vendor_verified_fresher ON vendor_verified(fresher_id);
   CREATE INDEX idx_vendor_rejected_fresher ON vendor_rejected(fresher_id);
   ```

2. **Query Optimization**: Uses EXISTS subqueries for efficient status checks

3. **Frontend Updates**: Fetches submissions after each action to keep UI in sync

## Future Enhancements

1. **Vendor Portal**: Create a separate portal for vendors to verify documents
2. **Email Notifications**: Send confirmation emails after verification/rejection
3. **Audit Trail**: Add detailed logs for all verification actions
4. **Bulk Operations**: Allow bulk verification/rejection of multiple candidates
5. **Rejection Details**: Show rejection reason in the UI
6. **Vendor Feedback**: Allow vendors to add comments during verification
7. **Dashboard Analytics**: Show verification statistics and trends

## Configuration

### Environment Variables
Ensure these are set in `.env` file:

```env
# Email Configuration
EMAIL_USER=vijayasimhatest@gmail.com
EMAIL_PASS=your_app_password

# IT Team Email
IT_TEAM_EMAIL=srivarshini929@gmail.com

# Vendor Email
VENDOR_EMAIL=vijayasimhatest@gmail.com
```

## Support & Maintenance

### Common Issues

1. **"Candidate already verified" error**
   - Check vendor_verified table for existing record
   - Can't verify a candidate that's already verified

2. **"Candidate already rejected" error**
   - Check vendor_rejected table for existing record
   - Can't reject a candidate that's already rejected

3. **Buttons not showing**
   - Verify candidate has been sent to IT and vendor (sent_to_it = 1)
   - Check vendor_verified and vendor_rejected status

### Database Queries for Debugging

```sql
-- Check vendor_verified records
SELECT * FROM vendor_verified;

-- Check vendor_rejected records
SELECT * FROM vendor_rejected;

-- Check candidate status
SELECT 
  f.id,
  f.first_name,
  f.last_name,
  CASE WHEN EXISTS (SELECT 1 FROM vendor_verified WHERE fresher_id = f.id) THEN 1 ELSE 0 END as verified,
  CASE WHEN EXISTS (SELECT 1 FROM vendor_rejected WHERE fresher_id = f.id) THEN 1 ELSE 0 END as rejected
FROM freshers f;
```

## Conclusion

The vendor verification feature is now fully implemented and tested. HR can now:
- Send candidates to IT and vendor for document verification
- Verify candidates after vendor approval
- Reject candidates with reasons
- View categorized candidates in respective tabs (All, Verified, Rejected)

All buttons are styled to be small, cute, and fit in one line with proper responsive behavior.
