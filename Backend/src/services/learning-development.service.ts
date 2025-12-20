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
}
