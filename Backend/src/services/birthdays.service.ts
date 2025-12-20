import { getMSSQLPool } from '../config/database';
import mssql from 'mssql';

export interface BirthdayRecord {
  id: number; // fresher_id
  fullName: string;
  dateOfBirth: string; // ISO string
  dobDisplay: string; // DD-MMM
  dayOfWeek: string; // Monday, etc.
  dayOfMonth: number;
}

class BirthdaysService {
  async getBirthdaysForMonth(month: number): Promise<BirthdayRecord[]> {
    try {
      const pool = getMSSQLPool();
      
      // Fetch all birthdays for the given month from bgv_demographics with fresher_id via bgv_submissions
      const result = await pool.request()
        .input('month', mssql.Int, month)
        .query(`
          SELECT 
            bs.fresher_id as id,
            bd.first_name,
            bd.last_name,
            bd.celebrated_dob
          FROM dbo.bgv_demographics bd
          INNER JOIN dbo.bgv_submissions bs ON bd.submission_id = bs.id
          WHERE bd.celebrated_dob IS NOT NULL
            AND MONTH(CONVERT(DATE, bd.celebrated_dob)) = @month
          ORDER BY DAY(CONVERT(DATE, bd.celebrated_dob)) ASC
        `);

      const rows = result.recordset || [];
      console.log(`✅ Found ${rows.length} birthdays in month ${month}`);
      
      return rows
        .filter((r: any) => r.first_name && r.last_name && r.id) // Filter out incomplete records
        .map((r: any) => {
          const dob = new Date(r.celebrated_dob);
          const dayOfMonth = dob.getDate();
          const dobDisplay = dob.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const dayOfWeek = dob.toLocaleDateString('en-GB', { weekday: 'long' });
          return {
            id: r.id,
            fullName: `${r.first_name} ${r.last_name}`.trim(),
            dateOfBirth: dob.toISOString(),
            dobDisplay,
            dayOfWeek,
            dayOfMonth
          } as BirthdayRecord;
        });
    } catch (error) {
      console.error('BirthdaysService.getBirthdaysForMonth error:', error);
      throw error;
    }
  }

  // Return debug info: raw bgv_demographics rows and joined rows
  async getBirthdaysDebug(month: number): Promise<{ bgvRows: any[]; joinedRows: any[] }> {
    try {
      const pool = getMSSQLPool();
      const bgvResult = await pool.request()
        .input('month', mssql.Int, month)
        .query(`
          SELECT TOP 100 
            bd.id, 
            bs.fresher_id, 
            bd.celebrated_dob
          FROM dbo.bgv_demographics bd
          INNER JOIN dbo.bgv_submissions bs ON bd.submission_id = bs.id
          WHERE bd.celebrated_dob IS NOT NULL
            AND MONTH(CONVERT(DATE, bd.celebrated_dob)) = @month
        `);
      const bgvRows = bgvResult.recordset || [];

      const joinResult = await pool.request()
        .input('month', mssql.Int, month)
        .query(`
          SELECT 
            bs.fresher_id, 
            bd.first_name, 
            bd.last_name, 
            bd.celebrated_dob
          FROM dbo.bgv_demographics bd
          INNER JOIN dbo.bgv_submissions bs ON bd.submission_id = bs.id
          WHERE bd.celebrated_dob IS NOT NULL
            AND MONTH(CONVERT(DATE, bd.celebrated_dob)) = @month
          ORDER BY DAY(CONVERT(DATE, bd.celebrated_dob)) ASC
        `);
      const joinedRows = joinResult.recordset || [];

      return { bgvRows, joinedRows };
    } catch (error) {
      console.error('BirthdaysService.getBirthdaysDebug error:', error);
      throw error;
    }
  }

  // Inspect all actual data in both tables to understand the real structure
  async inspectAllData(): Promise<any> {
    try {
      const pool = getMSSQLPool();
      
      // Get ALL bgv_demographics records with fresher_id from bgv_submissions
      const bgvAll = await pool.request().query(`
        SELECT TOP 50
          bd.id,
          bs.fresher_id,
          bd.celebrated_dob,
          bd.first_name,
          bd.last_name
        FROM dbo.bgv_demographics bd
        INNER JOIN dbo.bgv_submissions bs ON bd.submission_id = bs.id
        ORDER BY bd.id DESC
      `);

      // Get ALL freshers records with any date fields
      const freshersAll = await pool.request().query(`
        SELECT TOP 50
          id,
          first_name,
          last_name,
          date_of_birth
        FROM dbo.freshers
        ORDER BY id DESC
      `);

      // Try to find bgv_demographics birthdays for current month
      const currentMonth = new Date().getMonth() + 1;
      const monthBirthdays = await pool.request()
        .input('month', mssql.Int, currentMonth)
        .query(`
          SELECT TOP 50
            bs.fresher_id,
            bd.first_name,
            bd.last_name,
            bd.celebrated_dob,
            MONTH(CONVERT(DATE, bd.celebrated_dob)) as dob_month,
            DAY(CONVERT(DATE, bd.celebrated_dob)) as dob_day
          FROM dbo.bgv_demographics bd
          INNER JOIN dbo.bgv_submissions bs ON bd.submission_id = bs.id
          WHERE bd.celebrated_dob IS NOT NULL
            AND MONTH(CONVERT(DATE, bd.celebrated_dob)) = @month
          ORDER BY DAY(CONVERT(DATE, bd.celebrated_dob)) ASC
        `);

      return {
        bgv_demographics_all: bgvAll.recordset,
        freshers_all: freshersAll.recordset,
        current_month_birthdays: monthBirthdays.recordset,
        notes: 'bgv_demographics stores celebrated_dob and is linked to freshers via bgv_submissions table.'
      };
    } catch (error) {
      console.error('BirthdaysService.inspectAllData error:', error);
      throw error;
    }
  }
}

export const birthdaysService = new BirthdaysService();
