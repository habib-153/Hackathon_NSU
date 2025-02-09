import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { TImageFile } from '../../interfaces/image.interface';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PostServices } from './post.service';

const createPost = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'Please upload an image');
  }

  const result = await PostServices.createPostIntoDB(
    req.body,
    req.file as TImageFile
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post created successfully',
    data: result,
  });
});

const getAllPost = catchAsync(async (req, res) => {
  const result = await PostServices.getAllPostsFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Posts retrieved successfully',
    data: result.data,
    meta: result.meta,
  });
});

const getSinglePost = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await PostServices.getSinglePostFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post retrieved successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await PostServices.updatePostIntoDB(id, req.body , req.file as TImageFile);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const { id } = req.params;
  await PostServices.deletePostFromDB(id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Post deleted successfully',
    data: null,
  });
});

const addPostUpvote = catchAsync(async (req, res) => {
  const result = await PostServices.addPostUpvoteIntoDB(
    req.params.postId,
    req.user,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Thanks for your upvote',
    data: result,
  });
});

const addPostDownvote = catchAsync(async (req, res) => {
  const result = await PostServices.addPostDownvoteIntoDB(
    req.params.postId,
    req.user,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Thanks for your vote',
    data: result,
  });
});

const removePostUpvote = catchAsync(async (req, res) => {
  const result = await PostServices.removePostUpvoteFromDB(
    req.params.postId,
    req.user,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Upvote removed',
    data: result,
  });
});

const removePostDownvote = catchAsync(async (req, res) => {
  const result = await PostServices.removePostDownvoteFromDB(
    req.params.postId,
    req.user,
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Downvote removed',
    data: result,
  });
});

export const PostControllers = {
  createPost,
  getAllPost,
  getSinglePost,
  updatePost,
  deletePost,
  addPostUpvote,
  addPostDownvote,
  removePostUpvote,
  removePostDownvote,
};
