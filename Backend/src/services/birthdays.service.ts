import { getMSSQLPool } from '../config/database';
import mssql from 'mssql';

export interface BirthdayRecord {
  id: number; // fresher_id
  fullName: string;
  email: string;
  dateOfBirth: string; // ISO string
  dobDisplay: string; // DD-MMM
  dayOfWeek: string; // Monday, etc.
  dayOfMonth: number;
}

class BirthdaysService {
  async getBirthdaysForMonth(month: number): Promise<BirthdayRecord[]> {
    try {
      const pool = getMSSQLPool();
      
      // Fetch all birthdays for the given month from freshers table using date_of_birth
      const result = await pool.request()
        .input('month', mssql.Int, month)
        .query(`
          SELECT 
            id,
            first_name,
            last_name,
            email,
            date_of_birth
          FROM dbo.freshers
          WHERE date_of_birth IS NOT NULL
            AND MONTH(CONVERT(DATE, date_of_birth)) = @month
          ORDER BY DAY(CONVERT(DATE, date_of_birth)) ASC
        `);

      const rows = result.recordset || [];
      console.log(`✅ Found ${rows.length} birthdays in month ${month}`);
      
      return rows
        .filter((r: any) => r.first_name && r.last_name && r.id) // Filter out incomplete records
        .map((r: any) => {
          const dob = new Date(r.date_of_birth);
          const dayOfMonth = dob.getDate();
          const dobDisplay = dob.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
          const dayOfWeek = dob.toLocaleDateString('en-GB', { weekday: 'long' });
          return {
            id: r.id,
            fullName: `${r.first_name} ${r.last_name}`.trim(),
            email: r.email || '',
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

  // Return debug info: raw freshers rows
  async getBirthdaysDebug(month: number): Promise<{ freshersRows: any[] }> {
    try {
      const pool = getMSSQLPool();
      const freshersResult = await pool.request()
        .input('month', mssql.Int, month)
        .query(`
          SELECT TOP 100 
            id, 
            first_name,
            last_name,
            date_of_birth
          FROM dbo.freshers
          WHERE date_of_birth IS NOT NULL
            AND MONTH(CONVERT(DATE, date_of_birth)) = @month
        `);
      const freshersRows = freshersResult.recordset || [];

      return { freshersRows };
    } catch (error) {
      console.error('BirthdaysService.getBirthdaysDebug error:', error);
      throw error;
    }
  }

  // Inspect all actual data in freshers table to understand the real structure
  async inspectAllData(): Promise<any> {
    try {
      const pool = getMSSQLPool();
      
      // Get ALL freshers records with date_of_birth
      const freshersAll = await pool.request().query(`
        SELECT TOP 50
          id,
          first_name,
          last_name,
          date_of_birth
        FROM dbo.freshers
        ORDER BY id DESC
      `);

      // Try to find birthdays for current month from freshers table
      const currentMonth = new Date().getMonth() + 1;
      const monthBirthdays = await pool.request()
        .input('month', mssql.Int, currentMonth)
        .query(`
          SELECT TOP 50
            id,
            first_name,
            last_name,
            date_of_birth,
            MONTH(CONVERT(DATE, date_of_birth)) as dob_month,
            DAY(CONVERT(DATE, date_of_birth)) as dob_day
          FROM dbo.freshers
          WHERE date_of_birth IS NOT NULL
            AND MONTH(CONVERT(DATE, date_of_birth)) = @month
          ORDER BY DAY(CONVERT(DATE, date_of_birth)) ASC
        `);

      return {
        freshers_all: freshersAll.recordset,
        current_month_birthdays: monthBirthdays.recordset,
        notes: 'Now using dbo.freshers table with date_of_birth column for birthdays.'
      };
    } catch (error) {
      console.error('BirthdaysService.inspectAllData error:', error);
      throw error;
    }
  }
}

export const birthdaysService = new BirthdaysService();
