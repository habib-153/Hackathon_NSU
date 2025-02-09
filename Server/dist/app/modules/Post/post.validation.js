"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidation = void 0;
const zod_1 = require("zod");
const post_constant_1 = require("./post.constant");
const createPostValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
        image: zod_1.z.string().optional(),
        category: zod_1.z.enum([...post_constant_1.PostCategory], {
            required_error: 'Category is required',
        }),
        author: zod_1.z.string({ required_error: 'Author is required' }),
        status: zod_1.z.nativeEnum(post_constant_1.POST_STATUS, { required_error: 'Status is required' }),
        isDeleted: zod_1.z.boolean().optional(),
    }),
});
const updatePostValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }).optional(),
        description: zod_1.z.string({ required_error: 'Description is required' }).optional(),
        image: zod_1.z.string().optional(),
        category: zod_1.z.enum([...post_constant_1.PostCategory], {
            required_error: 'Category is required',
        }).optional(),
        status: zod_1.z.nativeEnum(post_constant_1.POST_STATUS, { required_error: 'Status is required' }).optional(),
        isDeleted: zod_1.z.boolean().optional(),
    })
});
exports.PostValidation = {
    createPostValidationSchema,
    updatePostValidationSchema,
};
