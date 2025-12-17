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
   * Generate plain text welcome email content
   */
  private generateWelcomeTextEmail(
    firstName: string, 
    lastName: string, 
    username: string, 
    temporaryPassword: string
  ): string {
    return `
Hi ${firstName} ${lastName},

Welcome to the team!

Your account has been created successfully. Below are your login credentials:

Username: ${username}
Temporary Password: ${temporaryPassword}

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
   * Send IT equipment notification when new user is onboarded
   */
  async sendITEquipmentNotification({
    itMemberEmail,
    itMemberName,
    fresherName,
    fresherEmail,
    designation,
    department,
    startDate
  }: {
    itMemberEmail: string;
    itMemberName: string;
    fresherName: string;
    fresherEmail: string;
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

      const mailOptions = {
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

Best regards,
HR Department

This is an automated notification from the onboarding system.
        `.trim()
      };

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

  // TODO: Implement email template system with external files
  // TODO: Add support for email attachments (employee handbook, etc.)
  // TODO: Implement email tracking and delivery confirmation
  // TODO: Add support for multiple languages
  // TODO: Implement email queue system for high volume
  // TODO: Add email analytics and open tracking
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type { WelcomeEmailData, EmailSendResult };