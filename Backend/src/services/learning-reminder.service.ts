/**
 * Learning Reminder Service
 * Sends reminder emails every 2 days to users with incomplete learning plans
 */

import { getMSSQLPool } from '../config/database';
import { emailService } from './email.service';

interface UserLearningStatus {
  fresher_id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department: string;
  assigned_at: Date;
  deadline: Date;
  days_remaining: number;
  total_count: number;
  completed_count: number;
  progress_percentage: number;
  last_reminder_sent: Date | null;
}

export class LearningReminderService {
  /**
   * Send reminder emails to users who haven't completed their learning plans
   * This should be called by a scheduled job every 2 days
   */
  static async sendReminders(): Promise<void> {
    try {
      console.log('📧 Starting learning reminder job...');

      const pool = getMSSQLPool();
      
      // Get all users with incomplete learning plans who need reminders
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
          ula.last_reminder_sent,
          DATEDIFF(DAY, GETDATE(), ula.deadline) as days_remaining,
          COUNT(ulp.id) as total_count,
          SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_count,
          CASE 
            WHEN COUNT(ulp.id) > 0 THEN (SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) * 100 / COUNT(ulp.id))
            ELSE 0
          END as progress_percentage
        FROM freshers f
        INNER JOIN user_learning_assignments ula ON f.id = ula.fresher_id
        LEFT JOIN user_learning_progress ulp ON f.id = ulp.fresher_id
        WHERE 
          ula.deadline IS NOT NULL
          AND ula.deadline > GETDATE()
          AND (
            ula.last_reminder_sent IS NULL 
            OR DATEDIFF(DAY, ula.last_reminder_sent, GETDATE()) >= 2
          )
          AND (
            SELECT COUNT(*) 
            FROM user_learning_progress 
            WHERE fresher_id = f.id AND is_completed = 0
          ) > 0
        GROUP BY f.id, f.first_name, f.last_name, f.email, f.designation, f.department, 
                 ula.assigned_at, ula.deadline, ula.last_reminder_sent
        HAVING SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) < COUNT(ulp.id)
      `;

      const result = await pool.request().query(query);
      const users: UserLearningStatus[] = result.recordset;

      console.log(`📋 Found ${users.length} users who need reminders`);

      if (users.length === 0) {
        console.log('✅ No reminders to send');
        return;
      }

      // Send reminder to each user
      for (const user of users) {
        try {
          await this.sendReminderEmail(user);
          
          // Update last_reminder_sent timestamp
          const mssql = await import('mssql');
          await pool.request()
            .input('fresherId', mssql.Int, user.fresher_id)
            .query(`
              UPDATE user_learning_assignments
              SET last_reminder_sent = GETDATE()
              WHERE fresher_id = @fresherId
            `);

          console.log(`✅ Sent reminder to ${user.email}`);
        } catch (error) {
          console.error(`❌ Failed to send reminder to ${user.email}:`, error);
          // Continue with next user even if one fails
        }
      }

      console.log(`✅ Learning reminder job completed. Sent ${users.length} reminders`);
    } catch (error) {
      console.error('❌ Error in learning reminder job:', error);
      throw error;
    }
  }

  /**
   * Send a motivational reminder email to a specific user
   */
  private static async sendReminderEmail(user: UserLearningStatus): Promise<void> {
    const progressPercentage = user.progress_percentage;
    const remainingPercentage = 100 - progressPercentage;
    const completedCount = user.completed_count;
    const remainingCount = user.total_count - user.completed_count;

    // Generate motivational message based on progress
    let motivationalMessage = '';
    let progressIcon = '';
    let progressColor = '';

    if (progressPercentage >= 75) {
      motivationalMessage = "You're almost there! Just a little more effort to complete your learning journey! 🎯";
      progressIcon = '🌟';
      progressColor = '#10b981';
    } else if (progressPercentage >= 50) {
      motivationalMessage = "Great progress! You've crossed the halfway mark. Keep up the momentum! 💪";
      progressIcon = '🚀';
      progressColor = '#3b82f6';
    } else if (progressPercentage >= 25) {
      motivationalMessage = "You're making steady progress! Stay focused and you'll reach your goal! 📚";
      progressIcon = '⭐';
      progressColor = '#f59e0b';
    } else if (progressPercentage > 0) {
      motivationalMessage = "Every learning journey starts with a single step. Keep going! 🎓";
      progressIcon = '🌱';
      progressColor = '#8b5cf6';
    } else {
      motivationalMessage = "Time to get started! Your learning adventure awaits! 🚀";
      progressIcon = '💡';
      progressColor = '#ef4444';
    }

    // Urgency message based on days remaining
    let urgencyMessage = '';
    let urgencyColor = '#6b7280';

    if (user.days_remaining <= 0) {
      urgencyMessage = '⚠️ Your deadline has passed! Please complete your learning plan as soon as possible.';
      urgencyColor = '#ef4444';
    } else if (user.days_remaining <= 3) {
      urgencyMessage = `⚠️ Only ${user.days_remaining} day${user.days_remaining === 1 ? '' : 's'} left! Complete your learning plan urgently.`;
      urgencyColor = '#ef4444';
    } else if (user.days_remaining <= 7) {
      urgencyMessage = `⏰ ${user.days_remaining} days remaining. Time to accelerate your learning!`;
      urgencyColor = '#f59e0b';
    } else {
      urgencyMessage = `📅 You have ${user.days_remaining} days to complete your learning plan.`;
      urgencyColor = '#6b7280';
    }

    const emailSubject = `${progressIcon} Learning Progress Reminder - ${progressPercentage}% Complete`;
    
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📚 Learning Progress Update</h1>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
            Hi <strong>${user.first_name} ${user.last_name}</strong>,
          </p>
          
          <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            This is a friendly reminder about your learning plan progress.
          </p>
          
          <!-- Progress Stats -->
          <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 4px solid ${progressColor}; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 18px;">${progressIcon} Your Progress</h3>
            
            <div style="margin-bottom: 15px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #1e3a8a; font-weight: 600;">You have completed ${progressPercentage}%</span>
                <span style="color: #1e3a8a; font-weight: 600;">${completedCount}/${user.total_count} modules</span>
              </div>
              
              <!-- Progress Bar -->
              <div style="background-color: #e5e7eb; height: 24px; border-radius: 12px; overflow: hidden;">
                <div style="
                  background: ${progressColor}; 
                  width: ${progressPercentage}%; 
                  height: 100%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 12px;
                  transition: width 0.3s;
                ">
                  ${progressPercentage}%
                </div>
              </div>
            </div>
            
            <p style="color: #1e3a8a; margin: 10px 0 0 0; font-size: 14px;">
              <strong>Still ${remainingPercentage}% to go - ${remainingCount} module${remainingCount === 1 ? '' : 's'} remaining!</strong>
            </p>
          </div>
          
          <!-- Motivational Message -->
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="color: #92400e; margin: 0; font-size: 15px; font-weight: 600;">
              💪 ${motivationalMessage}
            </p>
          </div>
          
          <!-- Urgency Message -->
          <div style="background-color: #fee2e2; border-left: 4px solid ${urgencyColor}; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <p style="color: ${urgencyColor}; margin: 0; font-size: 15px; font-weight: 600;">
              ${urgencyMessage}
            </p>
          </div>
          
          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/learning" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; 
                      font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              📖 Continue Learning
            </a>
          </div>
          
          <!-- Additional Info -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-bottom: 10px;">
              <strong>📊 Quick Stats:</strong>
            </p>
            <ul style="font-size: 14px; color: #6b7280; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Department: <strong>${user.department}</strong></li>
              <li>Total Modules: <strong>${user.total_count}</strong></li>
              <li>Completed: <strong>${completedCount}</strong></li>
              <li>Remaining: <strong>${remainingCount}</strong></li>
              <li>Progress: <strong>${progressPercentage}%</strong></li>
            </ul>
          </div>
          
          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
              <strong>Need Help?</strong><br>
              If you have any questions or need support, please reach out to the 
              Learning & Development team.
            </p>
          </div>
          
          <p style="font-size: 15px; color: #374151; margin-top: 25px;">
            Best regards,<br>
            <strong>Learning & Development Team</strong>
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p style="margin: 5px 0;">You're receiving this reminder because your learning plan deadline is approaching.</p>
          <p style="margin: 5px 0;">Reminders are sent every 2 days until completion.</p>
        </div>
      </div>
    `;

    await emailService.sendEmail(user.email, emailSubject, emailBody);
  }
}
