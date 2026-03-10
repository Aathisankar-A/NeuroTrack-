import { z } from 'zod';

export const createSessionSchema = z.object({
    subject: z.string().min(1, 'Subject is required').max(50),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
    startTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:mm)'),
    duration: z.number().min(1, 'Duration must be at least 1 minute'),
});
