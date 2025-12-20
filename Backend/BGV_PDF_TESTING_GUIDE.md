# BGV PDF Generation and Email Attachment - API Testing Guide

## Overview
This document provides comprehensive testing instructions for the BGV (Background Verification) PDF generation feature and email attachments functionality.

## Features Implemented

### 1. **BGV PDF Generation Service** (`bgv-pdf.service.ts`)
- Generates professional PDF documents from BGV data
- Includes all 7 sections:
  1. Personal Information
  2. Family Information
  3. Educational Qualifications
  4. Employment History
  5. Passport & Visa Information
  6. Banking & Financial Information
  7. Declaration
- Uses PDFKit library for generation
- Styled professional layout matching BGV form standards

### 2. **Email Service Enhancement** (`email.service.ts`)
- Modified `sendVendorDocumentVerification()` to include PDF attachment
- Modified `sendITEquipmentNotification()` to include PDF attachment
- Both methods now accept optional `fresherId` parameter
- PDF is automatically generated and attached if `fresherId` is provided

### 3. **Updated Service Calls**
- `vendor.service.ts` - Updated to pass `fresherId` to email function
- `it.service.ts` - Updated to pass `fresherId` to email function
- Both services now include complete BGV PDF in verification emails

### 4. **New API Endpoint**
- **GET** `/api/bgv/pdf/:fresherId` - Generate and download BGV PDF

---

## API Endpoints

### 1. Generate BGV PDF (Testing Endpoint)

**Endpoint:** `GET /api/bgv/pdf/:fresherId`

**Description:** Generates and downloads a complete BGV form PDF for a specific fresher.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**URL Parameters:**
- `fresherId` (required): The ID of the fresher

**Response:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename=BGV_Form_{fresherId}_{timestamp}.pdf`

**Success Response:**
- **Code:** 200
- **Content:** PDF file buffer

**Error Responses:**
- **Code:** 400
  ```json
  {
    "success": false,
    "message": "Invalid fresher ID"
  }
  ```
- **Code:** 401
  ```json
  {
    "success": false,
    "message": "User not authenticated"
  }
  ```
- **Code:** 500
  ```json
  {
    "success": false,
    "message": "Failed to generate BGV PDF",
    "error": "<error_message>"
  }
  ```

**Testing with cURL:**
```bash
curl -X GET "http://localhost:3000/api/bgv/pdf/9" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output bgv_form.pdf
```

**Testing with Postman:**
1. Create new GET request to `http://localhost:3000/api/bgv/pdf/9`
2. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
3. Click **Send and Download**
4. PDF will download automatically

**Testing with Thunder Client (VS Code):**
1. New Request → GET
2. URL: `http://localhost:3000/api/bgv/pdf/9`
3. Auth → Bearer Token → Paste your JWT
4. Send
5. View response as binary/download

---

### 2. Send Email to Vendor with PDF Attachment

**Endpoint:** `POST /api/it/send-to-it`

**Description:** Sends equipment notification to IT team and document verification request to vendors with BGV PDF attachment.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fresherId": 9
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Fresher sent to IT and vendor successfully",
  "data": {
    "id": 1,
    "fresher_id": 9,
    "sent_to_it_date": "2025-12-20T10:30:00.000Z",
    "work_email_generated": false,
    "laptop_allocated": false,
    "software_installed": false,
    // ... other fields
  }
}
```

**What Happens:**
1. Creates IT task record for the fresher
2. Generates BGV PDF for fresherId
3. Sends email to all active IT team members with PDF attached
4. Sends email to all active vendors with PDF attached
5. Emails include complete employee information in PDF format

**Testing with cURL:**
```bash
curl -X POST "http://localhost:3000/api/it/send-to-it" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fresherId": 9}'
```

**Expected Email Recipients:**
- **IT Team Members:** All active IT users with `new_user_notifications: true`
- **Vendors:** All active vendors in `vendor_details` table

**Email Contents:**
- **Subject:** Equipment Setup Required / Document Verification Request
- **Body:** HTML formatted with employee details
- **Attachment:** `BGV_Form_[Name]_[Timestamp].pdf`

---

## Testing Workflow

### Prerequisites
1. Backend server running on `http://localhost:3000`
2. Valid JWT token (login as fresher or HR)
3. Fresher with complete BGV data in database
4. Active IT team members configured
5. Active vendors configured
6. SMTP credentials configured in `.env`

### Step-by-Step Testing

#### **Test 1: PDF Generation**
```bash
# 1. Login as fresher to get JWT token
curl -X POST "http://localhost:3000/api/auth/fresher" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tharakveeravelly.tharakveeravelly",
    "password": "your_password"
  }'

# 2. Extract token from response
TOKEN="<your_jwt_token>"

# 3. Generate PDF
curl -X GET "http://localhost:3000/api/bgv/pdf/9" \
  -H "Authorization: Bearer $TOKEN" \
  --output test_bgv_form.pdf

# 4. Open PDF to verify content
# - Check all 7 sections are present
# - Verify data accuracy
# - Check formatting and styling
```

#### **Test 2: Email with PDF Attachment**
```bash
# 1. Check current IT users
curl -X GET "http://localhost:3000/api/it/users" \
  -H "Authorization: Bearer $TOKEN"

# 2. Check current vendors
# (Assuming vendor endpoint exists, or check database directly)

# 3. Send to IT and Vendor
curl -X POST "http://localhost:3000/api/it/send-to-it" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fresherId": 9}'

# 4. Check email inbox for:
#    - IT team members should receive equipment notification with PDF
#    - Vendors should receive verification request with PDF
```

#### **Test 3: Verify Email Attachment**
1. Login to IT team member email account
2. Look for email with subject: "🖥️ Equipment Setup Required - New Employee: [Name]"
3. Verify email contains:
   - Employee details in HTML body
   - PDF attachment named `BGV_Form_[Name]_[Timestamp].pdf`
4. Download and open PDF attachment
5. Verify PDF contains complete BGV data

#### **Test 4: Error Handling**
```bash
# Test invalid fresher ID
curl -X GET "http://localhost:3000/api/bgv/pdf/999999" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 500 error "Fresher not found"

# Test missing JWT
curl -X GET "http://localhost:3000/api/bgv/pdf/9"
# Expected: 401 Unauthorized

# Test non-numeric fresher ID
curl -X GET "http://localhost:3000/api/bgv/pdf/invalid" \
  -H "Authorization: Bearer $TOKEN"
# Expected: 400 "Invalid fresher ID"
```

---

## Database Verification

### Check BGV Data Completeness
```sql
-- Verify fresher exists
SELECT * FROM freshers WHERE id = 9;

-- Check demographics
SELECT * FROM bgv_demographics WHERE fresher_id = 9;

-- Check personal info
SELECT * FROM bgv_personal WHERE fresher_id = 9;

-- Check education
SELECT * FROM educational_details WHERE fresher_id = 9;

-- Check employment
SELECT * FROM employment_history WHERE fresher_id = 9;

-- Check passport/visa
SELECT * FROM passport_visa WHERE fresher_id = 9;

-- Check banking
SELECT * FROM bank_pf_nps WHERE fresher_id = 9;

-- Check IT tasks (after sending to IT)
SELECT * FROM it_tasks WHERE fresher_id = 9;
```

### Check Email Configuration
```sql
-- Verify active IT users
SELECT * FROM it_users WHERE is_active = 1;

-- Verify active vendors
SELECT * FROM vendor_details WHERE status = 'active';
```

---

## Expected Results

### PDF Content Verification
The generated PDF should contain:

✅ **Page 1:**
- Header: "PROFILE BACKGROUND VERIFICATION FORM"
- Company name: "WinWire Technologies Private Limited"
- Generation date
- Section 1: Personal Information (8 fields)
- Address Details (2 fields)
- Identity Documents (2 fields)

✅ **Page 2:**
- Section 2: Family Information (4 fields)
- Emergency Contacts (if available)

✅ **Page 3:**
- Section 3: Educational Qualifications (all education records)

✅ **Page 4:**
- Section 4: Employment History (if available)

✅ **Page 5:**
- Section 5: Passport & Visa Information
- Section 6: Banking & Financial Information

✅ **Page 6:**
- Section 7: Declaration
- Signature placeholder
- Footer with confidentiality notice

### Email Verification
✅ **IT Team Email:**
- Subject: "🖥️ Equipment Setup Required - New Employee: [Name]"
- Body: Equipment checklist, employee details
- Attachment: BGV PDF (should be 50-200KB depending on data)

✅ **Vendor Email:**
- Subject: "📄 Document Verification Request - [Name]"
- Body: Verification request, employee details, document links
- Attachment: BGV PDF (should be 50-200KB depending on data)

---

## Troubleshooting

### Issue: PDF Not Generating
**Error:** "Failed to generate BGV PDF"

**Possible Causes:**
1. Fresher ID doesn't exist in database
2. Missing BGV data (incomplete sections)
3. PDFKit module not installed

**Solution:**
```bash
# Check PDFKit installation
npm list pdfkit

# Reinstall if necessary
npm install pdfkit @types/pdfkit

# Check server logs for detailed error
# Look for: "Error fetching BGV data" or "Error generating PDF content"
```

### Issue: Email Not Sending
**Error:** "Email service not initialized"

**Possible Causes:**
1. SMTP credentials not configured
2. No active IT users/vendors
3. Network/firewall blocking SMTP

**Solution:**
```bash
# 1. Check .env file
cat .env | grep SMTP

# Should have:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASSWORD=your-app-password

# 2. Test SMTP connection
# Check server startup logs for:
# "Email service initialized successfully"

# 3. Verify recipients exist
# Check database for active IT users and vendors
```

### Issue: PDF Attachment Missing
**Symptom:** Email received but no PDF attached

**Possible Causes:**
1. `fresherId` not passed to email service
2. PDF generation failed (non-critical error)
3. Attachment size too large for email server

**Solution:**
- Check server logs for: "⚠️ Failed to generate BGV PDF attachment"
- Verify `fresherId` is being passed correctly
- Check PDF size (should be < 10MB)

### Issue: Incomplete PDF Data
**Symptom:** PDF generates but missing sections

**Possible Causes:**
1. BGV data not submitted for all sections
2. Database columns NULL
3. Date formatting errors

**Solution:**
```sql
-- Check which sections have data
SELECT 
  (SELECT COUNT(*) FROM bgv_demographics WHERE fresher_id = 9) as demographics,
  (SELECT COUNT(*) FROM bgv_personal WHERE fresher_id = 9) as personal,
  (SELECT COUNT(*) FROM educational_details WHERE fresher_id = 9) as education,
  (SELECT COUNT(*) FROM employment_history WHERE fresher_id = 9) as employment,
  (SELECT COUNT(*) FROM passport_visa WHERE fresher_id = 9) as passport,
  (SELECT COUNT(*) FROM bank_pf_nps WHERE fresher_id = 9) as banking;
```

---

## Environment Variables Required

```env
# SMTP Configuration (Required for emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Database Configuration (Required)
DB_SERVER=your-server.database.windows.net
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password

# JWT Configuration (Required for authentication)
JWT_SECRET=your-secret-key
JWT_EXPIRY=24h

# Azure Blob Storage (Required for document uploads)
AZURE_STORAGE_CONNECTION_STRING=your-connection-string
AZURE_STORAGE_CONTAINER_NAME=your-container
```

---

## Success Criteria

### ✅ All Tests Pass When:

1. **PDF Generation:**
   - [ ] PDF downloads successfully via API endpoint
   - [ ] PDF opens without errors
   - [ ] All 7 sections present with correct data
   - [ ] Formatting is professional and readable
   - [ ] File size reasonable (50-200KB)

2. **Email Functionality:**
   - [ ] IT team members receive equipment notification email
   - [ ] Vendors receive document verification email
   - [ ] Both emails include PDF attachment
   - [ ] PDF attachment opens correctly
   - [ ] Email body shows correct employee information

3. **Error Handling:**
   - [ ] Invalid fresher ID returns 400 error
   - [ ] Missing JWT returns 401 error
   - [ ] Non-existent fresher returns 500 error
   - [ ] Errors are logged with details

4. **Performance:**
   - [ ] PDF generates in < 5 seconds
   - [ ] Email sends in < 10 seconds
   - [ ] Server doesn't crash or hang
   - [ ] Memory usage reasonable (< 200MB increase)

---

## Next Steps After Testing

1. **If all tests pass:**
   - ✅ Mark feature as complete
   - ✅ Deploy to staging environment
   - ✅ Conduct user acceptance testing
   - ✅ Update user documentation

2. **If tests fail:**
   - 🔍 Review error logs
   - 🔍 Check troubleshooting section
   - 🔍 Verify database data
   - 🔍 Test individual components

3. **Additional enhancements (optional):**
   - Add PDF preview in frontend
   - Add "Download PDF" button in HR dashboard
   - Add PDF upload to Azure Blob Storage
   - Add PDF email history tracking

---

## Contact & Support

For issues or questions:
- Check server logs: `npm run dev` output
- Review error messages in console
- Verify database data completeness
- Test with different fresher IDs
- Check SMTP configuration

---

**Last Updated:** December 20, 2025
**Version:** 1.0
**Author:** Development Team
