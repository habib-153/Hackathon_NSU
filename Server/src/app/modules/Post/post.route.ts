import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { PostControllers } from './post.controller';
import { parseBody } from '../../middlewares/bodyParser';
import { multerUpload } from '../../config/multer.config';
import { PostValidation } from './post.validation';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router.post(
  '/',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  multerUpload.single('image'),
  //validateImageFileRequest(ImageFilesArrayZodSchema),
  parseBody,
  validateRequest(PostValidation.createPostValidationSchema),
  PostControllers.createPost
);

router.get('/', PostControllers.getAllPost);

router.get('/:id', PostControllers.getSinglePost);

router.put(
  '/:id',
  multerUpload.single('image'),
  auth(USER_ROLE.USER),
  parseBody,
  validateRequest(PostValidation.updatePostValidationSchema),
  PostControllers.updatePost
);

router.delete('/:id', auth(USER_ROLE.USER, USER_ROLE.ADMIN), PostControllers.deletePost);
router.post('/:postId/upvote', auth(USER_ROLE.USER), PostControllers.addPostUpvote);
router.post('/:postId/downvote', auth(USER_ROLE.USER), PostControllers.addPostDownvote);
router.delete('/:postId/upvote', auth(USER_ROLE.USER), PostControllers.removePostUpvote);
router.delete('/:postId/downvote', auth(USER_ROLE.USER), PostControllers.removePostDownvote);

export const PostRoutes = router;