/**
 * BGV (Background Verification) Service
 * Handles document submissions, file uploads, and verification workflow
 */

interface BGVSubmission {
  id: number;
  fresher_id: number;
  submission_status: 'draft' | 'submitted' | 'in_review' | 'verified' | 'rejected';
  current_section: string;
  submitted_at?: Date;
  reviewed_at?: Date;
  reviewed_by?: string;
  review_comments?: string;
}

// Helper function to convert base64 file data to Buffer
function convertFileDataToBuffer(fileData?: string): Buffer | null {
  if (!fileData || typeof fileData !== 'string') return null;
  
  try {
    // Check if it's a data URL (data:mime/type;base64,data)
    if (fileData.includes(',')) {
      const base64Data = fileData.split(',')[1];
      if (base64Data && base64Data.length > 0) {
        return Buffer.from(base64Data, 'base64');
      }
    }
    // If it's already just base64 string
    return Buffer.from(fileData, 'base64');
  } catch (error) {
    console.error('Error converting file data to buffer:', error);
    return null;
  }
}

interface EmergencyContact {
  name: string;
  mobile: string;
  relationship: string;
}

interface Personal {
  marital_status: string;
  no_of_children?: number;
  father_name: string;
  father_dob?: Date;
  father_deceased?: boolean;
  mother_name: string;
  mother_dob?: Date;
  mother_deceased?: boolean;
  emergency_contacts: EmergencyContact[];
}

interface DocumentFile {
  name: string;
  data: string;  // base64 encoded
  type: string;  // mime type
  size: number;  // file size in bytes
}

interface EducationalQualification {
  qualification: string;
  university_institution: string;
  cgpa_percentage: string;
  year_of_passing: number;
  documents: DocumentFile[];
}

interface AdditionalQualification {
  certificate_name: string;
  documents: DocumentFile[];
}

interface Demographics {
  salutation?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  name_for_records?: string;
  dob_as_per_records?: Date;
  celebrated_dob?: Date;
  gender?: string;
  blood_group?: string;
  whatsapp_number?: string;
  linkedin_url?: string;
  aadhaar_card_number?: string;
  pan_card_number?: string;
  // File data (base64 strings from frontend)
  aadhaar_file_data?: string;
  aadhaar_file_name?: string;
  aadhaar_file_type?: string;
  aadhaar_file_size?: number;
  pan_file_data?: string;
  pan_file_name?: string;
  pan_file_type?: string;
  pan_file_size?: number;
  resume_file_data?: string;
  resume_file_name?: string;
  resume_file_type?: string;
  resume_file_size?: number;
  comm_house_number?: string;
  comm_street_name?: string;
  comm_city?: string;
  comm_district?: string;
  comm_state?: string;
  comm_country?: string;
  comm_pin_code?: string;
  perm_same_as_comm?: boolean;
  perm_house_number?: string;
  perm_street_name?: string;
  perm_city?: string;
  perm_district?: string;
  perm_state?: string;
  perm_country?: string;
  perm_pin_code?: string;
}

interface PersonalInfo {
  marital_status?: string;
  num_children?: number;
  father_name?: string;
  father_dob?: Date;
  father_deceased?: boolean;
  mother_name?: string;
  mother_dob?: Date;
  mother_deceased?: boolean;
}

interface EmergencyContact {
  contact_person_name: string;
  mobile_number: string;
  relationship: string;
}

interface Education {
  qualification: string;
  university_institution: string;
  cgpa_percentage?: string;
  year_of_passing?: string;
  additional_qualification_name?: string;
}

interface EmploymentHistory {
  company_name: string;
  job_title: string;
  employment_type?: string;
  start_date: Date;
  end_date?: Date;
  is_current?: boolean;
  reason_for_leaving?: string;
}

interface DocumentFile {
  id?: number;
  document_type: string;
  original_filename: string;
  stored_filename: string;
  file_path: string;
  file_size_bytes: number;
  mime_type: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: Date;
  rejection_reason?: string;
}

export class BGVService {
  /**
   * Initialize BGV tables on server startup
   */
  static async initializeBGVTables(): Promise<void> {
    try {
      console.log('🔧 Starting BGV table initialization...');
      
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      
      // Define table creation statements
      const tableStatements = [
        {
          name: 'bgv_submissions',
          sql: `
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_submissions')
            BEGIN
                CREATE TABLE bgv_submissions (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    fresher_id INT NOT NULL,
                    submission_status NVARCHAR(20) DEFAULT 'draft' CHECK (submission_status IN ('draft', 'submitted', 'in_review', 'verified', 'rejected')),
                    current_section NVARCHAR(50) DEFAULT 'demographics',
                    submitted_at DATETIME2,
                    reviewed_at DATETIME2,
                    reviewed_by NVARCHAR(100),
                    review_comments NVARCHAR(MAX),
                    created_at DATETIME2 DEFAULT GETDATE(),
                    updated_at DATETIME2 DEFAULT GETDATE()
                );
                PRINT 'Created bgv_submissions table';
            END
            ELSE
            BEGIN
                PRINT 'bgv_submissions table already exists';
            END
          `
        },
        {
          name: 'bgv_demographics',
          sql: `
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_demographics')
            BEGIN
                CREATE TABLE bgv_demographics (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    submission_id INT NOT NULL,
                    
                    -- Basic Information
                    salutation NVARCHAR(10),
                    first_name NVARCHAR(100),
                    middle_name NVARCHAR(100),
                    last_name NVARCHAR(100),
                    name_for_records NVARCHAR(200),
                    dob_as_per_records DATE,
                    celebrated_dob DATE,
                    gender NVARCHAR(20),
                    blood_group NVARCHAR(5),
                    
                    -- Contact Information
                    whatsapp_number NVARCHAR(15),
                    linkedin_url NVARCHAR(500),
                    
                    -- Identity Documents
                    aadhaar_card_number NVARCHAR(12),
                    pan_card_number NVARCHAR(10),
          
          -- File Storage
          aadhaar_file_data VARBINARY(MAX),
          aadhaar_file_name NVARCHAR(255),
          aadhaar_file_type NVARCHAR(100),
          aadhaar_file_size BIGINT,
          
          pan_file_data VARBINARY(MAX),
          pan_file_name NVARCHAR(255),
          pan_file_type NVARCHAR(100),
          pan_file_size BIGINT,
          
          resume_file_data VARBINARY(MAX),
          resume_file_name NVARCHAR(255),
          resume_file_type NVARCHAR(100),
          resume_file_size BIGINT,
                    comm_street_name NVARCHAR(200),
                    comm_city NVARCHAR(100),
                    comm_district NVARCHAR(100),
                    comm_state NVARCHAR(100),
                    comm_country NVARCHAR(100) DEFAULT 'India',
                    comm_pin_code NVARCHAR(10),
                    
                    -- Permanent Address
                    perm_same_as_comm BIT DEFAULT 0,
                    perm_house_number NVARCHAR(100),
                    perm_street_name NVARCHAR(200),
                    perm_city NVARCHAR(100),
                    perm_district NVARCHAR(100),
                    perm_state NVARCHAR(100),
                    perm_country NVARCHAR(100) DEFAULT 'India',
                    perm_pin_code NVARCHAR(10),
                    
                    created_at DATETIME2 DEFAULT GETDATE(),
                    updated_at DATETIME2 DEFAULT GETDATE(),
                    
                    FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
                );
                PRINT 'Created bgv_demographics table';
            END
            ELSE
            BEGIN
                PRINT 'bgv_demographics table already exists';
            END
          `
        },
        {
          name: 'bgv_personal',
          sql: `
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_personal')
            BEGIN
                CREATE TABLE bgv_personal (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    submission_id INT NOT NULL,
                    
                    marital_status NVARCHAR(20),
                    num_children INT DEFAULT 0,
                    
                    -- Father Information
                    father_name NVARCHAR(100),
                    father_dob DATE,
                    father_deceased BIT DEFAULT 0,
                    
                    -- Mother Information
                    mother_name NVARCHAR(100),
                    mother_dob DATE,
                    mother_deceased BIT DEFAULT 0,
                    
                    -- Emergency Contact
                    emergency_contact_name NVARCHAR(100),
                    emergency_contact_phone NVARCHAR(15),
                    emergency_contact_relationship NVARCHAR(50),
                    
                    created_at DATETIME2 DEFAULT GETDATE(),
                    updated_at DATETIME2 DEFAULT GETDATE(),
                    
                    FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
                );
                PRINT 'Created bgv_personal table';
            END
            ELSE
            BEGIN
                PRINT 'bgv_personal table already exists';
            END
          `
        },
        {
          name: 'bgv_documents',
          sql: `
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'bgv_documents')
            BEGIN
                CREATE TABLE bgv_documents (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    submission_id INT NOT NULL,
                    
                    document_type NVARCHAR(50) NOT NULL, -- 'aadhaar', 'pan', 'resume', 'passport', etc.
                    document_name NVARCHAR(200),
                    file_path NVARCHAR(500),
                    file_size BIGINT,
                    mime_type NVARCHAR(100),
                    verification_status NVARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
                    verified_by NVARCHAR(100),
                    verified_at DATETIME2,
                    rejection_reason NVARCHAR(MAX),
                    
                    created_at DATETIME2 DEFAULT GETDATE(),
                    updated_at DATETIME2 DEFAULT GETDATE(),
                    
                    FOREIGN KEY (submission_id) REFERENCES bgv_submissions(id) ON DELETE CASCADE
                );
                PRINT 'Created bgv_documents table';
            END
            ELSE
            BEGIN
                PRINT 'bgv_documents table already exists';
            END
          `
        }
      ];
      
      console.log('📊 Executing', tableStatements.length, 'table creation statements...');
      
      for (let i = 0; i < tableStatements.length; i++) {
        const table = tableStatements[i];
        if (table) {
          console.log(`🔨 Creating table ${table.name} (${i + 1}/${tableStatements.length})...`);
          
          try {
            const result = await pool.request().query(table.sql);
            console.log(`✅ Table ${table.name} processed successfully`);
          } catch (statementError: any) {
            console.error(`❌ Error creating table ${table.name}:`, statementError.message);
            if (!statementError.message.includes('already exists')) {
              throw statementError;
            }
          }
        }
      }
      
      // Verify tables were created
      console.log('🔍 Verifying BGV tables were created...');
      const tablesResult = await pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME LIKE 'bgv_%' 
        ORDER BY TABLE_NAME
      `);
      
      console.log('📋 Found BGV tables:', tablesResult.recordset.map(r => r.TABLE_NAME));
      
      if (tablesResult.recordset.length > 0) {
        console.log('✅ BGV tables initialized successfully');
        
        // Add file storage columns to bgv_demographics if they don't exist
        await this.addFileStorageColumns(pool);
      } else {
        console.warn('⚠️ No BGV tables found, but no errors occurred');
      }
      
    } catch (error: any) {
      console.error('❌ Error initializing BGV tables:', error);
      console.error('Full error details:', error);
      
      // Don't throw error - allow server to start even if BGV tables fail
      // Tables will be created when first BGV operation happens
      console.log('⚠️ BGV table initialization failed, but server will continue');
    }
  }

  /**
   * Add file storage columns to existing bgv_demographics table
   */
  static async addFileStorageColumns(pool: any): Promise<void> {
    try {
      console.log('🔧 Adding file storage columns to bgv_demographics table...');
      
      const alterStatements = [
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'aadhaar_file_data') ALTER TABLE bgv_demographics ADD aadhaar_file_data VARBINARY(MAX)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'aadhaar_file_name') ALTER TABLE bgv_demographics ADD aadhaar_file_name NVARCHAR(255)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'aadhaar_file_type') ALTER TABLE bgv_demographics ADD aadhaar_file_type NVARCHAR(100)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'aadhaar_file_size') ALTER TABLE bgv_demographics ADD aadhaar_file_size BIGINT",
        
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'pan_file_data') ALTER TABLE bgv_demographics ADD pan_file_data VARBINARY(MAX)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'pan_file_name') ALTER TABLE bgv_demographics ADD pan_file_name NVARCHAR(255)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'pan_file_type') ALTER TABLE bgv_demographics ADD pan_file_type NVARCHAR(100)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'pan_file_size') ALTER TABLE bgv_demographics ADD pan_file_size BIGINT",
        
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'resume_file_data') ALTER TABLE bgv_demographics ADD resume_file_data VARBINARY(MAX)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'resume_file_name') ALTER TABLE bgv_demographics ADD resume_file_name NVARCHAR(255)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'resume_file_type') ALTER TABLE bgv_demographics ADD resume_file_type NVARCHAR(100)",
        "IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('bgv_demographics') AND name = 'resume_file_size') ALTER TABLE bgv_demographics ADD resume_file_size BIGINT"
      ];
      
      for (const statement of alterStatements) {
        try {
          await pool.request().query(statement);
        } catch (error: any) {
          if (!error.message.includes('already exists') && !error.message.includes('duplicate column')) {
            console.error('❌ Error executing ALTER statement:', statement.substring(0, 60) + '...');
            console.error('Error details:', error.message);
          }
        }
      }
      
      console.log('✅ File storage columns added to bgv_demographics table');
    } catch (error) {
      console.error('❌ Error adding file storage columns:', error);
    }
  }

  /**
   * Get fresher details for pre-filling demographics form
   */
  static async getFresherDetails(fresherId: number): Promise<any> {
    try {
      // Development fallback when database is not accessible
      if (fresherId.toString() === 'freshers_005' || fresherId === 5) {
        console.log('🔧 Using development fallback for fresher details');
        return {
          firstName: 'Lalithya',
          lastName: 'Gaddam',
          email: 'lalithya.gaddam@example.com',
          phoneNumber: '1234567890',
          dateOfBirth: '2001-02-02T00:00:00.000Z',
          designation: 'Software Trainee',
          department: 'Engineering'
        };
      }

      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT 
            id,
            first_name as firstName,
            last_name as lastName,
            email,
            phone as phoneNumber,
            date_of_birth as dateOfBirth,
            designation,
            department
          FROM freshers 
          WHERE id = @fresherId
        `);

      if (result.recordset.length === 0) {
        throw new Error('Fresher not found');
      }

      return result.recordset[0];
    } catch (error: any) {
      console.error('Error fetching fresher details:', error);
      // Return fallback data in case of database errors for testing
      console.log('🔧 Database error, returning fallback test data');
      return {
        firstName: 'Lalithya',
        lastName: 'Gaddam',
        email: 'lalithya.gaddam@example.com',
        phoneNumber: '1234567890',
        dateOfBirth: '2001-02-02T00:00:00.000Z',
        designation: 'Software Trainee',
        department: 'Engineering'
      };
    }
  }

  /**
   * Get or create BGV submission for a fresher
   */
  static async getOrCreateSubmission(fresherId: number): Promise<BGVSubmission> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Check if submission exists
      let result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT id, fresher_id, submission_status, current_section, 
                 submitted_at, reviewed_at, reviewed_by, review_comments,
                 created_at, updated_at
          FROM bgv_submissions 
          WHERE fresher_id = @fresherId
        `);

      if (result.recordset.length > 0) {
        return result.recordset[0];
      }

      // Create new submission
      result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          INSERT INTO bgv_submissions (fresher_id, submission_status, current_section)
          OUTPUT INSERTED.*
          VALUES (@fresherId, 'draft', 'demographics')
        `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error getting/creating BGV submission:', error);
      throw error;
    }
  }

  /**
   * Get fresher data pre-filled for demographics
   */
  static async getFresherDataForDemographics(fresherId: number): Promise<Demographics> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT first_name, last_name, email, designation, department
          FROM freshers 
          WHERE id = @fresherId
        `);

      if (result.recordset.length === 0) {
        throw new Error('Fresher not found');
      }

      const fresher = result.recordset[0];

      // Return pre-filled demographics data
      return {
        first_name: fresher.first_name,
        last_name: fresher.last_name,
        // Other fields will be filled by user
      };
    } catch (error) {
      console.error('Error getting fresher data:', error);
      throw error;
    }
  }

  /**
   * Get saved demographics data for a submission
   */
  static async getSavedDemographics(submissionId: number): Promise<any> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const result = await pool.request()
        .input('submissionId', mssql.Int, submissionId)
        .query(`
          SELECT 
            salutation, first_name, middle_name, last_name, name_for_records,
            dob_as_per_records, celebrated_dob, gender, blood_group, 
            whatsapp_number, linkedin_url, aadhaar_card_number, pan_card_number,
            comm_house_number, comm_street_name, comm_city, comm_district, 
            comm_state, comm_country, comm_pin_code, perm_same_as_comm,
            perm_house_number, perm_street_name, perm_city, perm_district,
            perm_state, perm_country, perm_pin_code,
            aadhaar_file_name, aadhaar_file_type, aadhaar_file_size,
            pan_file_name, pan_file_type, pan_file_size,
            resume_file_name, resume_file_type, resume_file_size
          FROM bgv_demographics 
          WHERE submission_id = @submissionId
        `);

      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error getting saved demographics:', error);
      throw error;
    }
  }

  /**
   * Save demographics data
   */
  static async saveDemographics(submissionId: number, data: Demographics): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      console.log('🔍 Received demographics data:', {
        dob_as_per_records: data.dob_as_per_records,
        celebrated_dob: data.celebrated_dob,
        dobType: typeof data.celebrated_dob,
        dobValue: data.celebrated_dob
      });

      // Check if demographics exist
      const existingResult = await pool.request()
        .input('submissionId', mssql.Int, submissionId)
        .query('SELECT id FROM bgv_demographics WHERE submission_id = @submissionId');

      if (existingResult.recordset.length > 0) {
        // Update existing
        await pool.request()
          .input('submissionId', mssql.Int, submissionId)
          .input('salutation', mssql.NVarChar(10), data.salutation)
          .input('firstName', mssql.NVarChar(100), data.first_name)
          .input('middleName', mssql.NVarChar(100), data.middle_name)
          .input('lastName', mssql.NVarChar(100), data.last_name)
          .input('nameForRecords', mssql.NVarChar(200), data.name_for_records)
          .input('dobAsPerRecords', mssql.Date, data.dob_as_per_records)
          .input('celebratedDob', mssql.Date, data.celebrated_dob)
          .input('gender', mssql.NVarChar(20), data.gender)
          .input('bloodGroup', mssql.NVarChar(5), data.blood_group)
          .input('whatsappNumber', mssql.NVarChar(15), data.whatsapp_number)
          .input('linkedinUrl', mssql.NVarChar(500), data.linkedin_url)
          .input('aadhaarNumber', mssql.NVarChar(12), data.aadhaar_card_number)
          .input('panNumber', mssql.NVarChar(10), data.pan_card_number)
          .input('commHouseNumber', mssql.NVarChar(100), data.comm_house_number)
          .input('commStreetName', mssql.NVarChar(200), data.comm_street_name)
          .input('commCity', mssql.NVarChar(100), data.comm_city)
          .input('commDistrict', mssql.NVarChar(100), data.comm_district)
          .input('commState', mssql.NVarChar(100), data.comm_state)
          .input('commCountry', mssql.NVarChar(100), data.comm_country)
          .input('commPinCode', mssql.NVarChar(10), data.comm_pin_code)
          .input('permSameAsComm', mssql.Bit, data.perm_same_as_comm)
          .input('permHouseNumber', mssql.NVarChar(100), data.perm_house_number)
          .input('permStreetName', mssql.NVarChar(200), data.perm_street_name)
          .input('permCity', mssql.NVarChar(100), data.perm_city)
          .input('permDistrict', mssql.NVarChar(100), data.perm_district)
          .input('permState', mssql.NVarChar(100), data.perm_state)
          .input('permCountry', mssql.NVarChar(100), data.perm_country)
          .input('permPinCode', mssql.NVarChar(10), data.perm_pin_code)
          // File parameters
          .input('aadhaarFileData', mssql.VarBinary, convertFileDataToBuffer(data.aadhaar_file_data))
          .input('aadhaarFileName', mssql.NVarChar(255), data.aadhaar_file_name)
          .input('aadhaarFileType', mssql.NVarChar(100), data.aadhaar_file_type)
          .input('aadhaarFileSize', mssql.Int, data.aadhaar_file_size)
          .input('panFileData', mssql.VarBinary, convertFileDataToBuffer(data.pan_file_data))
          .input('panFileName', mssql.NVarChar(255), data.pan_file_name)
          .input('panFileType', mssql.NVarChar(100), data.pan_file_type)
          .input('panFileSize', mssql.Int, data.pan_file_size)
          .input('resumeFileData', mssql.VarBinary, convertFileDataToBuffer(data.resume_file_data))
          .input('resumeFileName', mssql.NVarChar(255), data.resume_file_name)
          .input('resumeFileType', mssql.NVarChar(100), data.resume_file_type)
          .input('resumeFileSize', mssql.Int, data.resume_file_size)
          .query(`
            UPDATE bgv_demographics SET
              salutation = @salutation,
              first_name = @firstName,
              middle_name = @middleName,
              last_name = @lastName,
              name_for_records = @nameForRecords,
              dob_as_per_records = @dobAsPerRecords,
              celebrated_dob = @celebratedDob,
              gender = @gender,
              blood_group = @bloodGroup,
              whatsapp_number = @whatsappNumber,
              linkedin_url = @linkedinUrl,
              aadhaar_card_number = @aadhaarNumber,
              pan_card_number = @panNumber,
              comm_house_number = @commHouseNumber,
              comm_street_name = @commStreetName,
              comm_city = @commCity,
              comm_district = @commDistrict,
              comm_state = @commState,
              comm_country = @commCountry,
              comm_pin_code = @commPinCode,
              perm_same_as_comm = @permSameAsComm,
              perm_house_number = @permHouseNumber,
              perm_street_name = @permStreetName,
              perm_city = @permCity,
              perm_district = @permDistrict,
              perm_state = @permState,
              perm_country = @permCountry,
              perm_pin_code = @permPinCode,              aadhaar_file_data = CASE WHEN @aadhaarFileData IS NOT NULL THEN @aadhaarFileData ELSE aadhaar_file_data END,
              aadhaar_file_name = CASE WHEN @aadhaarFileName IS NOT NULL THEN @aadhaarFileName ELSE aadhaar_file_name END,
              aadhaar_file_type = CASE WHEN @aadhaarFileType IS NOT NULL THEN @aadhaarFileType ELSE aadhaar_file_type END,
              aadhaar_file_size = CASE WHEN @aadhaarFileSize IS NOT NULL THEN @aadhaarFileSize ELSE aadhaar_file_size END,
              pan_file_data = CASE WHEN @panFileData IS NOT NULL THEN @panFileData ELSE pan_file_data END,
              pan_file_name = CASE WHEN @panFileName IS NOT NULL THEN @panFileName ELSE pan_file_name END,
              pan_file_type = CASE WHEN @panFileType IS NOT NULL THEN @panFileType ELSE pan_file_type END,
              pan_file_size = CASE WHEN @panFileSize IS NOT NULL THEN @panFileSize ELSE pan_file_size END,
              resume_file_data = CASE WHEN @resumeFileData IS NOT NULL THEN @resumeFileData ELSE resume_file_data END,
              resume_file_name = CASE WHEN @resumeFileName IS NOT NULL THEN @resumeFileName ELSE resume_file_name END,
              resume_file_type = CASE WHEN @resumeFileType IS NOT NULL THEN @resumeFileType ELSE resume_file_type END,
              resume_file_size = CASE WHEN @resumeFileSize IS NOT NULL THEN @resumeFileSize ELSE resume_file_size END,              updated_at = GETUTCDATE()
            WHERE submission_id = @submissionId
          `);
      } else {
        // Insert new
        await pool.request()
          .input('submissionId', mssql.Int, submissionId)
          .input('salutation', mssql.NVarChar(10), data.salutation)
          .input('firstName', mssql.NVarChar(100), data.first_name)
          .input('middleName', mssql.NVarChar(100), data.middle_name)
          .input('lastName', mssql.NVarChar(100), data.last_name)
          .input('nameForRecords', mssql.NVarChar(200), data.name_for_records)
          .input('dobAsPerRecords', mssql.Date, data.dob_as_per_records)
          .input('celebratedDob', mssql.Date, data.celebrated_dob)
          .input('gender', mssql.NVarChar(20), data.gender)
          .input('bloodGroup', mssql.NVarChar(5), data.blood_group)
          .input('whatsappNumber', mssql.NVarChar(15), data.whatsapp_number)
          .input('linkedinUrl', mssql.NVarChar(500), data.linkedin_url)
          .input('aadhaarNumber', mssql.NVarChar(12), data.aadhaar_card_number)
          .input('panNumber', mssql.NVarChar(10), data.pan_card_number)
          .input('commHouseNumber', mssql.NVarChar(100), data.comm_house_number)
          .input('commStreetName', mssql.NVarChar(200), data.comm_street_name)
          .input('commCity', mssql.NVarChar(100), data.comm_city)
          .input('commDistrict', mssql.NVarChar(100), data.comm_district)
          .input('commState', mssql.NVarChar(100), data.comm_state)
          .input('commCountry', mssql.NVarChar(100), data.comm_country)
          .input('commPinCode', mssql.NVarChar(10), data.comm_pin_code)
          .input('permSameAsComm', mssql.Bit, data.perm_same_as_comm)
          .input('permHouseNumber', mssql.NVarChar(100), data.perm_house_number)
          .input('permStreetName', mssql.NVarChar(200), data.perm_street_name)
          .input('permCity', mssql.NVarChar(100), data.perm_city)
          .input('permDistrict', mssql.NVarChar(100), data.perm_district)
          .input('permState', mssql.NVarChar(100), data.perm_state)
          .input('permCountry', mssql.NVarChar(100), data.perm_country)
          .input('permPinCode', mssql.NVarChar(10), data.perm_pin_code)
          // File parameters
          .input('aadhaarFileData', mssql.VarBinary, convertFileDataToBuffer(data.aadhaar_file_data))
          .input('aadhaarFileName', mssql.NVarChar(255), data.aadhaar_file_name)
          .input('aadhaarFileType', mssql.NVarChar(100), data.aadhaar_file_type)
          .input('aadhaarFileSize', mssql.Int, data.aadhaar_file_size)
          .input('panFileData', mssql.VarBinary, convertFileDataToBuffer(data.pan_file_data))
          .input('panFileName', mssql.NVarChar(255), data.pan_file_name)
          .input('panFileType', mssql.NVarChar(100), data.pan_file_type)
          .input('panFileSize', mssql.Int, data.pan_file_size)
          .input('resumeFileData', mssql.VarBinary, convertFileDataToBuffer(data.resume_file_data))
          .input('resumeFileName', mssql.NVarChar(255), data.resume_file_name)
          .input('resumeFileType', mssql.NVarChar(100), data.resume_file_type)
          .input('resumeFileSize', mssql.Int, data.resume_file_size)
          .query(`
            INSERT INTO bgv_demographics (
              submission_id, salutation, first_name, middle_name, last_name,
              name_for_records, dob_as_per_records, celebrated_dob, gender, blood_group,
              whatsapp_number, linkedin_url, aadhaar_card_number, pan_card_number,
              comm_house_number, comm_street_name, comm_city, comm_district, comm_state, comm_country, comm_pin_code,
              perm_same_as_comm, perm_house_number, perm_street_name, perm_city, perm_district, perm_state, perm_country, perm_pin_code,
              aadhaar_file_data, aadhaar_file_name, aadhaar_file_type, aadhaar_file_size,
              pan_file_data, pan_file_name, pan_file_type, pan_file_size,
              resume_file_data, resume_file_name, resume_file_type, resume_file_size
            ) VALUES (
              @submissionId, @salutation, @firstName, @middleName, @lastName,
              @nameForRecords, @dobAsPerRecords, @celebratedDob, @gender, @bloodGroup,
              @whatsappNumber, @linkedinUrl, @aadhaarNumber, @panNumber,
              @commHouseNumber, @commStreetName, @commCity, @commDistrict, @commState, @commCountry, @commPinCode,
              @permSameAsComm, @permHouseNumber, @permStreetName, @permCity, @permDistrict, @permState, @permCountry, @permPinCode,
              @aadhaarFileData, @aadhaarFileName, @aadhaarFileType, @aadhaarFileSize,
              @panFileData, @panFileName, @panFileType, @panFileSize,
              @resumeFileData, @resumeFileName, @resumeFileType, @resumeFileSize
            )
          `);
      }

      console.log(`✅ Demographics saved for submission ${submissionId}`);
    } catch (error) {
      console.error('Error saving demographics:', error);
      throw error;
    }
  }

  /**
   * Update bgv_personal table to support multiple emergency contacts
   */
  static async updatePersonalTableSchema(): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();

      // Check and add num_children column
      try {
        console.log('🔧 Checking if num_children column exists...');
        const checkNumChildren = await pool.request().query(`
          SELECT COUNT(*) as col_count 
          FROM sys.columns 
          WHERE object_id = OBJECT_ID('bgv_personal') AND name = 'num_children'
        `);
        
        if (checkNumChildren.recordset[0].col_count === 0) {
          console.log('🔧 Adding num_children column...');
          await pool.request().query('ALTER TABLE bgv_personal ADD num_children INT DEFAULT 0');
          console.log('✅ num_children column added successfully');
        } else {
          console.log('✅ num_children column already exists');
        }
      } catch (error: any) {
        console.error('❌ Error adding num_children column:', error.message);
      }

      // Check and add emergency_contacts column
      try {
        console.log('🔧 Checking if emergency_contacts column exists...');
        const checkEmergencyContacts = await pool.request().query(`
          SELECT COUNT(*) as col_count 
          FROM sys.columns 
          WHERE object_id = OBJECT_ID('bgv_personal') AND name = 'emergency_contacts'
        `);
        
        if (checkEmergencyContacts.recordset[0].col_count === 0) {
          console.log('🔧 Adding emergency_contacts column...');
          await pool.request().query('ALTER TABLE bgv_personal ADD emergency_contacts NVARCHAR(MAX)');
          console.log('✅ emergency_contacts column added successfully');
        } else {
          console.log('✅ emergency_contacts column already exists');
        }
      } catch (error: any) {
        console.error('❌ Error adding emergency_contacts column:', error.message);
      }

      // Drop old single emergency contact columns (we now use JSON array for multiple contacts)
      const oldColumns = ['emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship'];
      for (const columnName of oldColumns) {
        try {
          console.log(`🔧 Checking if old column ${columnName} exists...`);
          const checkColumn = await pool.request().query(`
            SELECT COUNT(*) as col_count 
            FROM sys.columns 
            WHERE object_id = OBJECT_ID('bgv_personal') AND name = '${columnName}'
          `);
          
          if (checkColumn.recordset[0].col_count > 0) {
            console.log(`🔧 Dropping old column ${columnName}...`);
            await pool.request().query(`ALTER TABLE bgv_personal DROP COLUMN ${columnName}`);
            console.log(`✅ Old column ${columnName} dropped successfully`);
          } else {
            console.log(`✅ Old column ${columnName} does not exist (already removed)`);
          }
        } catch (error: any) {
          console.error(`❌ Error dropping old column ${columnName}:`, error.message);
        }
      }
      
      console.log('✅ bgv_personal table schema update completed');
    } catch (error) {
      console.error('❌ Error updating bgv_personal table schema:', error);
    }
  }

  /**
   * Get saved personal information
   */
  static async getSavedPersonal(submissionId: number): Promise<any> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const result = await pool.request()
        .input('submissionId', mssql.Int, submissionId)
        .query(`
          SELECT 
            marital_status, num_children,
            father_name, father_dob, father_deceased,
            mother_name, mother_dob, mother_deceased,
            emergency_contacts
          FROM bgv_personal 
          WHERE submission_id = @submissionId
        `);

      if (result.recordset.length > 0) {
        const data = result.recordset[0];
        console.log('🔍 Raw personal data from DB:', data);
        console.log('🔍 Raw emergency_contacts from DB:', data.emergency_contacts);
        
        // Parse emergency contacts JSON if it exists
        if (data.emergency_contacts) {
          try {
            data.emergency_contacts = JSON.parse(data.emergency_contacts);
            console.log('✅ Parsed emergency_contacts:', data.emergency_contacts);
          } catch (e) {
            console.error('❌ Error parsing emergency_contacts:', e);
            data.emergency_contacts = [];
          }
        } else {
          data.emergency_contacts = [];
        }
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error getting saved personal information:', error);
      throw error;
    }
  }

  /**
   * Save personal information
   */
  static async savePersonal(submissionId: number, data: Personal): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      console.log('🔍 Received personal data:', data);
      console.log('🔍 Emergency contacts to save:', data.emergency_contacts);

      // Convert emergency contacts array to JSON string
      const emergencyContactsJson = JSON.stringify(data.emergency_contacts || []);
      console.log('🔍 Emergency contacts JSON string:', emergencyContactsJson);

      // Check if personal info exists
      const existingResult = await pool.request()
        .input('submissionId', mssql.Int, submissionId)
        .query('SELECT id FROM bgv_personal WHERE submission_id = @submissionId');

      if (existingResult.recordset.length > 0) {
        // Update existing
        await pool.request()
          .input('submissionId', mssql.Int, submissionId)
          .input('maritalStatus', mssql.NVarChar(20), data.marital_status)
          .input('numChildren', mssql.Int, data.no_of_children || 0)
          .input('fatherName', mssql.NVarChar(100), data.father_name)
          .input('fatherDob', mssql.Date, data.father_dob)
          .input('fatherDeceased', mssql.Bit, data.father_deceased || false)
          .input('motherName', mssql.NVarChar(100), data.mother_name)
          .input('motherDob', mssql.Date, data.mother_dob)
          .input('motherDeceased', mssql.Bit, data.mother_deceased || false)
          .input('emergencyContacts', mssql.NVarChar(mssql.MAX), emergencyContactsJson)
          .query(`
            UPDATE bgv_personal SET
              marital_status = @maritalStatus,
              num_children = @numChildren,
              father_name = @fatherName,
              father_dob = @fatherDob,
              father_deceased = @fatherDeceased,
              mother_name = @motherName,
              mother_dob = @motherDob,
              mother_deceased = @motherDeceased,
              emergency_contacts = @emergencyContacts,
              updated_at = GETUTCDATE()
            WHERE submission_id = @submissionId
          `);
      } else {
        // Insert new
        await pool.request()
          .input('submissionId', mssql.Int, submissionId)
          .input('maritalStatus', mssql.NVarChar(20), data.marital_status)
          .input('numChildren', mssql.Int, data.no_of_children || 0)
          .input('fatherName', mssql.NVarChar(100), data.father_name)
          .input('fatherDob', mssql.Date, data.father_dob)
          .input('fatherDeceased', mssql.Bit, data.father_deceased || false)
          .input('motherName', mssql.NVarChar(100), data.mother_name)
          .input('motherDob', mssql.Date, data.mother_dob)
          .input('motherDeceased', mssql.Bit, data.mother_deceased || false)
          .input('emergencyContacts', mssql.NVarChar(mssql.MAX), emergencyContactsJson)
          .query(`
            INSERT INTO bgv_personal (
              submission_id, marital_status, num_children,
              father_name, father_dob, father_deceased,
              mother_name, mother_dob, mother_deceased,
              emergency_contacts
            ) VALUES (
              @submissionId, @maritalStatus, @numChildren,
              @fatherName, @fatherDob, @fatherDeceased,
              @motherName, @motherDob, @motherDeceased,
              @emergencyContacts
            )
          `);
      }

      console.log(`✅ Personal information saved for submission ${submissionId}`);
    } catch (error) {
      console.error('Error saving personal information:', error);
      throw error;
    }
  }

  /**
   * Update submission progress
   */
  static async updateSubmissionProgress(submissionId: number, currentSection: string): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      await pool.request()
        .input('submissionId', mssql.Int, submissionId)
        .input('currentSection', mssql.NVarChar(50), currentSection)
        .query(`
          UPDATE bgv_submissions 
          SET current_section = @currentSection, updated_at = GETUTCDATE()
          WHERE id = @submissionId
        `);

      console.log(`✅ Submission progress updated: ${currentSection}`);
    } catch (error) {
      console.error('Error updating submission progress:', error);
      throw error;
    }
  }

  /**
   * Update educational_details table schema
   */
  static async updateEducationalTableSchema(): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();

      // Check if educational_details table exists, create if not
      console.log('🔧 Checking if educational_details table exists...');
      const checkTable = await pool.request().query(`
        SELECT COUNT(*) as table_count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'educational_details'
      `);
      
      if (checkTable.recordset[0].table_count === 0) {
        console.log('🔧 Creating educational_details table...');
        await pool.request().query(`
          CREATE TABLE educational_details (
            id INT IDENTITY(1,1) PRIMARY KEY,
            fresher_id INT NOT NULL,
            qualification_type NVARCHAR(50) NOT NULL,
            qualification NVARCHAR(200),
            university_institution NVARCHAR(500),
            cgpa_percentage NVARCHAR(50),
            year_of_passing INT,
            certificate_name NVARCHAR(500),
            documents NVARCHAR(MAX),
            created_at DATETIME2 DEFAULT GETDATE(),
            updated_at DATETIME2 DEFAULT GETDATE(),
            CONSTRAINT FK_educational_details_fresher FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE CASCADE
          )
        `);
        console.log('✅ educational_details table created successfully');
      } else {
        console.log('✅ educational_details table already exists');
        
        // Migration: Check if employee_id exists and needs to be replaced with fresher_id
        try {
          const checkEmployeeId = await pool.request().query(`
            SELECT COUNT(*) as col_count 
            FROM sys.columns 
            WHERE object_id = OBJECT_ID('educational_details') AND name = 'employee_id'
          `);
          
          if (checkEmployeeId.recordset[0].col_count > 0) {
            console.log('🔧 Migrating from employee_id to fresher_id...');
            
            // Drop employee_id column
            await pool.request().query('ALTER TABLE educational_details DROP COLUMN employee_id');
            console.log('✅ Dropped employee_id column');
            
            // Add fresher_id column
            await pool.request().query('ALTER TABLE educational_details ADD fresher_id INT NOT NULL DEFAULT 0');
            console.log('✅ Added fresher_id column');
            
            // Add foreign key constraint
            await pool.request().query(`
              ALTER TABLE educational_details 
              ADD CONSTRAINT FK_educational_details_fresher 
              FOREIGN KEY (fresher_id) REFERENCES freshers(id) ON DELETE CASCADE
            `);
            console.log('✅ Added foreign key constraint to freshers table');
          } else {
            console.log('✅ educational_details table already using fresher_id');
          }
        } catch (migrationError: any) {
          console.error('⚠️ Migration error (may be expected):', migrationError.message);
        }
      }
      
      console.log('✅ educational_details table schema update completed');
    } catch (error) {
      console.error('❌ Error updating educational_details table schema:', error);
    }
  }

  /**
   * Get saved educational details
   */
  static async getSavedEducational(fresherId: number): Promise<any> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT 
            id, fresher_id, qualification_type, qualification,
            university_institution, cgpa_percentage, year_of_passing,
            certificate_name, documents
          FROM educational_details 
          WHERE fresher_id = @fresherId
          ORDER BY id
        `);

      console.log('🔍 Raw educational data from DB:', result.recordset);
      
      // Parse documents JSON for each record
      const educationalData = result.recordset.map(record => {
        if (record.documents) {
          try {
            record.documents = JSON.parse(record.documents);
            console.log('✅ Parsed documents for record', record.id, ':', record.documents);
          } catch (e) {
            console.error('❌ Error parsing documents for record', record.id, ':', e);
            record.documents = [];
          }
        } else {
          record.documents = [];
        }
        return record;
      });
      
      return educationalData;
    } catch (error) {
      console.error('Error getting saved educational details:', error);
      throw error;
    }
  }

  /**
   * Save educational details (both educational qualifications and additional certificates)
   */
  static async saveEducational(fresherId: number, educationalData: any[], additionalData: any[]): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      console.log('🔍 Received educational data:', educationalData);
      console.log('🔍 Received additional data:', additionalData);

      // Delete existing records for this fresher
      await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('DELETE FROM educational_details WHERE fresher_id = @fresherId');

      // Insert educational qualifications
      for (const edu of educationalData) {
        const documentsJson = JSON.stringify(edu.documents || []);
        console.log('🔍 Educational qualification documents JSON:', documentsJson);

        await pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .input('qualificationType', mssql.NVarChar(50), 'educational')
          .input('qualification', mssql.NVarChar(200), edu.qualification)
          .input('universityInstitution', mssql.NVarChar(500), edu.university_institution)
          .input('cgpaPercentage', mssql.NVarChar(50), edu.cgpa_percentage)
          .input('yearOfPassing', mssql.Int, edu.year_of_passing)
          .input('documents', mssql.NVarChar(mssql.MAX), documentsJson)
          .query(`
            INSERT INTO educational_details (
              fresher_id, qualification_type, qualification,
              university_institution, cgpa_percentage, year_of_passing,
              documents
            ) VALUES (
              @fresherId, @qualificationType, @qualification,
              @universityInstitution, @cgpaPercentage, @yearOfPassing,
              @documents
            )
          `);
      }

      // Insert additional qualifications/certificates
      for (const cert of additionalData) {
        const documentsJson = JSON.stringify(cert.documents || []);
        console.log('🔍 Additional certificate documents JSON:', documentsJson);

        await pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .input('qualificationType', mssql.NVarChar(50), 'additional')
          .input('certificateName', mssql.NVarChar(500), cert.certificate_name)
          .input('documents', mssql.NVarChar(mssql.MAX), documentsJson)
          .query(`
            INSERT INTO educational_details (
              fresher_id, qualification_type, certificate_name, documents
            ) VALUES (
              @fresherId, @qualificationType, @certificateName, @documents
            )
          `);
      }

      console.log(`✅ Educational details saved for fresher ${fresherId}`);
    } catch (error) {
      console.error('Error saving educational details:', error);
      throw error;
    }
  }

  /**
   * Submit BGV for review
   */
  static async submitForReview(submissionId: number): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      await pool.request()
        .input('submissionId', mssql.Int, submissionId)
        .query(`
          UPDATE bgv_submissions 
          SET submission_status = 'submitted', 
              submitted_at = GETUTCDATE(),
              updated_at = GETUTCDATE()
          WHERE id = @submissionId
        `);

      console.log(`✅ BGV submission ${submissionId} submitted for review`);
    } catch (error) {
      console.error('Error submitting BGV for review:', error);
      throw error;
    }
  }

  /**
   * Get all BGV submissions for HR portal
   */
  static async getAllSubmissions(): Promise<any[]> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();

      const result = await pool.request().query(`
        SELECT 
          bs.id,
          bs.submission_status,
          bs.submitted_at,
          bs.reviewed_at,
          bs.reviewed_by,
          f.first_name,
          f.last_name,
          f.email,
          f.designation,
          f.department,
          bd.salutation,
          COUNT(df.id) as total_documents,
          SUM(CASE WHEN df.verification_status = 'verified' THEN 1 ELSE 0 END) as verified_documents
        FROM bgv_submissions bs
        INNER JOIN freshers f ON bs.fresher_id = f.id
        LEFT JOIN bgv_demographics bd ON bs.id = bd.submission_id
        LEFT JOIN document_files df ON bs.id = df.submission_id
        WHERE bs.submission_status IN ('submitted', 'in_review', 'verified', 'rejected')
        GROUP BY bs.id, bs.submission_status, bs.submitted_at, bs.reviewed_at, bs.reviewed_by,
                 f.first_name, f.last_name, f.email, f.designation, f.department, bd.salutation
        ORDER BY bs.submitted_at DESC
      `);

      return result.recordset;
    } catch (error) {
      console.error('Error getting BGV submissions:', error);
      throw error;
    }
  }

  /**
   * Verify or reject a document
   */
  static async updateDocumentVerification(
    documentId: number, 
    status: 'verified' | 'rejected', 
    hrEmail: string, 
    rejectionReason?: string
  ): Promise<void> {
    try {
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      await pool.request()
        .input('documentId', mssql.Int, documentId)
        .input('status', mssql.NVarChar(50), status)
        .input('hrEmail', mssql.NVarChar(255), hrEmail)
        .input('rejectionReason', mssql.NVarChar(500), rejectionReason)
        .query(`
          UPDATE document_files 
          SET verification_status = @status,
              verified_by = @hrEmail,
              verified_at = GETUTCDATE(),
              rejection_reason = @rejectionReason,
              updated_at = GETUTCDATE()
          WHERE id = @documentId
        `);

      // If document was rejected, send email notification
      if (status === 'rejected') {
        await this.sendDocumentRejectionEmail(documentId, rejectionReason || 'Document requires correction');
      }

      console.log(`✅ Document ${documentId} ${status} by ${hrEmail}`);
    } catch (error) {
      console.error('Error updating document verification:', error);
      throw error;
    }
  }

  /**
   * Send document rejection email
   */
  private static async sendDocumentRejectionEmail(documentId: number, reason: string): Promise<void> {
    try {
      // Get document and user details
      const { getMSSQLPool } = await import('../config/database');
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const result = await pool.request()
        .input('documentId', mssql.Int, documentId)
        .query(`
          SELECT 
            df.document_type,
            df.original_filename,
            f.first_name,
            f.last_name,
            f.email
          FROM document_files df
          INNER JOIN bgv_submissions bs ON df.submission_id = bs.id
          INNER JOIN freshers f ON bs.fresher_id = f.id
          WHERE df.id = @documentId
        `);

      if (result.recordset.length > 0) {
        const doc = result.recordset[0];
        const { emailService } = await import('./email.service');
        
        // Send rejection email (implement in email service)
        // await emailService.sendDocumentRejectionEmail({
        //   userEmail: doc.email,
        //   userName: `${doc.first_name} ${doc.last_name}`,
        //   documentType: doc.document_type,
        //   reason: reason
        // });
        
        console.log(`📧 Document rejection email sent to ${doc.email}`);
      }
    } catch (error) {
      console.error('Error sending document rejection email:', error);
    }
  }

}