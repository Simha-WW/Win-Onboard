/**
 * Email Service
 * Handles all email sending functionality using nodemailer
 * 
 * CONFIGURATION:
 * - SMTP settings are read from environment variables
 * - Email templates are currently inline (TODO: move to template system)
 * - Supports both HTML and plain text emails
 */

import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface WelcomeEmailData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  temporaryPassword: string;
}

interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Email Service Class
 * Handles SMTP configuration and email sending
 */
class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  
  /**
   * Initialize email service with SMTP configuration
   * 
   * SECURITY: Email credentials must come from environment variables
   * Never hardcode credentials in source code
   */
  constructor() {
    this.initializeTransporter();
  }

  /**
   * Initialize the nodemailer transporter with SMTP settings
   */
  private initializeTransporter(): void {
    try {
      // SECURITY: All email configuration comes from environment variables
      console.log('DEBUG: Environment variables check:');
      console.log('SMTP_HOST:', process.env.SMTP_HOST);
      console.log('SMTP_USER:', process.env.SMTP_USER);
      console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '[SET]' : '[NOT SET]');
      
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'localhost',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || ''
        }
      };

      console.log('DEBUG: Final email config:');
      console.log('Host:', emailConfig.host);
      console.log('Port:', emailConfig.port);
      console.log('User:', emailConfig.auth.user);
      console.log('Password length:', emailConfig.auth.pass.length);

      // Validate required environment variables
      if (!emailConfig.auth.user || !emailConfig.auth.pass) {
        console.warn('Email service: SMTP credentials not configured. Email sending will fail.');
      }

      this.transporter = nodemailer.createTransport(emailConfig);

      // Verify connection configuration
      this.transporter?.verify((error, success) => {
        if (error) {
          console.error('Email service initialization failed:', error);
        } else {
          console.log('Email service initialized successfully');
        }
      });

    } catch (error) {
      console.error('Failed to initialize email service:', error);
      this.transporter = null;
    }
  }

  /**
   * Send welcome email to new fresher
   * 
   * @param {WelcomeEmailData} data - Fresher information and credentials
   * @returns {Promise<EmailSendResult>} Send result
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailSendResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service not initialized'
      };
    }

    try {
      const { firstName, lastName, email, username, temporaryPassword } = data;
      
      // Email subject
      const subject = 'Welcome to the Organization!';
      
      // Plain text version
      const textContent = this.generateWelcomeTextEmail(firstName, lastName, username, temporaryPassword);
      
      // HTML version
      const htmlContent = this.generateWelcomeHtmlEmail(firstName, lastName, username, temporaryPassword);

      // Email options
      const mailOptions = {
        from: {
          name: process.env.FROM_EMAIL_NAME || 'HR Department',
          address: process.env.FROM_EMAIL_ADDRESS || process.env.SMTP_USER || 'hr@company.com'
        },
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent
      };

      // Send email
      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Welcome email sent successfully:', {
        messageId: info.messageId,
        recipient: email,
        // SECURITY: Do not log sensitive information like passwords
      });

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('Failed to send welcome email:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  /**
   * Send generic email
   * 
   * @param options - Email options (to, subject, html, text)
   * @returns {Promise<EmailSendResult>} Send result
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }): Promise<EmailSendResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service not initialized'
      };
    }

    try {
      const mailOptions = {
        from: {
          name: process.env.FROM_EMAIL_NAME || 'HR Department',
          address: process.env.FROM_EMAIL_ADDRESS || process.env.SMTP_USER || 'hr@company.com'
        },
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('Email sent successfully:', {
        messageId: info.messageId,
        recipient: options.to
      });

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('Failed to send email:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  /**
   * Generate plain text welcome email content
   */
  private generateWelcomeTextEmail(
    firstName: string, 
    lastName: string, 
    username: string, 
    temporaryPassword: string
  ): string {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    return `
Hi ${firstName} ${lastName},

Welcome to the team!

Your account has been created successfully. Below are your login credentials:

Username: ${username}
Temporary Password: ${temporaryPassword}

LOGIN TO YOUR ACCOUNT:
Visit: ${loginUrl}

IMPORTANT SECURITY INSTRUCTIONS:
1. Please log in to the system as soon as possible
2. You will be required to change your password on first login
3. Choose a strong, unique password for your account
4. Never share your login credentials with anyone

If you have any questions or need assistance, please contact the HR department.

Best regards,
HR Department

---
This is an automated message. Please do not reply to this email.
    `.trim();
  }

  /**
   * Generate HTML welcome email content
   */
  private generateWelcomeHtmlEmail(
    firstName: string, 
    lastName: string, 
    username: string, 
    temporaryPassword: string
  ): string {
    const loginUrl = `${process.env.FRONTEND_URL}/login`;
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Organization</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #374151; }
        .credential-value { font-family: monospace; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px; }
        .btn-login { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; margin: 20px 0; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .btn-login:hover { background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); }
        .login-section { text-align: center; margin: 25px 0; padding: 20px; background-color: #eff6ff; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to the Organization!</h1>
    </div>
    
    <div class="content">
        <h2>Hi ${firstName} ${lastName},</h2>
        
        <p>We're excited to welcome you to our team! Your account has been created successfully and you're all set to get started.</p>
        
        <div class="credentials">
            <h3>Your Login Credentials</h3>
            <div class="credential-item">
                <span class="credential-label">Username:</span>
                <span class="credential-value">${username}</span>
            </div>
            <div class="credential-item">
                <span class="credential-label">Temporary Password:</span>
                <span class="credential-value">${temporaryPassword}</span>
            </div>
        </div>
        
        <div class="login-section">
            <h3 style="color: #1e40af; margin-bottom: 15px;">🚀 Ready to Get Started?</h3>
            <p style="margin-bottom: 20px; color: #4b5563;">Click the button below to access your account</p>
            <a href="${loginUrl}" class="btn-login">Login to Your Account</a>
            <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">Or copy this link: <a href="${loginUrl}" style="color: #2563eb;">${loginUrl}</a></p>
        </div>
        
        <div class="warning">
            <h4>🔒 Important Security Instructions</h4>
            <ol>
                <li>Please log in to the system as soon as possible</li>
                <li>You will be <strong>required to change your password</strong> on first login</li>
                <li>Choose a strong, unique password for your account</li>
                <li>Never share your login credentials with anyone</li>
            </ol>
        </div>
        
        <p>If you have any questions or need assistance getting started, please don't hesitate to contact the HR department.</p>
        
        <p>We look forward to working with you!</p>
        
        <p><strong>Best regards,</strong><br>HR Department</p>
    </div>
    
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send IT equipment notification when new user is onboarded with BGV PDF attachment
   */
  async sendITEquipmentNotification({
    itMemberEmail,
    itMemberName,
    fresherName,
    fresherEmail,
    fresherId,
    designation,
    department,
    startDate
  }: {
    itMemberEmail: string;
    itMemberName: string;
    fresherName: string;
    fresherEmail: string;
    fresherId?: number;
    designation: string;
    department: string;
    startDate: string;
  }): Promise<EmailSendResult> {
    try {
      const instance = new EmailService();
      
      if (!instance.transporter) {
        return {
          success: false,
          error: 'Email service not initialized'
        };
      }

      const subject = `🖥️ Equipment Setup Required - New Employee: ${fresherName}`;
      
      const htmlContent = instance.generateITNotificationHTML({
        itMemberName,
        fresherName,
        fresherEmail,
        designation,
        department,
        startDate
      });

      const mailOptions: any = {
        from: `"HR Department" <${process.env.SMTP_USER}>`,
        to: itMemberEmail,
        subject: subject,
        html: htmlContent,
        text: `
Equipment Setup Required

Dear ${itMemberName},

A new employee has been added to our onboarding system and will be joining soon. Please prepare the following equipment:

Employee Details:
- Name: ${fresherName}
- Email: ${fresherEmail}
- Designation: ${designation}
- Department: ${department}
- Expected Start Date: ${startDate}

Equipment Required:
✓ Laptop (configured with necessary software)
✓ Mouse
✓ Headphones
✓ Any department-specific equipment

Please ensure all equipment is ready and configured before their start date.

Please refer to the attached BGV form for complete employee information.

ADMIN PORTAL ACCESS:
Visit: ${process.env.FRONTEND_URL}/hr/login

Best regards,
HR Department

This is an automated notification from the onboarding system.
        `.trim()
      };

      // Generate and attach BGV PDF if fresherId is provided
      if (fresherId) {
        try {
          console.log(`📄 Generating BGV PDF attachment for fresher ${fresherId}...`);
          const { BGVPdfService } = await import('./bgv-pdf.service');
          const pdfBuffer = await BGVPdfService.generateBGVPDF(fresherId);
          
          mailOptions.attachments = [
            {
              filename: `BGV_Form_${fresherName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ];
          console.log(`✅ BGV PDF attachment added to IT notification email`);
        } catch (pdfError) {
          console.error('⚠️ Failed to generate BGV PDF attachment:', pdfError);
          // Continue sending email without PDF attachment
        }
      }

      const info = await instance.transporter.sendMail(mailOptions);
      
      console.log(`✅ IT notification email sent to: ${itMemberEmail}`);
      console.log(`📧 Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('❌ Failed to send IT equipment notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate HTML content for IT equipment notification
   */
  private generateITNotificationHTML({
    itMemberName,
    fresherName,
    fresherEmail,
    designation,
    department,
    startDate
  }: {
    itMemberName: string;
    fresherName: string;
    fresherEmail: string;
    designation: string;
    department: string;
    startDate: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Equipment Setup Required</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff;
        }
        .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .employee-details {
            background-color: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 20px;
            margin: 20px 0;
        }
        .employee-details h3 {
            color: #007bff;
            margin-top: 0;
        }
        .detail-row {
            margin: 10px 0;
        }
        .detail-label {
            font-weight: bold;
            color: #495057;
        }
        .equipment-list {
            background-color: #e8f4f8;
            border-left: 4px solid #28a745;
            padding: 20px;
            margin: 20px 0;
        }
        .equipment-list h3 {
            color: #28a745;
            margin-top: 0;
        }
        .equipment-item {
            padding: 8px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .equipment-item:last-child {
            border-bottom: none;
        }
        .equipment-item::before {
            content: "✓ ";
            color: #28a745;
            font-weight: bold;
        }
        .action-required {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .action-required h4 {
            color: #856404;
            margin-top: 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 14px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🖥️ Equipment Setup Required</h1>
            <p>New Employee Onboarding Notification</p>
        </div>
        
        <div class="greeting">
            <p>Dear ${itMemberName},</p>
        </div>
        
        <p>A new employee has been successfully added to our onboarding system and will be joining our team soon. Please prepare the necessary equipment and workspace setup.</p>
        
        <div class="employee-details">
            <h3>📋 Employee Details</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span> ${fresherName}
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span> ${fresherEmail}
            </div>
            <div class="detail-row">
                <span class="detail-label">Designation:</span> ${designation}
            </div>
            <div class="detail-row">
                <span class="detail-label">Department:</span> ${department}
            </div>
            <div class="detail-row">
                <span class="detail-label">Expected Start Date:</span> ${startDate}
            </div>
        </div>
        
        <div class="equipment-list">
            <h3>🛠️ Equipment Required</h3>
            <div class="equipment-item">Laptop (configured with necessary software and domain access)</div>
            <div class="equipment-item">Mouse (wired or wireless)</div>
            <div class="equipment-item">Headphones (for meetings and calls)</div>
            <div class="equipment-item">Monitor (if required for the role)</div>
            <div class="equipment-item">Keyboard (if preferred setup)</div>
            <div class="equipment-item">Any department-specific software or access credentials</div>
        </div>
        
        <div class="action-required">
            <h4>⏰ Action Required</h4>
            <p>Please ensure all equipment is ready, tested, and properly configured before the employee's start date. This includes:</p>
            <ul>
                <li>Operating system updates and necessary software installations</li>
                <li>Domain/network access configuration</li>
                <li>Email account setup verification</li>
                <li>VPN access if applicable</li>
                <li>Department-specific application access</li>
            </ul>
        </div>
        
        <p>If you need any additional information about the new employee's role or specific equipment requirements, please coordinate with the HR department.</p>
        
        <p>Thank you for ensuring a smooth onboarding experience for our new team member!</p>
        
        <!-- Admin Login Link -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/hr/login" 
             style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; 
                    font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
                    transition: all 0.3s ease;">
            🔐 Access Admin Portal
          </a>
          <p style="margin-top: 12px; font-size: 13px; color: #6c757d;">
            Or visit: <a href="${process.env.FRONTEND_URL}/hr/login" style="color: #007bff;">${process.env.FRONTEND_URL}/hr/login</a>
          </p>
        </div>
        
        <p><strong>Best regards,</strong><br>HR Department</p>
    </div>
    
    <div class="footer">
        <p>This is an automated notification from the employee onboarding system.</p>
        <p>For questions or concerns, please contact the HR department.</p>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send document verification request to vendor with BGV PDF attachment
   */
  async sendVendorDocumentVerification({
    vendorEmail,
    vendorName,
    fresherName,
    fresherEmail,
    fresherId,
    designation,
    department,
    documents
  }: {
    vendorEmail: string;
    vendorName: string;
    fresherName: string;
    fresherEmail: string;
    fresherId?: number;
    designation: string;
    department: string;
    documents: {
      aadharUrl?: string;
      panCardUrl?: string;
      resumeUrl?: string;
      certificateUrl?: string;
      educationDocumentUrls?: string[];
    };
  }): Promise<EmailSendResult> {
    try {
      const instance = new EmailService();
      
      if (!instance.transporter) {
        return {
          success: false,
          error: 'Email service not initialized'
        };
      }

      const subject = `📄 Document Verification Request - ${fresherName}`;
      
      const htmlContent = instance.generateVendorVerificationHTML({
        vendorName,
        fresherName,
        fresherEmail,
        designation,
        department,
        documents
      });

      const mailOptions: any = {
        from: `"HR Department" <${process.env.SMTP_USER}>`,
        to: vendorEmail,
        subject: subject,
        html: htmlContent,
        text: `
Document Verification Request

Dear ${vendorName},

We request your services to verify the authenticity and originality of documents submitted by one of our new employees.

Employee Details:
- Name: ${fresherName}
- Email: ${fresherEmail}
- Designation: ${designation}
- Department: ${department}

Documents for Verification:
${documents.aadharUrl ? '✓ Aadhar Card' : ''}
${documents.panCardUrl ? '✓ PAN Card' : ''}
${documents.resumeUrl ? '✓ Resume' : ''}
${documents.certificateUrl ? '✓ Certificate' : ''}
${documents.educationDocumentUrls && documents.educationDocumentUrls.length > 0 ? `✓ Education Documents (${documents.educationDocumentUrls.length})` : ''}

Please access the documents using the links provided in the HTML version of this email and verify their originality. Kindly provide your verification report at your earliest convenience.

Please refer to the attached BGV form for complete employee information.

Thank you for your assistance.

Best regards,
HR Department

This is an automated notification from the onboarding system.
        `.trim()
      };

      // Generate and attach BGV PDF if fresherId is provided
      if (fresherId) {
        try {
          console.log(`📄 Generating BGV PDF attachment for fresher ${fresherId}...`);
          const { BGVPdfService } = await import('./bgv-pdf.service');
          const pdfBuffer = await BGVPdfService.generateBGVPDF(fresherId);
          
          mailOptions.attachments = [
            {
              filename: `BGV_Form_${fresherName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf'
            }
          ];
          console.log(`✅ BGV PDF attachment added to email`);
        } catch (pdfError) {
          console.error('⚠️ Failed to generate BGV PDF attachment:', pdfError);
          // Continue sending email without PDF attachment
        }
      }

      const info = await instance.transporter.sendMail(mailOptions);
      
      console.log(`✅ Vendor verification email sent to: ${vendorEmail}`);
      console.log(`📧 Message ID: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('❌ Failed to send vendor verification email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate HTML content for vendor document verification request
   */
  private generateVendorVerificationHTML({
    vendorName,
    fresherName,
    fresherEmail,
    designation,
    department,
    documents
  }: {
    vendorName: string;
    fresherName: string;
    fresherEmail: string;
    designation: string;
    department: string;
    documents: {
      aadharUrl?: string;
      panCardUrl?: string;
      resumeUrl?: string;
      certificateUrl?: string;
      educationDocumentUrls?: string[];
    };
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document Verification Request</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .container {
            background-color: #ffffff;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #6f42c1;
        }
        .header h1 {
            color: #6f42c1;
            margin: 0;
            font-size: 28px;
        }
        .greeting {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .employee-details {
            background-color: #f8f9fa;
            border-left: 4px solid #6f42c1;
            padding: 20px;
            margin: 20px 0;
        }
        .employee-details h3 {
            color: #6f42c1;
            margin-top: 0;
        }
        .detail-row {
            margin: 10px 0;
        }
        .detail-label {
            font-weight: bold;
            color: #495057;
        }
        .documents-section {
            background-color: #e8f4f8;
            border-left: 4px solid #0d6efd;
            padding: 20px;
            margin: 20px 0;
        }
        .documents-section h3 {
            color: #0d6efd;
            margin-top: 0;
        }
        .document-item {
            padding: 12px;
            margin: 10px 0;
            background-color: white;
            border-radius: 5px;
            border: 1px solid #dee2e6;
        }
        .document-item a {
            color: #0d6efd;
            text-decoration: none;
            font-weight: 500;
        }
        .document-item a:hover {
            text-decoration: underline;
        }
        .document-label {
            font-weight: bold;
            color: #495057;
            display: block;
            margin-bottom: 5px;
        }
        .verification-request {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 5px;
            padding: 15px;
            margin: 20px 0;
        }
        .verification-request h4 {
            color: #856404;
            margin-top: 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            font-size: 14px;
            color: #6c757d;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 Document Verification Request</h1>
            <p>Employee Background Verification</p>
        </div>
        
        <div class="greeting">
            <p>Dear ${vendorName},</p>
        </div>
        
        <p>We request your professional services to verify the authenticity and originality of documents submitted by one of our new employees as part of our background verification process.</p>
        
        <div class="employee-details">
            <h3>👤 Employee Information</h3>
            <div class="detail-row">
                <span class="detail-label">Name:</span> ${fresherName}
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span> ${fresherEmail}
            </div>
            <div class="detail-row">
                <span class="detail-label">Designation:</span> ${designation}
            </div>
            <div class="detail-row">
                <span class="detail-label">Department:</span> ${department}
            </div>
        </div>
        
        <div class="documents-section">
            <h3>📋 Documents for Verification</h3>
            <p>Please verify the following documents for authenticity:</p>
            
            ${documents.aadharUrl ? `
            <div class="document-item">
                <span class="document-label">🆔 Aadhar Card</span>
                <a href="${documents.aadharUrl}" target="_blank">View Aadhar Document →</a>
            </div>
            ` : ''}
            
            ${documents.panCardUrl ? `
            <div class="document-item">
                <span class="document-label">💳 PAN Card</span>
                <a href="${documents.panCardUrl}" target="_blank">View PAN Card →</a>
            </div>
            ` : ''}
            
            ${documents.resumeUrl ? `
            <div class="document-item">
                <span class="document-label">📝 Resume</span>
                <a href="${documents.resumeUrl}" target="_blank">View Resume →</a>
            </div>
            ` : ''}
            
            ${documents.certificateUrl ? `
            <div class="document-item">
                <span class="document-label">🎓 Certificate</span>
                <a href="${documents.certificateUrl}" target="_blank">View Certificate →</a>
            </div>
            ` : ''}
            
            ${documents.educationDocumentUrls && documents.educationDocumentUrls.length > 0 ? 
              documents.educationDocumentUrls.map((url, index) => `
            <div class="document-item">
                <span class="document-label">📚 Education Document ${index + 1}</span>
                <a href="${url}" target="_blank">View Education Document ${index + 1} →</a>
            </div>
              `).join('') : ''}
        </div>
        
        <div class="verification-request">
            <h4>⏰ Verification Required</h4>
            <p>Please verify the following aspects of the submitted documents:</p>
            <ul>
                <li>Authenticity and originality of the documents</li>
                <li>Validation of information against government/institution databases</li>
                <li>Detection of any tampering or forgery</li>
                <li>Confirmation of issuing authority</li>
            </ul>
            <p><strong>Please provide your verification report at your earliest convenience.</strong></p>
        </div>
        
        <p>If you require any additional information or have questions regarding this verification request, please feel free to contact our HR department.</p>
        
        <p>Thank you for your prompt attention to this matter.</p>
        
        <p><strong>Best regards,</strong><br>HR Department</p>
    </div>
    
    <div class="footer">
        <p>This is an automated notification from the employee onboarding system.</p>
        <p>For questions or concerns, please contact the HR department.</p>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send training assignment notification to L&D team
   */
  async sendLDTrainingNotification({
    ldMemberEmail,
    ldMemberName,
    fresherId,
    fresherName,
    fresherEmail,
    designation,
    department
  }: {
    ldMemberEmail: string;
    ldMemberName: string;
    fresherId: number;
    fresherName: string;
    fresherEmail: string;
    designation: string;
    department: string;
  }): Promise<EmailSendResult> {
    try {
      const instance = new EmailService();

      if (!instance.transporter) {
        return {
          success: false,
          error: 'Email service not initialized'
        };
      }

      const subject = `📚 Training Assignment Required - New Employee: ${fresherName}`;

      const htmlContent = instance.generateLDTrainingNotificationHTML({
        ldMemberName,
        fresherId,
        fresherName,
        fresherEmail,
        designation,
        department
      });

      const mailOptions: any = {
        from: `"HR Department" <${process.env.SMTP_USER}>`,
        to: ldMemberEmail,
        subject: subject,
        html: htmlContent,
        text: `
Training Assignment Required

Dear ${ldMemberName},

A new employee has joined our organization and requires mandatory training assignments.

Employee Details:
- ID: ${fresherId}
- Name: ${fresherName}
- Email: ${fresherEmail}
- Designation: ${designation}
- Department: ${department}

ACTION REQUIRED:
Please create and assign mandatory trainings for this employee as per company policy and their role requirements.

Please refer to the attached BGV form for complete employee information to help customize the training plan.

ADMIN PORTAL ACCESS:
Visit: ${process.env.FRONTEND_URL}/hr/login

Best regards,
HR Department

This is an automated notification from the employee onboarding system.
        `.trim()
      };

      // Generate and attach BGV PDF
      try {
        console.log(`📄 Generating BGV PDF attachment for L&D notification...`);
        const { BGVPdfService } = await import('./bgv-pdf.service');
        const pdfBuffer = await BGVPdfService.generateBGVPDF(fresherId);

        mailOptions.attachments = [
          {
            filename: `BGV_Form_${fresherName.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ];
        console.log(`✅ BGV PDF attachment added to L&D notification email`);
      } catch (pdfError) {
        console.error('⚠️ Failed to generate BGV PDF attachment:', pdfError);
      }

      const info = await instance.transporter.sendMail(mailOptions);

      console.log(`✅ L&D training notification sent to: ${ldMemberEmail}`);
      console.log(`📧 Message ID: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('❌ Failed to send L&D training notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate HTML content for L&D training notification
   */
  private generateLDTrainingNotificationHTML({
    ldMemberName,
    fresherId,
    fresherName,
    fresherEmail,
    designation,
    department
  }: {
    ldMemberName: string;
    fresherId: number;
    fresherName: string;
    fresherEmail: string;
    designation: string;
    department: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Training Assignment Required</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #28a745; }
        .header h1 { color: #28a745; margin: 0; font-size: 28px; }
        .employee-details { background-color: #f8f9fa; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; }
        .action-required { background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 20px; margin: 20px 0; }
        .action-required h3 { color: #856404; margin-top: 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Training Assignment Required</h1>
            <p>New Employee Onboarding</p>
        </div>
        <p>Dear ${ldMemberName},</p>
        <p>A new employee has joined our organization and requires <strong>mandatory training assignments</strong>.</p>
        <div class="employee-details">
            <h3>Employee Information</h3>
            <p><strong>ID:</strong> ${fresherId}</p>
            <p><strong>Name:</strong> ${fresherName}</p>
            <p><strong>Email:</strong> ${fresherEmail}</p>
            <p><strong>Designation:</strong> ${designation}</p>
            <p><strong>Department:</strong> ${department}</p>
        </div>
        <div class="action-required">
            <h3>⚠️ ACTION REQUIRED</h3>
            <p><strong>Please create and assign mandatory trainings</strong> for this employee as per company policy.</p>
        </div>
        <p>The complete BGV form is attached for your reference to help customize the training plan.</p>
        <p>For any questions, please contact the HR department.</p>
        
        <!-- Admin Login Link -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/hr/login" 
             style="display: inline-block; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                    color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; 
                    font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            🔐 Access Admin Portal
          </a>
          <p style="margin-top: 12px; font-size: 13px; color: #6c757d;">
            Or visit: <a href="${process.env.FRONTEND_URL}/hr/login" style="color: #28a745;">${process.env.FRONTEND_URL}/hr/login</a>
          </p>
        </div>
        
        <div class="footer">
            <p><strong>Best regards,</strong><br>HR Department<br>WinWire Technologies</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  // TODO: Implement email template system with external files
  // TODO: Add support for email attachments (employee handbook, etc.)
  // TODO: Implement email tracking and delivery confirmation
  // TODO: Add support for multiple languages
  // TODO: Implement email queue system for high volume
  // TODO: Add email analytics and open tracking

  /**
   * Send deadline expiry notification to L&D team
   */
  async sendDeadlineExpiryToLD(
    ldEmail: string,
    ldName: string,
    fresherName: string,
    fresherEmail: string,
    department: string,
    completionPercentage: number,
    completedCount: number,
    totalCount: number,
    daysAllocated: number
  ): Promise<EmailSendResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service not initialized'
      };
    }

    try {
      const mailOptions = {
        from: `"WinWire HR" <${process.env.EMAIL_USER}>`,
        to: ldEmail,
        subject: `⏰ Learning Deadline Expired - ${fresherName}`,
        html: this.generateDeadlineExpiryLDHTML({
          ldName,
          fresherName,
          fresherEmail,
          department,
          completionPercentage,
          completedCount,
          totalCount,
          daysAllocated
        }),
        text: this.generateDeadlineExpiryLDText(
          ldName,
          fresherName,
          fresherEmail,
          department,
          completionPercentage,
          completedCount,
          totalCount,
          daysAllocated
        )
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Deadline expiry email sent to L&D: ${ldEmail}`);
      
      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('❌ Failed to send deadline expiry email to L&D:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Send deadline expiry notification to user
   */
  async sendDeadlineExpiryToUser(
    userEmail: string,
    userName: string,
    completionPercentage: number,
    completedCount: number,
    totalCount: number
  ): Promise<EmailSendResult> {
    if (!this.transporter) {
      return {
        success: false,
        error: 'Email service not initialized'
      };
    }

    try {
      const mailOptions = {
        from: `"WinWire Learning & Development" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `⏰ Your Learning Deadline Has Expired`,
        html: this.generateDeadlineExpiryUserHTML({
          userName,
          completionPercentage,
          completedCount,
          totalCount
        }),
        text: this.generateDeadlineExpiryUserText(
          userName,
          completionPercentage,
          completedCount,
          totalCount
        )
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Deadline expiry email sent to user: ${userEmail}`);
      
      return {
        success: true,
        messageId: info.messageId
      };

    } catch (error) {
      console.error('❌ Failed to send deadline expiry email to user:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate HTML for L&D deadline expiry notification
   */
  private generateDeadlineExpiryLDHTML({
    ldName,
    fresherName,
    fresherEmail,
    department,
    completionPercentage,
    completedCount,
    totalCount,
    daysAllocated
  }: {
    ldName: string;
    fresherName: string;
    fresherEmail: string;
    department: string;
    completionPercentage: number;
    completedCount: number;
    totalCount: number;
    daysAllocated: number;
  }): string {
    const statusColor = completionPercentage >= 80 ? '#28a745' : 
                       completionPercentage >= 50 ? '#ffc107' : '#dc3545';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning Deadline Expired</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #dc3545; }
        .header h1 { color: #dc3545; margin: 0; font-size: 28px; }
        .employee-details { background-color: #f8f9fa; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; }
        .progress-section { background-color: #fff; border: 2px solid ${statusColor}; border-radius: 5px; padding: 20px; margin: 20px 0; }
        .progress-bar-container { background-color: #e9ecef; border-radius: 10px; height: 30px; margin: 15px 0; overflow: hidden; }
        .progress-bar { background-color: ${statusColor}; height: 100%; width: ${completionPercentage}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; transition: width 0.3s ease; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 5px; flex: 1; margin: 0 5px; }
        .stat-value { font-size: 32px; font-weight: bold; color: ${statusColor}; }
        .stat-label { font-size: 14px; color: #6c757d; }
        .action-required { background-color: #fff3cd; border: 1px solid #ffc107; border-radius: 5px; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Learning Deadline Expired</h1>
            <p>User Progress Report</p>
        </div>
        <p>Dear ${ldName},</p>
        <p>This is to inform you that the learning deadline for the following employee has expired.</p>
        <div class="employee-details">
            <h3>Employee Information</h3>
            <p><strong>Name:</strong> ${fresherName}</p>
            <p><strong>Email:</strong> ${fresherEmail}</p>
            <p><strong>Department:</strong> ${department}</p>
            <p><strong>Time Allocated:</strong> ${daysAllocated} days</p>
        </div>
        <div class="progress-section">
            <h3>Learning Progress Summary</h3>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-value">${completionPercentage}%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${completedCount}/${totalCount}</div>
                    <div class="stat-label">Resources Completed</div>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar">${completionPercentage}%</div>
            </div>
        </div>
        <div class="action-required">
            <h3>📋 Next Steps</h3>
            <p><strong>Please review the employee's progress</strong> and take appropriate action:</p>
            <ul>
                <li>Schedule a follow-up meeting with the employee</li>
                <li>Assess any challenges or blockers they faced</li>
                <li>Decide on extension or additional support if needed</li>
                <li>Update their learning plan as necessary</li>
            </ul>
        </div>
        <p>This employee has been notified about the deadline expiry and that you will be contacting them.</p>
        
        <!-- Admin Login Link -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/hr/login" 
             style="display: inline-block; background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); 
                    color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; 
                    font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            🔐 Access Admin Portal
          </a>
          <p style="margin-top: 12px; font-size: 13px; color: #6c757d;">
            Or visit: <a href="${process.env.FRONTEND_URL}/hr/login" style="color: #dc3545;">${process.env.FRONTEND_URL}/hr/login</a>
          </p>
        </div>
        
        <div class="footer">
            <p><strong>Best regards,</strong><br>Learning & Development System<br>WinWire Technologies</p>
            <p style="font-size: 12px; color: #999;">This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text for L&D deadline expiry notification
   */
  private generateDeadlineExpiryLDText(
    ldName: string,
    fresherName: string,
    fresherEmail: string,
    department: string,
    completionPercentage: number,
    completedCount: number,
    totalCount: number,
    daysAllocated: number
  ): string {
    return `
Learning Deadline Expired - User Progress Report

Dear ${ldName},

This is to inform you that the learning deadline for the following employee has expired.

EMPLOYEE INFORMATION:
- Name: ${fresherName}
- Email: ${fresherEmail}
- Department: ${department}
- Time Allocated: ${daysAllocated} days

LEARNING PROGRESS SUMMARY:
- Completion Rate: ${completionPercentage}%
- Resources Completed: ${completedCount} out of ${totalCount}

NEXT STEPS:
Please review the employee's progress and take appropriate action:
• Schedule a follow-up meeting with the employee
• Assess any challenges or blockers they faced
• Decide on extension or additional support if needed
• Update their learning plan as necessary

This employee has been notified about the deadline expiry and that you will be contacting them.

ADMIN PORTAL ACCESS:
Visit: ${process.env.FRONTEND_URL}/hr/login

Best regards,
Learning & Development System
WinWire Technologies

---
This is an automated notification. Please do not reply to this email.
    `.trim();
  }

  /**
   * Generate HTML for user deadline expiry notification
   */
  private generateDeadlineExpiryUserHTML({
    userName,
    completionPercentage,
    completedCount,
    totalCount
  }: {
    userName: string;
    completionPercentage: number;
    completedCount: number;
    totalCount: number;
  }): string {
    const statusColor = completionPercentage >= 80 ? '#28a745' : 
                       completionPercentage >= 50 ? '#ffc107' : '#dc3545';
    const statusMessage = completionPercentage >= 80 ? 'Great progress!' :
                         completionPercentage >= 50 ? 'Keep going!' : 'Need more focus';
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Learning Deadline Expired</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background-color: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #17a2b8; }
        .header h1 { color: #17a2b8; margin: 0; font-size: 28px; }
        .progress-section { background-color: #fff; border: 2px solid ${statusColor}; border-radius: 5px; padding: 20px; margin: 20px 0; }
        .progress-bar-container { background-color: #e9ecef; border-radius: 10px; height: 30px; margin: 15px 0; overflow: hidden; }
        .progress-bar { background-color: ${statusColor}; height: 100%; width: ${completionPercentage}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; padding: 15px; background-color: #f8f9fa; border-radius: 5px; flex: 1; margin: 0 5px; }
        .stat-value { font-size: 32px; font-weight: bold; color: ${statusColor}; }
        .stat-label { font-size: 14px; color: #6c757d; }
        .info-box { background-color: #e7f3ff; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; font-size: 14px; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⏰ Your Learning Deadline Has Expired</h1>
        </div>
        <p>Dear ${userName},</p>
        <p>Your allocated time to complete the assigned learning resources has expired. Here's a summary of your progress:</p>
        <div class="progress-section">
            <h3>Your Progress - ${statusMessage}</h3>
            <div class="stats">
                <div class="stat-box">
                    <div class="stat-value">${completionPercentage}%</div>
                    <div class="stat-label">Completion Rate</div>
                </div>
                <div class="stat-box">
                    <div class="stat-value">${completedCount}/${totalCount}</div>
                    <div class="stat-label">Resources Completed</div>
                </div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar">${completionPercentage}%</div>
            </div>
        </div>
        <div class="info-box">
            <h3>📬 What Happens Next?</h3>
            <p><strong>The Learning & Development team has been notified</strong> about your progress and deadline completion.</p>
            <p>The L&D team will review your progress and get in touch with you regarding:</p>
            <ul>
                <li>Your learning experience and any challenges faced</li>
                <li>Possible deadline extension or additional support</li>
                <li>Next steps in your learning journey</li>
                <li>Updated learning plan if needed</li>
            </ul>
        </div>
        <p><strong>Important:</strong> Please continue accessing your learning resources. Your account remains active.</p>
        <p>If you have any immediate questions or concerns, please reach out to the L&D team directly.</p>
        
        <!-- Employee Login Link -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="display: inline-block; background: linear-gradient(135deg, #17a2b8 0%, #138496 100%); 
                    color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; 
                    font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            🔐 Login to Portal
          </a>
          <p style="margin-top: 12px; font-size: 13px; color: #6c757d;">
            Or visit: <a href="${process.env.FRONTEND_URL}/login" style="color: #17a2b8;">${process.env.FRONTEND_URL}/login</a>
          </p>
        </div>
        
        <div class="footer">
            <p><strong>Keep Learning,</strong><br>Learning & Development Team<br>WinWire Technologies</p>
            <p style="font-size: 12px; color: #999;">This is an automated notification. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generate plain text for user deadline expiry notification
   */
  private generateDeadlineExpiryUserText(
    userName: string,
    completionPercentage: number,
    completedCount: number,
    totalCount: number
  ): string {
    return `
Your Learning Deadline Has Expired

Dear ${userName},

Your allocated time to complete the assigned learning resources has expired. Here's a summary of your progress:

YOUR PROGRESS:
- Completion Rate: ${completionPercentage}%
- Resources Completed: ${completedCount} out of ${totalCount}

WHAT HAPPENS NEXT?

The Learning & Development team has been notified about your progress and deadline completion.

The L&D team will review your progress and get in touch with you regarding:
• Your learning experience and any challenges faced
• Possible deadline extension or additional support
• Next steps in your learning journey
• Updated learning plan if needed

IMPORTANT: Please continue accessing your learning resources. Your account remains active.

If you have any immediate questions or concerns, please reach out to the L&D team directly.

EMPLOYEE PORTAL LOGIN:
Visit: ${process.env.FRONTEND_URL}/login

Keep Learning,
Learning & Development Team
WinWire Technologies

---
This is an automated notification. Please do not reply to this email.
    `.trim();
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type { WelcomeEmailData, EmailSendResult };