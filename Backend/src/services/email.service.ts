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