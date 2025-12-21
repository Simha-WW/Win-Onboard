/**
 * Learning & Development Service
 * Handles L&D team notifications and training assignment requests
 */

import { getMSSQLPool } from '../config/database';

interface LDUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  phone_number?: string;
  is_active: boolean;
  notification_preferences?: string;
}

interface TrainingNotificationRequest {
  fresherId: number;
  fresherName: string;
  fresherEmail: string;
  designation: string;
  department: string;
}

interface LearningItem {
  id: number;
  title: string;
  description: string;
  learning_link: string;
  duration_minutes: number;
  order_sequence?: number;
}

interface UserLearningProgress {
  id: number;
  fresher_id: number;
  learning_id: number;
  learning_table: string;
  learning_title: string;
  learning_link: string;
  is_completed: boolean;
  completed_at?: string;
  started_at?: string;
  time_spent_minutes?: number;
  notes?: string;
}

interface LDEmployee {
  fresher_id: number;
  first_name: string;
  last_name: string;
  email: string;
  designation: string;
  department: string;
  assigned_at: string;
  completed_count: number;
  total_count: number;
  progress_percentage: number;
}

export class LearningDevelopmentService {
  /**
   * Get all active L&D team members
   */
  static async getActiveLDMembers(): Promise<LDUser[]> {
    try {
      const pool = getMSSQLPool();

      const query = `
        SELECT 
          id, email, first_name, last_name, role, department, 
          phone_number, is_active, notification_preferences
        FROM learning_dept 
        WHERE is_active = 1
        ORDER BY first_name, last_name
      `;

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching L&D team members:', error);
      throw error;
    }
  }

  /**
   * Send training assignment notification to L&D team
   */
  static async sendTrainingNotification(
    requestData: TrainingNotificationRequest
  ): Promise<void> {
    try {
      console.log('📚 Sending training assignment notification to L&D team...');

      // Get active L&D team members
      const ldMembers = await this.getActiveLDMembers();

      if (ldMembers.length === 0) {
        console.log('⚠️ No active L&D team members found for notification');
        return;
      }

      const { emailService } = await import('./email.service');

      // Send email to each active L&D team member
      for (const ldMember of ldMembers) {
        // Check if they want training notifications
        let wantsNotifications = true;
        if (ldMember.notification_preferences) {
          try {
            const prefs = JSON.parse(ldMember.notification_preferences);
            wantsNotifications = prefs.training_notifications !== false && 
                                prefs.new_employee_notifications !== false;
          } catch (e) {
            // Default to true if JSON parsing fails
            wantsNotifications = true;
          }
        }

        if (wantsNotifications) {
          await emailService.sendLDTrainingNotification({
            ldMemberEmail: ldMember.email,
            ldMemberName: `${ldMember.first_name} ${ldMember.last_name}`,
            fresherId: requestData.fresherId,
            fresherName: requestData.fresherName,
            fresherEmail: requestData.fresherEmail,
            designation: requestData.designation,
            department: requestData.department
          });

          console.log(`✅ Training notification sent to ${ldMember.email}`);
        }
      }

      console.log('📚 All L&D training notifications sent successfully');
    } catch (error) {
      console.error('❌ Error sending L&D training notifications:', error);
      throw error;
    }
  }

  /**
   * Add new L&D team member
   */
  static async addLDMember(memberData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
    phoneNumber?: string;
    notificationPreferences?: object;
  }): Promise<void> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Check if email already exists
      const existingMember = await pool.request()
        .input('email', mssql.NVarChar, memberData.email)
        .query('SELECT id FROM learning_dept WHERE email = @email');

      if (existingMember.recordset.length > 0) {
        throw new Error('L&D member with this email already exists');
      }

      // Insert new L&D member
      await pool.request()
        .input('email', mssql.NVarChar, memberData.email)
        .input('password', mssql.NVarChar, memberData.password)
        .input('firstName', mssql.NVarChar, memberData.firstName)
        .input('lastName', mssql.NVarChar, memberData.lastName)
        .input('role', mssql.NVarChar, memberData.role || 'L&D Coordinator')
        .input('phoneNumber', mssql.NVarChar, memberData.phoneNumber || null)
        .input('notificationPreferences', mssql.NVarChar, 
          memberData.notificationPreferences 
            ? JSON.stringify(memberData.notificationPreferences)
            : '{"training_notifications": true, "new_employee_notifications": true}'
        )
        .query(`
          INSERT INTO learning_dept (
            email, password, first_name, last_name, role, 
            phone_number, notification_preferences
          )
          VALUES (
            @email, @password, @firstName, @lastName, @role,
            @phoneNumber, @notificationPreferences
          )
        `);

      console.log(`✅ Added L&D member: ${memberData.email}`);
    } catch (error) {
      console.error('❌ Error adding L&D member:', error);
      throw error;
    }
  }

  /**
   * Update L&D member notification preferences
   */
  static async updateNotificationPreferences(
    memberId: number,
    preferences: object
  ): Promise<void> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      await pool.request()
        .input('memberId', mssql.Int, memberId)
        .input('preferences', mssql.NVarChar, JSON.stringify(preferences))
        .query(`
          UPDATE learning_dept 
          SET notification_preferences = @preferences,
              updated_at = GETDATE()
          WHERE id = @memberId
        `);

      console.log(`✅ Updated L&D member ${memberId} notification preferences`);
    } catch (error) {
      console.error('❌ Error updating L&D notification preferences:', error);
      throw error;
    }
  }

  /**
   * Assign learning plan to a fresher based on their department
   */
  static async assignLearningPlan(fresherId: number, department: string): Promise<void> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      console.log(`📚 Assigning learning plan for fresher ${fresherId} in ${department} department`);

      // Determine which learning table to use based on department
      let learningTable = 'other_dept_learnings';
      if (department.toLowerCase().includes('d&a') || department.toLowerCase().includes('data')) {
        learningTable = 'da_learnings';
      } else if (department.toLowerCase().includes('app') || department.toLowerCase().includes('dev')) {
        learningTable = 'app_dev_learnings';
      } else if (department.toLowerCase().includes('hr')) {
        learningTable = 'hr_learnings';
      }

      // Check if assignment already exists
      const existingAssignment = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('SELECT id FROM user_learning_assignments WHERE fresher_id = @fresherId');

      if (existingAssignment.recordset.length > 0) {
        console.log(`⚠️ Learning plan already assigned to fresher ${fresherId}`);
        return;
      }

      // Get all learnings from the appropriate table
      const learnings: LearningItem[] = await pool.request()
        .query(`SELECT id, learning_title as title, description, learning_link, duration_minutes FROM ${learningTable} ORDER BY id`);

      if (learnings.recordset.length === 0) {
        console.log(`⚠️ No learnings found in ${learningTable}`);
        return;
      }

      const totalCount = learnings.recordset.length;

      // Calculate total duration in days (sum of duration_minutes / 60 / 24) + 2 extra days
      const totalMinutes = learnings.recordset.reduce((sum: number, learning: any) => sum + (learning.duration_minutes || 0), 0);
      const durationInDays = Math.ceil(totalMinutes / 60 / 24) + 2; // Add 2 extra days
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + durationInDays);

      console.log(`📅 Total duration: ${totalMinutes} minutes = ${Math.ceil(totalMinutes / 60 / 24)} days + 2 extra = ${durationInDays} days`);

      // Create assignment record
      await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .input('department', mssql.NVarChar, department)
        .input('learningTable', mssql.NVarChar, learningTable)
        .input('durationDays', mssql.Int, durationInDays)
        .input('deadline', mssql.DateTime, deadline)
        .query(`
          INSERT INTO user_learning_assignments (fresher_id, department, learning_table, assigned_at, duration_to_complete_days, deadline)
          VALUES (@fresherId, @department, @learningTable, GETDATE(), @durationDays, @deadline)
        `);

      // Create progress records for each learning item
      for (const learning of learnings.recordset) {
        await pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .input('learningId', mssql.Int, learning.id)
          .input('learningTable', mssql.NVarChar, learningTable)
          .input('learningTitle', mssql.NVarChar, learning.title)
          .input('learningLink', mssql.NVarChar, learning.learning_link)
          .input('durationMinutes', mssql.Int, learning.duration_minutes || 0)
          .query(`
            INSERT INTO user_learning_progress (
              fresher_id, learning_id, learning_table, learning_title, learning_link, duration_minutes
            )
            VALUES (
              @fresherId, @learningId, @learningTable, @learningTitle, @learningLink, @durationMinutes
            )
          `);
      }

      console.log(`✅ Assigned ${totalCount} learning items to fresher ${fresherId} from ${learningTable}`);

      // Send email notification to the user about learning plan assignment
      await this.sendLearningPlanAssignmentEmail(fresherId, department, totalCount);
    } catch (error) {
      console.error('❌ Error assigning learning plan:', error);
      throw error;
    }
  }

  /**
   * Send email notification to user about learning plan assignment
   */
  static async sendLearningPlanAssignmentEmail(
    fresherId: number,
    department: string,
    learningCount: number
  ): Promise<void> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Get user details
      const userResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT first_name, last_name, email, designation
          FROM freshers
          WHERE id = @fresherId
        `);

      if (userResult.recordset.length === 0) {
        console.log('⚠️ User not found for learning plan email');
        return;
      }

      const user = userResult.recordset[0];
      const { emailService } = await import('./email.service');

      const emailSubject = '🎓 Your Learning Plan is Ready!';
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Learning Plan Assigned!</h1>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
              Dear <strong>${user.first_name} ${user.last_name}</strong>,
            </p>
            
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Congratulations on joining our team as a <strong>${user.designation}</strong>! 
              We're excited to support your learning journey.
            </p>
            
            <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 5px;">
              <h3 style="color: #1e40af; margin: 0 0 10px 0; font-size: 18px;">📚 Your Learning Plan</h3>
              <p style="color: #1e3a8a; margin: 5px 0; font-size: 15px;">
                <strong>Department:</strong> ${department}
              </p>
              <p style="color: #1e3a8a; margin: 5px 0; font-size: 15px;">
                <strong>Total Learning Modules:</strong> ${learningCount}
              </p>
            </div>
            
            <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Your personalized learning plan has been assigned based on your department. 
              These modules are designed to help you get up to speed and excel in your role.
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 5px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                <strong>⏰ Important:</strong> Your progress will be tracked by the Learning & Development team. 
                Please complete the assigned modules to ensure a smooth onboarding experience.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard/learning" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; 
                        font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                📖 View My Learning Plan
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">
                <strong>Need Help?</strong><br>
                If you have any questions about your learning plan, please reach out to the 
                Learning & Development team.
              </p>
            </div>
            
            <p style="font-size: 15px; color: #374151; margin-top: 25px;">
              Best regards,<br>
              <strong>Learning & Development Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 5px 0;">This is an automated message from the WinOnboard Learning Management System.</p>
          </div>
        </div>
      `;

      await emailService.sendEmail(
        user.email,
        emailSubject,
        emailBody
      );

      console.log(`✅ Learning plan assignment email sent to ${user.email}`);
    } catch (error) {
      console.error('❌ Error sending learning plan assignment email:', error);
      // Don't throw - email failure shouldn't stop the learning plan assignment
    }
  }

  /**
   * Get all employees with their learning progress
   */
  static async getAllLDEmployees(): Promise<LDEmployee[]> {
    try {
      const pool = getMSSQLPool();

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
          ula.duration_to_complete_days,
          CASE 
            WHEN ula.deadline IS NOT NULL THEN DATEDIFF(DAY, GETDATE(), ula.deadline)
            ELSE NULL
          END as days_remaining,
          COUNT(ulp.id) as total_count,
          SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_count,
          CASE 
            WHEN COUNT(ulp.id) > 0 THEN (SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) * 100 / COUNT(ulp.id))
            ELSE 0
          END as progress_percentage
        FROM freshers f
        INNER JOIN user_learning_assignments ula ON f.id = ula.fresher_id
        LEFT JOIN user_learning_progress ulp ON f.id = ulp.fresher_id
        GROUP BY f.id, f.first_name, f.last_name, f.email, f.designation, f.department, ula.assigned_at, ula.deadline, ula.duration_to_complete_days
        ORDER BY ula.assigned_at DESC
      `;

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching L&D employees:', error);
      throw error;
    }
  }

  /**
   * Get learning progress for a specific user
   */
  static async getUserLearningProgress(fresherId: number): Promise<{
    employee: any;
    learnings: UserLearningProgress[];
    stats: any;
  }> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Get employee details
      const employeeResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT 
            f.id as fresher_id,
            f.first_name,
            f.last_name,
            f.email,
            f.designation,
            f.department,
            ula.assigned_at,
            ula.deadline,
            ula.duration_to_complete_days,
            CASE 
              WHEN ula.deadline IS NOT NULL THEN DATEDIFF(DAY, GETDATE(), ula.deadline)
              ELSE NULL
            END as days_remaining,
            COUNT(ulp.id) as total_count,
            SUM(CASE WHEN ulp.is_completed = 1 THEN 1 ELSE 0 END) as completed_count
          FROM freshers f
          INNER JOIN user_learning_assignments ula ON f.id = ula.fresher_id
          LEFT JOIN user_learning_progress ulp ON f.id = ulp.fresher_id
          WHERE f.id = @fresherId
          GROUP BY f.id, f.first_name, f.last_name, f.email, f.designation, f.department, ula.assigned_at, ula.deadline, ula.duration_to_complete_days
        `);

      if (employeeResult.recordset.length === 0) {
        throw new Error('Employee not found in learning system');
      }

      const employee = employeeResult.recordset[0];

      // Get learning progress
      const progressResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT *
          FROM user_learning_progress
          WHERE fresher_id = @fresherId
          ORDER BY id
        `);

      const learnings = progressResult.recordset;

      // Calculate stats
      const completedCount = learnings.filter((l: any) => l.is_completed).length;
      const totalCount = learnings.length;

      const stats = {
        completed_count: completedCount,
        total_count: totalCount,
        progress_percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
      };

      return { employee, learnings, stats };
    } catch (error) {
      console.error('Error fetching user learning progress:', error);
      throw error;
    }
  }

  /**
   * Update learning progress (mark as started, completed, etc.)
   */
  static async updateLearningProgress(
    fresherId: number,
    learningProgressId: number,
    updates: {
      isCompleted?: boolean;
      progressPercentage?: number;
      notes?: string;
    }
  ): Promise<void> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const request = pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .input('progressId', mssql.Int, learningProgressId);

      let setClause = [];

      if (updates.isCompleted !== undefined) {
        request.input('isCompleted', mssql.Bit, updates.isCompleted);
        setClause.push('is_completed = @isCompleted');
        
        if (updates.isCompleted) {
          setClause.push('completed_at = GETDATE()');
        }
      }

      if (updates.notes !== undefined) {
        request.input('notes', mssql.NVarChar, updates.notes);
        setClause.push('notes = @notes');
      }

      if (setClause.length === 0) {
        return;
      }

      await request.query(`
        UPDATE user_learning_progress
        SET ${setClause.join(', ')}
        WHERE id = @progressId AND fresher_id = @fresherId
      `);

      console.log(`✅ Updated learning progress for fresher ${fresherId}`);
    } catch (error) {
      console.error('❌ Error updating learning progress:', error);
      throw error;
    }
  }

  /**
   * Add a new custom learning resource for a specific user
   */
  static async addCustomLearningResource(
    fresherId: number,
    resource: {
      learning_title: string;
      description?: string;
      learning_link: string;
      duration_minutes?: number;
    }
  ): Promise<void> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Get user's learning table and current deadline
      const userResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT learning_table, duration_to_complete_days, deadline
          FROM user_learning_assignments
          WHERE fresher_id = @fresherId
        `);

      if (userResult.recordset.length === 0) {
        throw new Error('User learning assignment not found');
      }

      const { learning_table, duration_to_complete_days, deadline } = userResult.recordset[0];

      // Get the next available learning_id (max + 1) for this user
      const maxIdResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .input('learningTable', mssql.NVarChar, learning_table)
        .query(`
          SELECT ISNULL(MAX(learning_id), 0) + 1 as next_id
          FROM user_learning_progress
          WHERE fresher_id = @fresherId AND learning_table = @learningTable
        `);

      const newLearningId = maxIdResult.recordset[0].next_id;
      const durationMinutes = resource.duration_minutes || 0;

      // Insert ONLY into user_learning_progress (NOT into department learning tables)
      await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .input('learningId', mssql.Int, newLearningId)
        .input('learningTable', mssql.NVarChar, learning_table)
        .input('learningTitle', mssql.NVarChar, resource.learning_title)
        .input('learningLink', mssql.VarChar, resource.learning_link)
        .input('durationMinutes', mssql.Int, durationMinutes)
        .query(`
          INSERT INTO user_learning_progress (
            fresher_id, learning_id, learning_table, learning_title, learning_link, duration_minutes
          )
          VALUES (
            @fresherId, @learningId, @learningTable, @learningTitle, @learningLink, @durationMinutes
          )
        `);

      // Update duration_to_complete_days and deadline if duration_minutes provided
      if (durationMinutes > 0) {
        const additionalDays = Math.ceil(durationMinutes / 60); // Each hour = 1 day
        const newDurationDays = (duration_to_complete_days || 0) + additionalDays;
        
        // Extend deadline from current deadline (not from today)
        let newDeadline = deadline ? new Date(deadline) : new Date();
        newDeadline.setDate(newDeadline.getDate() + additionalDays);

        console.log(`📅 Updating deadline for fresher ${fresherId}:`);
        console.log(`   Duration minutes: ${durationMinutes}`);
        console.log(`   Additional days: ${additionalDays}`);
        console.log(`   Old duration: ${duration_to_complete_days} days`);
        console.log(`   New duration: ${newDurationDays} days`);
        console.log(`   Old deadline: ${deadline}`);
        console.log(`   New deadline: ${newDeadline}`);

        await pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .input('durationDays', mssql.Int, newDurationDays)
          .input('deadline', mssql.DateTime, newDeadline)
          .query(`
            UPDATE user_learning_assignments
            SET duration_to_complete_days = @durationDays,
                deadline = @deadline
            WHERE fresher_id = @fresherId
          `);

        console.log(`📅 Extended deadline by ${additionalDays} days. New total: ${newDurationDays} days`);
      }

      console.log(`✅ Added custom learning resource "${resource.learning_title}" for fresher ${fresherId}`);
    } catch (error) {
      console.error('❌ Error adding custom learning resource:', error);
      throw error;
    }
  }
}
