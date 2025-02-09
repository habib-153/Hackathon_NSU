import express from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';

const router = express.Router();

export const UserRoutes = router;

router.post(
  '/create-user',
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.createUserValidationSchema),
  UserControllers.userRegister
);

router.put(
  '/get-verified',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  UserControllers.getVerified
);

router.get('/', auth(USER_ROLE.ADMIN), UserControllers.getAllUsers);
router.get('/:id', UserControllers.getSingleUser);
router.put('/:id', auth(USER_ROLE.ADMIN, USER_ROLE.USER), UserControllers.updateUser);
router.delete('/:id', auth(USER_ROLE.ADMIN), UserControllers.deleteUser);
router.post(
  '/follow/:followingId',
  auth(USER_ROLE.USER),
  UserControllers.followUser
);
router.delete(
  '/unfollow/:followingId',
  auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  UserControllers.unfollowUser
);
