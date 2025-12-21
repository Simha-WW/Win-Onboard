/**
 * Learning Deadline Expiry Notification Service
 * Checks for expired deadlines and sends notifications to L&D team and users
 */

import sql from 'mssql';
import { getMSSQLPool } from '../config/database';
import { emailService } from './email.service';

interface UserAssignment {
  fresher_id: number;
  fresher_name: string;
  fresher_email: string;
  department: string;
  deadline: Date;
  duration_to_complete_days: number;
  completed_count: number;
  total_count: number;
}

export class DeadlineExpiryService {
  /**
   * Check for expired deadlines and send notifications
   */
  static async checkAndNotifyExpiredDeadlines(): Promise<void> {
    // Checking for expired learning deadlines
    
    try {
      const pool = getMSSQLPool();
      
      // Find users with expired deadlines who haven't been notified yet
      const result = await pool.request().query<UserAssignment>`
        SELECT 
          ula.fresher_id,
          f.first_name + ' ' + f.last_name as fresher_name,
          f.email as fresher_email,
          ula.department,
          ula.deadline,
          ula.duration_to_complete_days,
          SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_count,
          COUNT(ulp.id) as total_count
        FROM user_learning_assignments ula
        INNER JOIN freshers f ON ula.fresher_id = f.id
        LEFT JOIN user_learning_progress ulp ON ula.fresher_id = ulp.fresher_id
        WHERE 
          ula.is_active = 1
          AND ula.deadline IS NOT NULL
          AND ula.deadline < GETDATE()
          AND ula.deadline_notification_sent IS NULL
        GROUP BY 
          ula.fresher_id,
          f.first_name,
          f.last_name,
          f.email,
          ula.department,
          ula.deadline,
          ula.duration_to_complete_days
        ORDER BY ula.deadline ASC
      `;

      if (result.recordset.length === 0) {
        return;
      }

      console.log(`📧 Sending deadline expiry notifications to ${result.recordset.length} user(s)`);

      // Get L&D email (could be from env or database)
      const ldEmail = process.env.LD_EMAIL || 'ld@winwire.com';
      const ldName = process.env.LD_NAME || 'L&D Team';

      // Process each expired deadline
      for (const assignment of result.recordset) {
        try {
          // Send email to L&D team
          const ldResult = await emailService.sendDeadlineExpiryToLD(
            ldEmail,
            ldName,
            assignment.fresher_name,
            assignment.fresher_email,
            assignment.department,
            completionPercentage,
            assignment.completed_count,
            assignment.total_count,
            assignment.duration_to_complete_days
          );

          if (!ldResult.success) {
            continue; // Skip user notification if L&D notification fails
          }

          // Send email to user
          const userResult = await emailService.sendDeadlineExpiryToUser(
            assignment.fresher_email,
            assignment.fresher_name,
            completionPercentage,
            assignment.completed_count,
            assignment.total_count
          );

          if (!userResult.success) {
            continue;
          }

          // Update notification sent timestamp
          await pool.request()
            .input('fresherId', sql.Int, assignment.fresher_id)
            .query`
              UPDATE user_learning_assignments
              SET deadline_notification_sent = GETDATE()
              WHERE fresher_id = @fresherId
            `;

        } catch (error) {
          console.error(`  ❌ Error processing notifications for ${assignment.fresher_name}:`, error);
        }
      }

      } catch (error) {
      console.error('❌ Error checking expired deadlines:', error);
      throw error;
    }
  }

  /**
   * Get summary of users with expired deadlines
   */
  static async getExpiredDeadlinesSummary(): Promise<any[]> {
    try {
      const pool = getMSSQLPool();
      
      const result = await pool.request().query`
        SELECT 
          f.id,
          f.first_name + ' ' + f.last_name as name,
          f.email,
          ula.department,
          ula.deadline,
          ula.duration_to_complete_days,
          SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_count,
          COUNT(ulp.id) as total_count,
          CASE 
            WHEN COUNT(ulp.id) > 0 
            THEN ROUND((CAST(SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(ulp.id)) * 100, 0)
            ELSE 0 
          END as completion_percentage,
          ula.deadline_notification_sent,
          DATEDIFF(DAY, ula.deadline, GETDATE()) as days_overdue
        FROM user_learning_assignments ula
        INNER JOIN freshers f ON ula.fresher_id = f.id
        LEFT JOIN user_learning_progress ulp ON ula.fresher_id = ulp.fresher_id
        WHERE 
          ula.is_active = 1
          AND ula.deadline IS NOT NULL
          AND ula.deadline < GETDATE()
        GROUP BY 
          f.id,
          f.first_name,
          f.last_name,
          f.email,
          ula.department,
          ula.deadline,
          ula.duration_to_complete_days,
          ula.deadline_notification_sent
        ORDER BY ula.deadline ASC
      `;

      return result.recordset;

    } catch (error) {
      console.error('❌ Error getting expired deadlines summary:', error);
      throw error;
    }
  }
}
