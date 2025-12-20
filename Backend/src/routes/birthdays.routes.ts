import { Router } from 'express';
import { getMonthlyBirthdays, getMonthlyBirthdaysDebug, inspectAllData } from '../controllers/birthdays.controller';

const router = Router();

// GET /api/birthdays/monthly
router.get('/monthly', getMonthlyBirthdays);
// GET /api/birthdays/debug
router.get('/debug', getMonthlyBirthdaysDebug);
// GET /api/birthdays/inspect - see actual data in tables
router.get('/inspect', inspectAllData);

export { router as birthdaysRoutes };
