import { getMSSQLPool } from '../config/database';
import mssql from 'mssql';

export interface EmploymentHistory {
  id?: number;
  fresher_id: number;
  company_name?: string;
  designation?: string;
  employment_start_date?: string;
  employment_end_date?: string;
  reason_for_leaving?: string;
  offer_letter_url?: string;
  experience_letter_url?: string;
  payslips_url?: string;
}

export interface PassportVisa {
  id?: number;
  fresher_id: number;
  has_passport?: boolean;
  passport_number?: string;
  passport_issue_date?: string;
  passport_expiry_date?: string;
  passport_copy_url?: string;
  has_visa?: boolean;
  visa_type?: string;
  visa_expiry_date?: string;
  visa_document_url?: string;
}

export interface BankPfNps {
  id?: number;
  fresher_id: number;
  number_of_bank_accounts?: number;
  bank_account_number?: string;
  ifsc_code?: string;
  name_as_per_bank?: string;
  bank_name?: string;
  branch?: string;
  cancelled_cheque_url?: string;
  uan_pf_number?: string;
  pran_nps_number?: string;
}

class DocumentsService {
  // Employment History Methods
  async saveEmploymentHistory(data: EmploymentHistory[]): Promise<void> {
    try {
      const pool = getMSSQLPool();
      
      // Delete existing records
      await pool.request()
        .input('fresherId', mssql.Int, data[0]?.fresher_id)
        .query('DELETE FROM employment_history WHERE fresher_id = @fresherId');

      // Insert new records
      for (const record of data) {
        await pool.request()
          .input('fresherId', mssql.Int, record.fresher_id)
          .input('companyName', mssql.NVarChar(200), record.company_name)
          .input('designation', mssql.NVarChar(150), record.designation)
          .input('startDate', mssql.Date, record.employment_start_date ? new Date(record.employment_start_date) : null)
          .input('endDate', mssql.Date, record.employment_end_date ? new Date(record.employment_end_date) : null)
          .input('reason', mssql.NVarChar(mssql.MAX), record.reason_for_leaving)
          .input('offerLetter', mssql.NVarChar(500), record.offer_letter_url)
          .input('experienceLetter', mssql.NVarChar(500), record.experience_letter_url)
          .input('payslips', mssql.NVarChar(mssql.MAX), record.payslips_url)
          .query(`
            INSERT INTO employment_history 
            (fresher_id, company_name, designation, employment_start_date, employment_end_date, 
             reason_for_leaving, offer_letter_url, experience_letter_url, payslips_url)
            VALUES 
            (@fresherId, @companyName, @designation, @startDate, @endDate, 
             @reason, @offerLetter, @experienceLetter, @payslips)
          `);
      }
      
      console.log('✅ Employment history saved successfully');
    } catch (error) {
      console.error('Error saving employment history:', error);
      throw error;
    }
  }

  async getEmploymentHistory(fresherId: number): Promise<EmploymentHistory[]> {
    try {
      const pool = getMSSQLPool();
      const result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('SELECT * FROM employment_history WHERE fresher_id = @fresherId ORDER BY employment_start_date DESC');
      
      return result.recordset;
    } catch (error) {
      console.error('Error fetching employment history:', error);
      throw error;
    }
  }

  // Passport & Visa Methods
  async savePassportVisa(data: PassportVisa): Promise<void> {
    try {
      const pool = getMSSQLPool();
      
      // Check if record exists
      const existing = await pool.request()
        .input('fresherId', mssql.Int, data.fresher_id)
        .query('SELECT id FROM passport_visa WHERE fresher_id = @fresherId');

      if (existing.recordset.length > 0) {
        // Update
        await pool.request()
          .input('fresherId', mssql.Int, data.fresher_id)
          .input('hasPassport', mssql.Bit, data.has_passport ? 1 : 0)
          .input('passportNumber', mssql.NVarChar(50), data.passport_number)
          .input('passportIssue', mssql.Date, data.passport_issue_date ? new Date(data.passport_issue_date) : null)
          .input('passportExpiry', mssql.Date, data.passport_expiry_date ? new Date(data.passport_expiry_date) : null)
          .input('passportCopy', mssql.NVarChar(500), data.passport_copy_url)
          .input('hasVisa', mssql.Bit, data.has_visa ? 1 : 0)
          .input('visaType', mssql.NVarChar(100), data.visa_type)
          .input('visaExpiry', mssql.Date, data.visa_expiry_date ? new Date(data.visa_expiry_date) : null)
          .input('visaDocument', mssql.NVarChar(500), data.visa_document_url)
          .query(`
            UPDATE passport_visa SET
              has_passport = @hasPassport,
              passport_number = @passportNumber,
              passport_issue_date = @passportIssue,
              passport_expiry_date = @passportExpiry,
              passport_copy_url = @passportCopy,
              has_visa = @hasVisa,
              visa_type = @visaType,
              visa_expiry_date = @visaExpiry,
              visa_document_url = @visaDocument,
              updated_at = GETDATE()
            WHERE fresher_id = @fresherId
          `);
      } else {
        // Insert
        await pool.request()
          .input('fresherId', mssql.Int, data.fresher_id)
          .input('hasPassport', mssql.Bit, data.has_passport ? 1 : 0)
          .input('passportNumber', mssql.NVarChar(50), data.passport_number)
          .input('passportIssue', mssql.Date, data.passport_issue_date ? new Date(data.passport_issue_date) : null)
          .input('passportExpiry', mssql.Date, data.passport_expiry_date ? new Date(data.passport_expiry_date) : null)
          .input('passportCopy', mssql.NVarChar(500), data.passport_copy_url)
          .input('hasVisa', mssql.Bit, data.has_visa ? 1 : 0)
          .input('visaType', mssql.NVarChar(100), data.visa_type)
          .input('visaExpiry', mssql.Date, data.visa_expiry_date ? new Date(data.visa_expiry_date) : null)
          .input('visaDocument', mssql.NVarChar(500), data.visa_document_url)
          .query(`
            INSERT INTO passport_visa 
            (fresher_id, has_passport, passport_number, passport_issue_date, passport_expiry_date, passport_copy_url,
             has_visa, visa_type, visa_expiry_date, visa_document_url)
            VALUES 
            (@fresherId, @hasPassport, @passportNumber, @passportIssue, @passportExpiry, @passportCopy,
             @hasVisa, @visaType, @visaExpiry, @visaDocument)
          `);
      }
      
      console.log('✅ Passport & Visa information saved successfully');
    } catch (error) {
      console.error('Error saving passport & visa:', error);
      throw error;
    }
  }

  async getPassportVisa(fresherId: number): Promise<PassportVisa | null> {
    try {
      const pool = getMSSQLPool();
      const result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('SELECT * FROM passport_visa WHERE fresher_id = @fresherId');
      
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error fetching passport & visa:', error);
      throw error;
    }
  }

  // Bank/PF/NPS Methods
  async saveBankPfNps(data: BankPfNps): Promise<void> {
    try {
      const pool = getMSSQLPool();
      
      // Check if record exists
      const existing = await pool.request()
        .input('fresherId', mssql.Int, data.fresher_id)
        .query('SELECT id FROM bank_pf_nps WHERE fresher_id = @fresherId');

      if (existing.recordset.length > 0) {
        // Update
        await pool.request()
          .input('fresherId', mssql.Int, data.fresher_id)
          .input('numAccounts', mssql.Int, data.number_of_bank_accounts)
          .input('accountNumber', mssql.NVarChar(50), data.bank_account_number)
          .input('ifsc', mssql.NVarChar(20), data.ifsc_code)
          .input('nameAsPerBank', mssql.NVarChar(200), data.name_as_per_bank)
          .input('bankName', mssql.NVarChar(200), data.bank_name)
          .input('branch', mssql.NVarChar(200), data.branch)
          .input('cancelledCheque', mssql.NVarChar(500), data.cancelled_cheque_url)
          .input('uanNumber', mssql.NVarChar(50), data.uan_pf_number)
          .input('pranNumber', mssql.NVarChar(50), data.pran_nps_number)
          .query(`
            UPDATE bank_pf_nps SET
              number_of_bank_accounts = @numAccounts,
              bank_account_number = @accountNumber,
              ifsc_code = @ifsc,
              name_as_per_bank = @nameAsPerBank,
              bank_name = @bankName,
              branch = @branch,
              cancelled_cheque_url = @cancelledCheque,
              uan_pf_number = @uanNumber,
              pran_nps_number = @pranNumber,
              updated_at = GETDATE()
            WHERE fresher_id = @fresherId
          `);
      } else {
        // Insert
        await pool.request()
          .input('fresherId', mssql.Int, data.fresher_id)
          .input('numAccounts', mssql.Int, data.number_of_bank_accounts)
          .input('accountNumber', mssql.NVarChar(50), data.bank_account_number)
          .input('ifsc', mssql.NVarChar(20), data.ifsc_code)
          .input('nameAsPerBank', mssql.NVarChar(200), data.name_as_per_bank)
          .input('bankName', mssql.NVarChar(200), data.bank_name)
          .input('branch', mssql.NVarChar(200), data.branch)
          .input('cancelledCheque', mssql.NVarChar(500), data.cancelled_cheque_url)
          .input('uanNumber', mssql.NVarChar(50), data.uan_pf_number)
          .input('pranNumber', mssql.NVarChar(50), data.pran_nps_number)
          .query(`
            INSERT INTO bank_pf_nps 
            (fresher_id, number_of_bank_accounts, bank_account_number, ifsc_code, name_as_per_bank, 
             bank_name, branch, cancelled_cheque_url, uan_pf_number, pran_nps_number)
            VALUES 
            (@fresherId, @numAccounts, @accountNumber, @ifsc, @nameAsPerBank, 
             @bankName, @branch, @cancelledCheque, @uanNumber, @pranNumber)
          `);
      }
      
      console.log('✅ Bank/PF/NPS information saved successfully');
    } catch (error) {
      console.error('Error saving bank/pf/nps:', error);
      throw error;
    }
  }

  async getBankPfNps(fresherId: number): Promise<BankPfNps | null> {
    try {
      const pool = getMSSQLPool();
      const result = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query('SELECT * FROM bank_pf_nps WHERE fresher_id = @fresherId');
      
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error fetching bank/pf/nps:', error);
      throw error;
    }
  }
}

export const documentsService = new DocumentsService();
