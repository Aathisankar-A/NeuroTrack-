import { z } from 'zod';

export const createTaskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100),
    subject: z.string().min(1, 'Subject is required').max(50),
    difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
    notes: z.string().optional(),
    status: z.enum(['pending', 'completed']).default('pending'),
    dueDate: z.string().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
    timeSpent: z.number().min(0).optional(),
});
