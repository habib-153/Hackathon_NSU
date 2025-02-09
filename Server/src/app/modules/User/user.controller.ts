/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const userRegister = catchAsync(async (req, res) => {
  const user = await UserServices.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User Created Successfully',
    data: user,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await UserServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users Retrieved Successfully',
    data: users?.result,
    meta: users?.meta,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const user = await UserServices.getSingleUserFromDB(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User Retrieved Successfully',
    data: user,
  });
});

const followUser = catchAsync(async (req, res) => {
  const followingId = req.params.followingId
  const userData = req.user

  const result = await UserServices.addFollowingInDB(userData, followingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'You are now following this profile',
    data: result,
  });
})

const unfollowUser = catchAsync(async (req, res) => {
  const followingId = req.params.followingId
  const userData = req.user

  const result = await UserServices.removeFollowingFromDB(userData, followingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'You unfollow this profile',
    data: result,
  });
})

const getVerified = catchAsync(async (req, res) => {
  const result = await UserServices.getVerified(req.body, req.user);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Please Pay the amount to get verified',
    data: result
  });
});

const updateUser = catchAsync(async(req, res)=>{
  const { id } = req.params
  const result = await UserServices.updateUserIntoDB(req.body, id)
  sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User updated successfully',
      data: result
  })
})

const deleteUser = catchAsync(async(req, res)=>{
  const { id } = req.params
  const result = await UserServices.deleteUserFromDB(id)
  sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'User deleted successfully',
      data: null
  })
})

export const UserControllers = {
  getSingleUser,
  userRegister,
  getAllUsers,
  followUser,
  unfollowUser,
  getVerified,
  updateUser,
  deleteUser
};
