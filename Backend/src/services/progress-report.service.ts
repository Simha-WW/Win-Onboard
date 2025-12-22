/**
 * Progress Report Service
 * Sends comprehensive progress reports on day 30, 60, and 90 to both users and L&D team
 */

import { getMSSQLPool } from '../config/database';
import { emailService } from './email.service';

interface ProgressReportData {
  fresher_id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department: string;
  assigned_at: Date;
  deadline: Date;
  days_since_assignment: number;
  total_modules: number;
  completed_modules: number;
  pending_modules: number;
  progress_percentage: number;
  days_remaining: number;
  learning_table: string;
}

interface LearningModule {
  learning_title: string;
  is_completed: boolean;
  completed_at: Date | null;
  duration_minutes: number;
}

export class ProgressReportService {
  /**
   * Check for users who joined exactly 30, 60, or 90 days ago and send progress reports
   * This should be called by a scheduled job daily
   */
  static async sendProgressReports(): Promise<void> {
    try {
      console.log('\n📊 Checking for 30/60/90 day progress reports...');

      const pool = getMSSQLPool();
      
      // Get users who need progress reports (30, 60, or 90 days since assignment)
      const query = `
        SELECT 
          f.id as fresher_id,
          f.first_name,
          f.last_name,
          f.email,
          f.designation,
          f.department,
          ula.assigned_at,
          ula.deadline,
          ula.learning_table,
          DATEDIFF(DAY, ula.assigned_at, GETDATE()) as days_since_assignment,
          DATEDIFF(DAY, GETDATE(), ula.deadline) as days_remaining,
          COUNT(ulp.id) as total_modules,
          SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_modules,
          SUM(CASE WHEN ulp.is_completed = 0 THEN 1 ELSE 0 END) as pending_modules,
          CASE 
            WHEN COUNT(ulp.id) > 0 THEN (SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) * 100 / COUNT(ulp.id))
            ELSE 0
          END as progress_percentage
        FROM freshers f
        INNER JOIN user_learning_assignments ula ON f.id = ula.fresher_id
        LEFT JOIN user_learning_progress ulp ON f.id = ulp.fresher_id
        WHERE 
          DATEDIFF(DAY, ula.assigned_at, GETDATE()) IN (30, 60, 90)
        GROUP BY f.id, f.first_name, f.last_name, f.email, f.designation, f.department, 
                 ula.assigned_at, ula.deadline, ula.learning_table
      `;

      const result = await pool.request().query(query);
      const users: ProgressReportData[] = result.recordset;

      if (users.length === 0) {
        console.log('ℹ️  No users due for 30/60/90 day progress reports today');
        return;
      }

      console.log(`📧 Sending progress reports to ${users.length} user(s)`);

      for (const user of users) {
        try {
          // Get detailed learning progress for this user
          const modules = await this.getUserLearningModules(user.fresher_id);
          
          // Determine which milestone (30, 60, or 90 days)
          const milestone = user.days_since_assignment;
          
          // Send email to the user
          await this.sendProgressReportEmail(user, modules, milestone, 'user');
          console.log(`✅ Sent ${milestone}-day progress report to user: ${user.email}`);
          
          // Send email to L&D team
          await this.sendProgressReportToLDTeam(user, modules, milestone);
          console.log(`✅ Sent ${milestone}-day progress report to L&D team for: ${user.first_name} ${user.last_name}`);
          
        } catch (error) {
          console.error(`❌ Failed to send progress report for ${user.email}:`, error);
        }
      }

      console.log(`✅ Progress report job completed. Sent ${users.length} reports\n`);
    } catch (error) {
      console.error('❌ Error in progress report job:', error);
      throw error;
    }
  }

  /**
   * Get detailed learning modules for a user
   */
  private static async getUserLearningModules(fresherId: number): Promise<LearningModule[]> {
    const pool = getMSSQLPool();
    const mssql = await import('mssql');

    const query = `
      SELECT 
        learning_title,
        is_completed,
        completed_at,
        duration_minutes
      FROM user_learning_progress
      WHERE fresher_id = @fresherId
      ORDER BY id
    `;

    const result = await pool.request()
      .input('fresherId', mssql.Int, fresherId)
      .query(query);

    return result.recordset;
  }

  /**
   * Send progress report email to the user
   */
  private static async sendProgressReportEmail(
    user: ProgressReportData,
    modules: LearningModule[],
    milestone: number,
    recipient: 'user' | 'ld'
  ): Promise<void> {
    const completedModulesList = modules
      .filter(m => m.is_completed)
      .map(m => `<li style="color: #059669; margin: 8px 0;">✅ ${m.learning_title}</li>`)
      .join('');

    const pendingModulesList = modules
      .filter(m => !m.is_completed)
      .map(m => `<li style="color: #dc2626; margin: 8px 0;">⏳ ${m.learning_title}</li>`)
      .join('');

    const progressBarColor = user.progress_percentage >= 75 ? '#10b981' : 
                            user.progress_percentage >= 50 ? '#f59e0b' : '#ef4444';

    const milestoneEmoji = milestone === 30 ? '📅' : milestone === 60 ? '📈' : '🎯';
    
    const emailSubject = `${milestoneEmoji} ${milestone}-Day Learning Progress Report`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; border-radius: 15px 15px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px;">${milestoneEmoji} ${milestone}-Day Progress Report</h1>
          <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Your Learning Journey Update</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 15px 15px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Dear <strong>${user.first_name} ${user.last_name}</strong>,
          </p>
          
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
            Congratulations on completing <strong>${milestone} days</strong> since your learning plan was assigned! 
            Here's a comprehensive overview of your learning progress.
          </p>
          
          <!-- Progress Summary Card -->
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 5px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 22px;">📊 Progress Summary</h2>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 36px; font-weight: bold; color: #10b981;">${user.completed_modules}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Completed</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 36px; font-weight: bold; color: #ef4444;">${user.pending_modules}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Pending</div>
              </div>
              <div style="text-align: center; flex: 1;">
                <div style="font-size: 36px; font-weight: bold; color: #3b82f6;">${user.total_modules}</div>
                <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Total</div>
              </div>
            </div>
            
            <!-- Progress Bar -->
            <div style="margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #374151; font-weight: 600;">Overall Progress</span>
                <span style="color: #374151; font-weight: bold; font-size: 18px;">${user.progress_percentage}%</span>
              </div>
              <div style="background-color: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden;">
                <div style="background-color: ${progressBarColor}; width: ${user.progress_percentage}%; height: 100%; border-radius: 10px; transition: width 0.3s ease;"></div>
              </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid #bfdbfe;">
              <div>
                <strong style="color: #1e40af;">Days Elapsed:</strong> <span style="color: #374151;">${milestone} days</span>
              </div>
              <div>
                <strong style="color: #1e40af;">Days Remaining:</strong> <span style="color: ${user.days_remaining < 7 ? '#dc2626' : '#374151'}">${user.days_remaining} days</span>
              </div>
            </div>
          </div>

          <!-- Completed Modules -->
          ${user.completed_modules > 0 ? `
          <div style="margin: 30px 0;">
            <h3 style="color: #059669; font-size: 20px; margin-bottom: 15px;">✅ Completed Modules (${user.completed_modules})</h3>
            <ul style="list-style: none; padding: 0; background-color: #f0fdf4; padding: 20px; border-radius: 10px; border-left: 4px solid #10b981;">
              ${completedModulesList}
            </ul>
          </div>
          ` : ''}

          <!-- Pending Modules -->
          ${user.pending_modules > 0 ? `
          <div style="margin: 30px 0;">
            <h3 style="color: #dc2626; font-size: 20px; margin-bottom: 15px;">⏳ Pending Modules (${user.pending_modules})</h3>
            <ul style="list-style: none; padding: 0; background-color: #fef2f2; padding: 20px; border-radius: 10px; border-left: 4px solid #ef4444;">
              ${pendingModulesList}
            </ul>
          </div>
          ` : ''}

          <!-- Motivation Message -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 5px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 10px;">
            <p style="color: #92400e; margin: 0; font-size: 15px; line-height: 1.6;">
              ${user.progress_percentage >= 75 
                ? `<strong>🎉 Excellent Progress!</strong> You're doing great! Keep up the momentum to complete your learning journey.`
                : user.progress_percentage >= 50
                ? `<strong>💪 Good Progress!</strong> You're halfway there! Stay focused and complete the remaining modules.`
                : `<strong>⚡ Time to Accelerate!</strong> You have ${user.pending_modules} modules pending. Let's pick up the pace to meet your deadline!`
              }
            </p>
          </div>
          
          <!-- CTA Buttons -->
          <div style="text-align: center; margin: 35px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/learning" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; 
                      font-weight: 600; font-size: 17px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); 
                      margin: 0 10px;">
              📖 Continue Learning
            </a>
            <a href="${process.env.FRONTEND_URL}/login" 
               style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; padding: 16px 40px; text-decoration: none; border-radius: 10px; 
                      font-weight: 600; font-size: 17px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15); 
                      margin: 0 10px;">
              🔐 Login to Portal
            </a>
          </div>
          <p style="text-align: center; margin-top: 12px; font-size: 13px; color: #6b7280;">
            Portal: <a href="${process.env.FRONTEND_URL}/login" style="color: #667eea;">${process.env.FRONTEND_URL}/login</a>
          </p>
          
          <div style="margin-top: 40px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              <strong>Need Support?</strong><br>
              If you're facing any challenges or need guidance, please reach out to the Learning & Development team.
            </p>
          </div>
          
          <p style="font-size: 15px; color: #374151; margin-top: 30px;">
            Keep learning and growing!<br>
            <strong>Learning & Development Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 5px 0;">This is an automated ${milestone}-day progress report from the WinOnboard Learning Management System.</p>
        </div>
      </div>
    `;

    await emailService.sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailBody
    });
  }

  /**
   * Send progress report to L&D team members
   */
  private static async sendProgressReportToLDTeam(
    user: ProgressReportData,
    modules: LearningModule[],
    milestone: number
  ): Promise<void> {
    try {
      // Get active L&D team members
      const { LearningDevelopmentService } = await import('./learning-development.service');
      const ldMembers = await LearningDevelopmentService.getActiveLDMembers();

      if (ldMembers.length === 0) {
        console.log('⚠️ No active L&D team members found');
        return;
      }

      const completedModulesList = modules
        .filter(m => m.is_completed)
        .map(m => `<li style="color: #059669; margin: 8px 0;">✅ ${m.learning_title}</li>`)
        .join('');

      const pendingModulesList = modules
        .filter(m => !m.is_completed)
        .map(m => `<li style="color: #dc2626; margin: 8px 0;">⏳ ${m.learning_title}</li>`)
        .join('');

      const progressBarColor = user.progress_percentage >= 75 ? '#10b981' : 
                              user.progress_percentage >= 50 ? '#f59e0b' : '#ef4444';

      const milestoneEmoji = milestone === 30 ? '📅' : milestone === 60 ? '📈' : '🎯';

      // Send to each L&D team member
      for (const ldMember of ldMembers) {
        const emailSubject = `${milestoneEmoji} ${milestone}-Day Progress Report: ${user.first_name} ${user.last_name}`;
        const loginUrl = `${process.env.FRONTEND_URL}/hr/login`;
        
        const emailBody = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
  <div style="max-width: 700px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px; border-radius: 15px 15px 0 0; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 32px;">${milestoneEmoji} ${milestone}-Day Progress Report</h1>
      <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">L&D Team Dashboard</p>
    </div>
    
    <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 15px 15px;">
      <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Dear <strong>${ldMember.first_name} ${ldMember.last_name}</strong>,</p>
      
      <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 25px;">This is the <strong>${milestone}-day progress report</strong> for <strong>${user.first_name} ${user.last_name}</strong>.</p>
      
      <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
        <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">👤 Employee Information</h3>
        <div style="color: #4b5563; line-height: 1.8;">
          <strong>Name:</strong> ${user.first_name} ${user.last_name}<br>
          <strong>Email:</strong> ${user.email}<br>
          <strong>Designation:</strong> ${user.designation || 'N/A'}<br>
          <strong>Department:</strong> ${user.department || 'N/A'}<br>
          <strong>Days Since Assignment:</strong> ${milestone} days
        </div>
      </div>

      <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 5px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 10px;">
        <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 22px;">📊 Progress Summary</h2>
        <p style="font-size: 14px; color: #4b5563;"><strong>Completed:</strong> ${user.completed_modules} | <strong>Pending:</strong> ${user.pending_modules} | <strong>Total:</strong> ${user.total_modules}</p>
        <p style="font-size: 14px; color: #4b5563;"><strong>Progress:</strong> ${user.progress_percentage}% | <strong>Days Remaining:</strong> ${user.days_remaining}</p>
      </div>

      ${user.completed_modules > 0 ? `<div style="margin: 30px 0;"><h3 style="color: #059669; font-size: 18px; margin-bottom: 15px;">✅ Completed Modules (${user.completed_modules})</h3><ul style="list-style: none; padding: 0; background-color: #f0fdf4; padding: 20px; border-radius: 10px;">${completedModulesList}</ul></div>` : ''}

      ${user.pending_modules > 0 ? `<div style="margin: 30px 0;"><h3 style="color: #dc2626; font-size: 18px; margin-bottom: 15px;">⏳ Pending Modules (${user.pending_modules})</h3><ul style="list-style: none; padding: 0; background-color: #fef2f2; padding: 20px; border-radius: 10px;">${pendingModulesList}</ul></div>` : ''}

      <div style="background: ${user.progress_percentage < 50 ? '#fef2f2' : '#f0fdf4'}; border-left: 5px solid ${user.progress_percentage < 50 ? '#ef4444' : '#10b981'}; padding: 20px; margin: 30px 0; border-radius: 10px;">
        <h3 style="color: ${user.progress_percentage < 50 ? '#991b1b' : '#065f46'}; margin: 0 0 10px 0; font-size: 16px;">📋 L&D Team Action</h3>
        <p style="color: #4b5563; margin: 0; font-size: 14px;">${user.progress_percentage < 50 ? '⚠️ Action Required: Employee progress is below expectations.' : '✅ Good Progress: Employee is on track.'}</p>
      </div>
      
      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
        <tr>
          <td align="center" style="padding: 20px; background-color: #f3f4f6; border-radius: 10px;">
            <a href="${loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">🔐 Access Admin Portal</a>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #6b7280;">Or visit: <a href="${loginUrl}" style="color: #4f46e5;">${loginUrl}</a></p>
          </td>
        </tr>
      </table>
      
      <p style="font-size: 15px; color: #374151; margin-top: 30px;">Best regards,<br><strong>WinOnboard Learning Management System</strong></p>
    </div>
    
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 5px 0;">Automated ${milestone}-day progress report for L&D team.</p>
    </div>
  </div>
</body>
</html>`;
        await emailService.sendEmail({
          to: ldMember.email,
          subject: emailSubject,
          html: emailBody
        });
      }

      console.log(`✅ Sent ${milestone}-day progress report to ${ldMembers.length} L&D team member(s)`);
    } catch (error) {
      console.error('❌ Error sending progress report to L&D team:', error);
      throw error;
    }
  }
}
