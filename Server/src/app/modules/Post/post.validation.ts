import { z } from 'zod';
import { POST_STATUS, PostCategory } from './post.constant';

const createPostValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    image: z.string().optional(),
    category: z.enum([...PostCategory] as [string, ...string[]], {
      required_error: 'Category is required',
    }),
    author: z.string({ required_error: 'Author is required' }),
    status: z.nativeEnum(POST_STATUS, { required_error: 'Status is required' }),
    isDeleted: z.boolean().optional(),
  }),
});

const updatePostValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).optional(),
    description: z.string({ required_error: 'Description is required' }).optional(),
    image: z.string().optional(),
    category: z.enum([...PostCategory] as [string, ...string[]], {
      required_error: 'Category is required',
    }).optional(),
    status: z.nativeEnum(POST_STATUS, { required_error: 'Status is required' }).optional(),
    isDeleted: z.boolean().optional(),
})
})

export const PostValidation = {
    createPostValidationSchema,
    updatePostValidationSchema,
}