import {z} from 'zod';

export const registerSchema = z.object({
    username: z.string().trim().min(3).max(30),
    email: z.email().trim(),
    password: z.string().min(6),
})

export const loginSchema = z.object({
    email: z.email().trim(),
    password: z.string().min(1, 'Password is required')
})