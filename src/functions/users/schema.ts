import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  // Add other fields like preferences or language settings here later
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
