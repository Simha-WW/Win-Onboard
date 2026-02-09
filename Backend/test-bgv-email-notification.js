/**
 * Test Script: BGV Email Notification
 * This script tests the HR email notification when a fresher submits their BGV documents
 */

const mssql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testBGVEmailNotification() {
  console.log('🧪 Testing BGV Email Notification...\n');

  try {
    // Import the email service
    const { emailService } = require('./dist/services/email.service');
    
    // Connect to database
    const pool = await mssql.connect({
      server: process.env.SERVER_NAME,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: true,
        trustServerCertificate: false
      }
    });

    console.log('✅ Connected to database');

    // Get a test fresher (preferably one with complete BGV data)
    const fresherResult = await pool.request()
      .query(`
        SELECT TOP 1 
          f.id, 
          f.first_name, 
          f.last_name, 
          f.email, 
          f.username, 
          f.designation,
          bs.submission_status,
          bs.submitted_at
        FROM freshers f
        LEFT JOIN bgv_submissions bs ON f.id = bs.fresher_id
        WHERE f.first_name IS NOT NULL 
          AND f.last_name IS NOT NULL
        ORDER BY f.id DESC
      `);

    if (!fresherResult.recordset || fresherResult.recordset.length === 0) {
      console.log('❌ No freshers found in database');
      return;
    }

    const fresher = fresherResult.recordset[0];
    console.log('\n📋 Test Fresher Details:');
    console.log(`   ID: ${fresher.id}`);
    console.log(`   Name: ${fresher.first_name} ${fresher.last_name}`);
    console.log(`   Email: ${fresher.email}`);
    console.log(`   Username: ${fresher.username}`);
    console.log(`   Designation: ${fresher.designation || 'N/A'}`);
    console.log(`   Current Status: ${fresher.submission_status || 'No submission yet'}`);

    // Prepare submission date
    const submissionDate = new Date().toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    console.log(`\n📧 Sending test email to HR: ${process.env.HR_EMAIL || 'pulipatisimha@gmail.com'}...`);

    // Send the email
    await emailService.sendEmail({
      to: process.env.HR_EMAIL || 'pulipatisimha@gmail.com',
      subject: `[TEST] New BGV Submission - ${fresher.first_name} ${fresher.last_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New BGV Submission</h1>
            <p style="color: #f3f4f6; margin: 10px 0 0 0; font-size: 14px;">🧪 TEST EMAIL</p>
          </div>
          
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ This is a test email</strong> - Testing the BGV submission notification system
              </p>
            </div>

            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              A new employee has submitted their Background Verification documents and requires your review.
            </p>
            
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #1f2937; font-size: 18px; margin-top: 0;">Employee Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Name:</td>
                  <td style="padding: 8px 0; color: #111827; font-weight: 600;">${fresher.first_name} ${fresher.last_name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Employee ID:</td>
                  <td style="padding: 8px 0; color: #111827;">${fresher.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                  <td style="padding: 8px 0; color: #111827;">${fresher.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Username:</td>
                  <td style="padding: 8px 0; color: #111827;">${fresher.username}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Designation:</td>
                  <td style="padding: 8px 0; color: #111827;">${fresher.designation || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Submission Date:</td>
                  <td style="padding: 8px 0; color: #111827;">${submissionDate}</td>
                </tr>
              </table>
            </div>

            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>📋 Submitted Sections:</strong> Demographics, Personal Details, Educational Background, Employment History, Passport & Visa, Banking & PF/NPS
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/hr/documents" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                Review Submission in HR Portal
              </a>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Please review and verify the submitted documents at your earliest convenience.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">This is an automated notification from WinOnboard HR System</p>
            <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} WinOnboard. All rights reserved.</p>
          </div>
        </div>
      `
    });

    console.log('\n✅ Test email sent successfully!');
    console.log(`\n📬 Check inbox: ${process.env.HR_EMAIL || 'pulipatisimha@gmail.com'}`);
    console.log('\n💡 The email should arrive within 1-2 minutes');
    console.log('   Subject: [TEST] New BGV Submission - ' + fresher.first_name + ' ' + fresher.last_name);

    await pool.close();
    console.log('\n✅ Test completed successfully');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the test
testBGVEmailNotification()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
