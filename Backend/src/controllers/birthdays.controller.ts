import { Request, Response } from 'express';
import { birthdaysService } from '../services/birthdays.service';

export async function getMonthlyBirthdays(req: Request, res: Response) {
  try {
    const month = new Date().getMonth() + 1; // 1-12
    const results = await birthdaysService.getBirthdaysForMonth(month);
    return res.status(200).json({ success: true, data: results });
  } catch (error) {
    console.error('Error fetching monthly birthdays:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch birthdays' });
  }
}

// Debug endpoint that returns raw DB rows to help troubleshooting
export async function getMonthlyBirthdaysDebug(req: Request, res: Response) {
  try {
    const month = new Date().getMonth() + 1;
    const debug = await birthdaysService.getBirthdaysDebug(month);
    return res.status(200).json({ success: true, debug });
  } catch (error) {
    console.error('Error fetching monthly birthdays debug:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to fetch debug info' });
  }
}

// Raw data inspection endpoint - inspect actual data in tables
export async function inspectAllData(req: Request, res: Response) {
  try {
    const data = await birthdaysService.inspectAllData();
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error inspecting data:', error);
    return res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Failed to inspect data' });
  }
}
