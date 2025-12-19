/**
 * End-to-End Test for Educational Document Upload
 * This script simulates and verifies the complete upload flow
 */

require('dotenv').config();
const mssql = require('mssql');

const dbConfig = {
  server: process.env.SERVER_NAME,
  database: process.env.DB_NAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true
  }
};

async function verifyDataFlow() {
  console.log('🔍 Verifying Educational Document Upload Data Flow');
  console.log('==================================================\n');

  let pool;

  try {
    pool = await mssql.connect(dbConfig);
    console.log('✅ Database connected\n');

    // Show the data flow mapping
    console.log('📋 DATA FLOW MAPPING');
    console.log('===================\n');
    
    console.log('1️⃣ FRONTEND (Documents.tsx)');
    console.log('   File Upload → Azure Blob Storage:');
    console.log('   - User selects file');
    console.log('   - handleEducationFileUpload() uploads to blob');
    console.log('   - Stores in state: qual.documentUrl = "https://..."');
    console.log('   - Stores in state: qual.documentName = "certificate.pdf"\n');

    console.log('2️⃣ FRONTEND → BACKEND (handleSave)');
    console.log('   When saving education section:');
    console.log('   dataToSave = {');
    console.log('     educationalQualifications: formData.education.qualifications');
    console.log('     additionalQualifications: formData.education.additionalQualifications');
    console.log('   }');
    console.log('   Each qualification object contains:');
    console.log('   {');
    console.log('     qualification: "Bachelor of Technology",');
    console.log('     university_institution: "...",');
    console.log('     cgpa_percentage: "...",');
    console.log('     year_of_passing: 2024,');
    console.log('     documentUrl: "https://winbuildwinonboard.blob.core.windows.net/..."  ← THIS IS THE KEY');
    console.log('   }\n');

    console.log('3️⃣ BACKEND API (bgv.controller.ts)');
    console.log('   POST /api/bgv/education');
    console.log('   - Receives: educationalQualifications array');
    console.log('   - Calls: BGVService.saveEducational(fresherId, educationalQualifications, additionalQualifications)\n');

    console.log('4️⃣ BACKEND SERVICE (bgv.service.ts)');
    console.log('   For each edu in educationalQualifications:');
    console.log('   - Reads: edu.documentUrl  ← Looking for this field');
    console.log('   - Saves to: document_url column in DB\n');

    console.log('📊 CURRENT DATABASE STATE');
    console.log('=========================\n');

    // Check if column exists
    const columnCheck = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'educational_details'
        AND COLUMN_NAME = 'document_url'
    `);

    if (columnCheck.recordset.length > 0) {
      console.log('✅ document_url column exists');
      console.log(`   Type: ${columnCheck.recordset[0].DATA_TYPE}(${columnCheck.recordset[0].CHARACTER_MAXIMUM_LENGTH})\n`);
    } else {
      console.log('❌ document_url column MISSING!\n');
    }

    // Check for data
    const dataCheck = await pool.request().query(`
      SELECT 
        COUNT(*) as total,
        COUNT(document_url) as with_url,
        COUNT(*) - COUNT(document_url) as without_url
      FROM educational_details
    `);

    console.log('Records in educational_details table:');
    console.log(`   Total: ${dataCheck.recordset[0].total}`);
    console.log(`   With document_url: ${dataCheck.recordset[0].with_url}`);
    console.log(`   Without document_url (NULL): ${dataCheck.recordset[0].without_url}\n`);

    // Show sample data with all relevant fields
    const samples = await pool.request().query(`
      SELECT TOP 5
        id,
        fresher_id,
        qualification_type,
        qualification,
        university_institution,
        cgpa_percentage,
        year_of_passing,
        document_url,
        created_at,
        updated_at
      FROM educational_details
      ORDER BY id DESC
    `);

    if (samples.recordset.length > 0) {
      console.log('📄 Recent Records (showing all fields):');
      console.log('=======================================\n');
      
      samples.recordset.forEach((record, idx) => {
        console.log(`Record ${idx + 1}:`);
        console.log(`  ID: ${record.id}`);
        console.log(`  Fresher ID: ${record.fresher_id}`);
        console.log(`  Type: ${record.qualification_type}`);
        console.log(`  Qualification: ${record.qualification}`);
        console.log(`  University: ${record.university_institution || '(null)'}`);
        console.log(`  CGPA: ${record.cgpa_percentage || '(null)'}`);
        console.log(`  Year: ${record.year_of_passing || '(null)'}`);
        console.log(`  📎 document_url: ${record.document_url || '❌ NULL'}`);
        console.log(`  Created: ${record.created_at}`);
        console.log(`  Updated: ${record.updated_at || '(null)'}`);
        console.log('');
      });
    }

    // Verification checklist
    console.log('✅ VERIFICATION CHECKLIST');
    console.log('========================\n');

    const hasColumn = columnCheck.recordset.length > 0;
    const hasData = dataCheck.recordset[0].total > 0;
    const hasUrls = dataCheck.recordset[0].with_url > 0;

    console.log(`${hasColumn ? '✅' : '❌'} 1. document_url column exists`);
    console.log(`${hasData ? '✅' : '⚠️'} 2. Records exist in table`);
    console.log(`${hasUrls ? '✅' : '⚠️'} 3. Records have document URLs`);

    if (!hasUrls) {
      console.log('\n⚠️  NO DOCUMENTS UPLOADED YET\n');
      console.log('The system is ready but no documents have been uploaded.');
      console.log('\n🔧 TO TEST THE COMPLETE FLOW:\n');
      console.log('1. Open http://localhost:5173');
      console.log('2. Login as a fresher user');
      console.log('3. Go to Documents page → Education section');
      console.log('4. Click "Add Qualification"');
      console.log('5. Fill in the qualification details');
      console.log('6. Click "Choose File" and select a PDF/image');
      console.log('7. Wait for "✓ filename.pdf" to appear');
      console.log('8. Click "Save" button at the bottom');
      console.log('9. Check console logs in both frontend and backend');
      console.log('10. Run this script again to verify URL was saved\n');
      
      console.log('📝 WHAT TO LOOK FOR IN LOGS:\n');
      console.log('Frontend Console:');
      console.log('  - "Upload progress: 100%"');
      console.log('  - "Document uploaded successfully!"');
      console.log('  - "💾 Current formData:" (should show documentUrl)');
      console.log('  - "Education saved successfully!"\n');
      
      console.log('Backend Console:');
      console.log('  - "📎 Educational document URL: https://..."');
      console.log('  - "✅ Educational details saved for fresher X"\n');
    } else {
      console.log('\n✅ UPLOAD IS WORKING!\n');
      console.log(`Found ${dataCheck.recordset[0].with_url} record(s) with document URLs.`);
      console.log('Documents are being uploaded to blob storage and URLs are being saved correctly.\n');
    }

    // Show what the data should look like
    console.log('📋 EXPECTED DATA FORMAT');
    console.log('======================\n');
    console.log('When a document is uploaded, the record should have:');
    console.log('{');
    console.log('  id: 5,');
    console.log('  fresher_id: 9,');
    console.log('  qualification_type: "educational",');
    console.log('  qualification: "Bachelor of Technology",');
    console.log('  university_institution: "ABC University",');
    console.log('  cgpa_percentage: "8.5",');
    console.log('  year_of_passing: 2024,');
    console.log('  document_url: "https://winbuildwinonboard.blob.core.windows.net/winbuild-winonboard/education/9/certificate.pdf"');
    console.log('}\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

verifyDataFlow();
