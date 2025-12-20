/**
 * IT Team Service
 * Handles IT team notifications, equipment requests, and onboarding task tracking
 */

interface ITUser {
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

interface NewUserNotification {
  fresherName: string;
  fresherEmail: string;
  designation: string;
  department: string;
  startDate: string;
}

export interface ItTask {
  id: number;
  fresher_id: number;
  sent_to_it_date: Date;
  work_email_generated: boolean;
  laptop_allocated: boolean;
  software_installed: boolean;
  access_cards_issued: boolean;
  training_scheduled: boolean;
  hardware_accessories: boolean;
  vpn_setup: boolean;
  network_access_granted: boolean;
  domain_account_created: boolean;
  security_tools_configured: boolean;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  
  // Joined fresher data
  fresher_name?: string;
  email?: string;
  role?: string;
}

export interface ItTaskUpdate {
  work_email_generated?: boolean;
  laptop_allocated?: boolean;
  software_installed?: boolean;
  access_cards_issued?: boolean;
  training_scheduled?: boolean;
  hardware_accessories?: boolean;
  vpn_setup?: boolean;
  network_access_granted?: boolean;
  domain_account_created?: boolean;
  security_tools_configured?: boolean;
  notes?: string;
}

export class ITService {
  /**
   * Get all active IT team members
   */
  static async getActiveITMembers(): Promise<ITUser[]> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const query = `
        SELECT 
          id, email, first_name, last_name, role, department, 
          phone_number, is_active, notification_preferences
        FROM it_users 
        WHERE is_active = 1
        ORDER BY first_name, last_name
      `;

      const result = await pool.request().query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error fetching IT team members:', error);
      throw error;
    }
  }

  /**
   * Send equipment preparation notification to IT team
   */
  static async sendEquipmentNotification(fresherData: NewUserNotification): Promise<void> {
    try {
      console.log('📧 Sending equipment notification to IT team...');
      
      // Get active IT team members
      const itMembers = await this.getActiveITMembers();
      
      if (itMembers.length === 0) {
        console.log('⚠️ No active IT team members found for notification');
        return;
      }

      const { emailService } = await import('./email.service');
      
      // Send email to each IT team member
      for (const itMember of itMembers) {
        // Check if they want new user notifications
        let wantsNotifications = true;
        if (itMember.notification_preferences) {
          try {
            const prefs = JSON.parse(itMember.notification_preferences);
            wantsNotifications = prefs.new_user_notifications !== false;
          } catch (e) {
            // Default to true if JSON parsing fails
            wantsNotifications = true;
          }
        }

        if (wantsNotifications) {
          const { emailService } = await import('./email.service');
          await emailService.sendITEquipmentNotification({
            itMemberEmail: itMember.email,
            itMemberName: `${itMember.first_name} ${itMember.last_name}`,
            fresherName: fresherData.fresherName,
            fresherEmail: fresherData.fresherEmail,
            designation: fresherData.designation,
            department: fresherData.department,
            startDate: fresherData.startDate
          });

          console.log(`✅ Equipment notification sent to ${itMember.email}`);
        }
      }

      console.log('📧 All IT equipment notifications sent successfully');
    } catch (error) {
      console.error('❌ Error sending IT equipment notifications:', error);
      throw error;
    }
  }

  /**
   * Add new IT team member
   */
  static async addITMember(memberData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber?: string;
    notificationPreferences?: object;
  }): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const query = `
        INSERT INTO it_users (
          email, first_name, last_name, role, department, 
          phone_number, notification_preferences, is_active
        ) VALUES (
          @email, @firstName, @lastName, @role, 'IT',
          @phoneNumber, @notificationPreferences, 1
        )
      `;

      await pool.request()
        .input('email', mssql.NVarChar(255), memberData.email.toLowerCase())
        .input('firstName', mssql.NVarChar(100), memberData.firstName)
        .input('lastName', mssql.NVarChar(100), memberData.lastName)
        .input('role', mssql.NVarChar(100), memberData.role)
        .input('phoneNumber', mssql.NVarChar(20), memberData.phoneNumber || null)
        .input('notificationPreferences', mssql.NVarChar(mssql.MAX), 
                JSON.stringify(memberData.notificationPreferences || 
                  { new_user_notifications: true, equipment_requests: true }))
        .query(query);

      console.log(`✅ Added IT team member: ${memberData.email}`);
    } catch (error) {
      console.error('❌ Error adding IT team member:', error);
      throw error;
    }
  }

  /**
   * Ensure IT_users table exists and has initial data
   */
  static async ensureITUsersTable(): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Check if table exists
      const tableExistsResult = await pool.request().query(`
        SELECT COUNT(*) as count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'it_users'
      `);

      if (tableExistsResult.recordset[0].count === 0) {
        console.log('🔧 Creating it_users table...');
        
        // Create the table
        await pool.request().query(`
          CREATE TABLE dbo.it_users (
            id INT IDENTITY(1,1) PRIMARY KEY,
            email NVARCHAR(255) UNIQUE NOT NULL,
            first_name NVARCHAR(100) NOT NULL,
            last_name NVARCHAR(100) NOT NULL,
            role NVARCHAR(100) NOT NULL,
            department NVARCHAR(100) DEFAULT 'IT' NOT NULL,
            phone_number NVARCHAR(20),
            is_active BIT DEFAULT 1 NOT NULL,
            notification_preferences NVARCHAR(MAX),
            created_at DATETIME2 DEFAULT GETUTCDATE() NOT NULL,
            updated_at DATETIME2 DEFAULT GETUTCDATE() NOT NULL
          );
        `);

        // Create indexes
        await pool.request().query('CREATE INDEX IX_it_users_email ON dbo.it_users(email);');
        await pool.request().query('CREATE INDEX IX_it_users_is_active ON dbo.it_users(is_active);');

        console.log('✅ it_users table created successfully');
      }

      // Check if srivarshini929@gmail.com exists
      const userExistsResult = await pool.request()
        .input('email', mssql.NVarChar(255), 'srivarshini929@gmail.com')
        .query('SELECT COUNT(*) as count FROM it_users WHERE email = @email');

      if (userExistsResult.recordset[0].count === 0) {
        console.log('👤 Adding initial IT team member...');
        
        await pool.request().query(`
          INSERT INTO dbo.it_users (
            email, first_name, last_name, role, department, 
            notification_preferences, is_active
          ) VALUES (
            'srivarshini929@gmail.com',
            'Srivarshini',
            'IT Admin',
            'IT Administrator',
            'IT',
            '{"new_user_notifications": true, "equipment_requests": true}',
            1
          )
        `);

        console.log('✅ Initial IT team member added successfully');
      }

      // Verify the setup
      const result = await pool.request().query('SELECT * FROM dbo.it_users WHERE is_active = 1');
      console.log('📋 Active IT Team Members:');
      console.table(result.recordset);

    } catch (error) {
      console.error('❌ Error setting up it_users table:', error);
      throw error;
    }
  }

  /**
   * Send a fresher to IT for onboarding tasks
   */
  static async sendToIt(fresherId: number): Promise<ItTask> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');
      
      // Check if fresher exists and get their details
      const fresherResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('SELECT id, first_name, last_name, email, designation, department FROM freshers WHERE id = @fresherId');
      
      if (fresherResult.recordset.length === 0) {
        throw new Error('Fresher not found');
      }

      const fresher = fresherResult.recordset[0];
      
      // Check if already sent to IT
      const existingTask = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('SELECT id FROM it_tasks WHERE fresher_id = @fresherId');
      
      if (existingTask.recordset.length > 0) {
        throw new Error('This fresher has already been sent to IT');
      }

      // Get documents from BGV demographics table
      const docsResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT 
            aadhaar_doc_file_url,
            pan_file_url,
            resume_file_url
          FROM bgv_demographics 
          WHERE fresher_id = @fresherId
        `);

      // Get education documents
      const eduDocsResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT document_url
          FROM educational_details 
          WHERE fresher_id = @fresherId 
          AND document_url IS NOT NULL
        `);

      const documents = docsResult.recordset[0] || {};
      const educationDocumentUrls = eduDocsResult.recordset.map(doc => doc.document_url).filter(Boolean);

      // Send email to IT team
      try {
        console.log('📧 Sending equipment notification to IT team...');
        
        // Calculate expected start date (typically next Monday or specified date)
        const startDate = new Date();
        startDate.setDate(startDate.getDate() + 7); // Assuming 1 week from now
        const formattedStartDate = startDate.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        await this.sendEquipmentNotification({
          fresherName: `${fresher.first_name} ${fresher.last_name}`,
          fresherEmail: fresher.email,
          designation: fresher.designation || 'Not specified',
          department: fresher.department || 'Not specified',
          startDate: formattedStartDate
        });

        console.log('✅ IT equipment notification sent successfully');
      } catch (itError) {
        // Log IT notification failure but don't fail the entire process
        console.error('⚠️ IT notification failed (non-critical):', itError);
      }

      // Send email to vendor for document verification
      try {
        console.log('📧 Sending document verification request to vendor...');
        
        const { VendorService } = await import('./vendor.service');
        
        await VendorService.sendDocumentVerificationRequest({
          fresherName: `${fresher.first_name} ${fresher.last_name}`,
          fresherEmail: fresher.email,
          designation: fresher.designation || 'Not specified',
          department: fresher.department || 'Not specified',
          documents: {
            aadharUrl: documents.aadhaar_doc_file_url,
            panCardUrl: documents.pan_file_url,
            resumeUrl: documents.resume_file_url,
            educationDocumentUrls: educationDocumentUrls
          }
        });

        console.log('✅ Vendor document verification request sent successfully');
      } catch (vendorError) {
        // Log vendor notification failure but don't fail the entire process
        console.error('⚠️ Vendor notification failed (non-critical):', vendorError);
      }
      
      // Create IT task record
      const result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          INSERT INTO it_tasks (
            fresher_id,
            sent_to_it_date,
            work_email_generated,
            laptop_allocated,
            software_installed,
            access_cards_issued,
            training_scheduled,
            hardware_accessories,
            vpn_setup,
            network_access_granted,
            domain_account_created,
            security_tools_configured
          )
          OUTPUT INSERTED.*
          VALUES (
            @fresherId,
            GETDATE(),
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0
          )
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error sending to IT:', error);
      throw error;
    }
  }

  /**
   * Get all IT tasks with fresher details
   */
  static async getAllItTasks(): Promise<ItTask[]> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      
      const result = await pool.request().query(`
        SELECT 
          it.*,
          CONCAT(f.first_name, ' ', f.last_name) as fresher_name,
          f.email,
          f.designation as role
        FROM it_tasks it
        INNER JOIN freshers f ON it.fresher_id = f.id
        ORDER BY it.sent_to_it_date DESC
      `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error fetching IT tasks:', error);
      throw error;
    }
  }

  /**
   * Get IT task by ID
   */
  static async getItTaskById(id: number): Promise<ItTask | null> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');
      
      const result = await pool.request()
        .input('id', mssql.Int, id)
        .query(`
          SELECT 
            it.*,
            CONCAT(f.first_name, ' ', f.last_name) as fresher_name,
            f.email,
            f.designation as role
          FROM it_tasks it
          INNER JOIN freshers f ON it.fresher_id = f.id
          WHERE it.id = @id
        `);
      
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error fetching IT task by ID:', error);
      throw error;
    }
  }

  /**
   * Get IT task by fresher ID
   */
  static async getItTaskByFresherId(fresherId: number): Promise<ItTask | null> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');
      
      const result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT 
            it.*,
            CONCAT(f.first_name, ' ', f.last_name) as fresher_name,
            f.email,
            f.designation as role
          FROM it_tasks it
          INNER JOIN freshers f ON it.fresher_id = f.id
          WHERE it.fresher_id = @fresherId
        `);
      
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error fetching IT task by fresher ID:', error);
      throw error;
    }
  }

  /**
   * Update IT task status (for IT team to use)
   */
  static async updateItTask(id: number, updates: ItTaskUpdate): Promise<ItTask> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');
      
      // Build dynamic update query
      const updateFields: string[] = [];
      const request = pool.request().input('id', mssql.Int, id);
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          updateFields.push(`${key} = @${key}`);
          if (typeof value === 'boolean') {
            request.input(key, mssql.Bit, value);
          } else {
            request.input(key, mssql.NVarChar, value);
          }
        }
      });
      
      if (updateFields.length === 0) {
        throw new Error('No fields to update');
      }
      
      const result = await request.query(`
        UPDATE it_tasks 
        SET ${updateFields.join(', ')}, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
      
      if (result.recordset.length === 0) {
        throw new Error('IT task not found');
      }
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error updating IT task:', error);
      throw error;
    }
  }

  /**
   * Get task completion percentage for a fresher
   */
  static async getTaskCompletionPercentage(id: number): Promise<number> {
    const task = await this.getItTaskById(id);
    
    if (!task) {
      return 0;
    }
    
    const taskFields = [
      'work_email_generated',
      'laptop_allocated',
      'software_installed',
      'access_cards_issued',
      'training_scheduled',
      'hardware_accessories',
      'vpn_setup',
      'network_access_granted',
      'domain_account_created',
      'security_tools_configured'
    ];
    
    const completedTasks = taskFields.filter(field => task[field as keyof ItTask] === true).length;
    return Math.round((completedTasks / taskFields.length) * 100);
  }

  /**
   * Delete IT task (remove from IT progress)
   */
  static async deleteItTask(id: number): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');
      
      await pool.request()
        .input('id', mssql.Int, id)
        .query('DELETE FROM it_tasks WHERE id = @id');
    } catch (error) {
      console.error('Error deleting IT task:', error);
      throw error;
    }
  }
}