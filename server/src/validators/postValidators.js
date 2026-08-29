import {z} from 'zod';

export const createPostSchema = z.object({
    text: z.string().trim().min(1).max(500),
    image: z.url().optional(),
})

export const commentSchema = z.object({
    text: z.string().trim().min(1).max(300),
})