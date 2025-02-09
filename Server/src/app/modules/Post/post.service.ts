/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { TPost } from './post.interface';
import AppError from '../../errors/AppError';
import { Post } from './post.model';
import { TImageFile } from '../../interfaces/image.interface';
import { User } from '../User/user.model';
import { Types } from 'mongoose';
import mongoose from 'mongoose';

const createPostIntoDB = async (payload: Partial<TPost>, image: TImageFile) => {
  if (image) {
    payload.image = image.path;
  }

  const user = await User.findById(payload.author);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  const result = (await Post.create(payload)).populate('author');
  await User.findByIdAndUpdate(user?._id, { $inc: { postCount: 1 } });

  return result;
};

const getAllPostsFromDB = async (query: Record<string, unknown>) => {
  const { sort, searchTerm, category, page = 1, limit = 10 } = query;

  const pageNumber = Math.max(Number(page), 1);
  const limitNumber = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * limitNumber;

  const aggregationPipeline: any[] = [
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: {
        path: '$author',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        upvoteCount: { $size: '$upVotes' },
        downvoteCount: { $size: '$downVotes' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'upVotes',
        foreignField: '_id',
        as: 'upVotes',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'downVotes',
        foreignField: '_id',
        as: 'downVotes',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author.followers',
        foreignField: '_id',
        as: 'author.followers',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author.following',
        foreignField: '_id',
        as: 'author.following',
      }
    }
  ];

  if (searchTerm) {
    const searchRegex = new RegExp(searchTerm as string, 'i');
    aggregationPipeline.push({
      $match: {
        $or: [
          { title: searchRegex },
          { category: searchRegex },
          { 'author.name': searchRegex },
          { 'author.email': searchRegex },
        ],
      },
    } as any);
  }

  if (category) {
    aggregationPipeline.push({
      $match: { category },
    } as any);
  }

  if (sort === 'upvotes' || sort === 'downvotes') {
    aggregationPipeline.push({
      $sort: sort === 'upvotes' ? { upvoteCount: -1 } : { downvoteCount: -1 },
    } as any);
  }

  aggregationPipeline.push(
    { $skip: skip },
    { $limit: limitNumber }
  );

  const result = await Post.aggregate(aggregationPipeline);

  const totalDocuments = await Post.countDocuments();
  const totalPage = Math.ceil(totalDocuments / limitNumber);

  // Return result with meta information
  return {
    data: result,
    meta: {
      page: pageNumber,
      limit: limitNumber,
      total: totalDocuments,
      totalPage,
    },
  };
};

const getSinglePostFromDB = async (id: string) => {
  const aggregationPipeline: any[] = [
    {
      $match: {
        _id: new Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: {
        path: '$author',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        upvoteCount: { $size: '$upVotes' },
        downvoteCount: { $size: '$downVotes' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'upVotes',
        foreignField: '_id',
        as: 'upVotes',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'downVotes',
        foreignField: '_id',
        as: 'downVotes',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author.followers',
        foreignField: '_id',
        as: 'author.followers',
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'author.following',
        foreignField: '_id',
        as: 'author.following',
      }
    }
  ];

  const result = await Post.aggregate(aggregationPipeline);

  return result.length > 0 ? result[0] : null;
};

const updatePostIntoDB = async (
  id: string,
  payload: Partial<TPost>,
  image: TImageFile
) => {
  const postData = await Post.findById(id);

  if (!postData) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (image) {
    payload.image = image.path;
  }

  const result = await Post.findByIdAndUpdate(id, payload, {
    runValidators: true, new: true
  })

  return result;
};

const deletePostFromDB = async (id: string) => {
  const result = await Post.findByIdAndDelete(id, { isDeleted: true });
  return result;
};

const addPostUpvoteIntoDB = async (
  postId: string,
  userData: Record<string, unknown>
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");

  const post = await Post.findById(postId);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post doesn't exist!");

  const userId = new Types.ObjectId(_id as string);

  if (post.upVotes.some((upvoteId) => upvoteId.equals(userId))) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You already upvote this post!');
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (post.downVotes.some((downvoteId) => downvoteId.equals(userId))) {
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { downVotes: _id } },
        { new: true, runValidators: true, session }
      );
    }

    const result = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { upVotes: _id } },
      { new: true, runValidators: true, session }
    ).populate('upVotes');
    await User.findByIdAndUpdate(
      post.author,
      { $inc: { totalUpVotes: 1 } },
      { new: true, session }
    );

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const removePostUpvoteFromDB = async (
  postId: string,
  userData: Record<string, unknown>
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");

  const post = await Post.findById(postId);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post doesn't exist!");

  const userId = new Types.ObjectId(_id as string);

  if (!post.upVotes.some((upvoteId) => upvoteId.equals(userId))) {
    throw new AppError(httpStatus.BAD_REQUEST, "You haven't upvote this post!");
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const result = await Post.findByIdAndUpdate(
      postId,
      { $pull: { upVotes: _id } },
      { new: true, runValidators: true, session }
    ).populate('upVotes');
    await User.findByIdAndUpdate(
      post.author,
      { $inc: { totalUpVotes: -1 } },
      { new: true, session }
    );

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const addPostDownvoteIntoDB = async (
  postId: string,
  userData: Record<string, unknown>
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");

  const post = await Post.findById(postId);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post doesn't exist!");

  const userId = new Types.ObjectId(_id as string);

  if (post.downVotes.some((downvoteId) => downvoteId.equals(userId))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You already downvote this post!'
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    if (post.upVotes.some((upvoteId) => upvoteId.equals(userId))) {
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { upVotes: _id } },
        { new: true, runValidators: true, session }
      );
    }

    const result = await Post.findByIdAndUpdate(
      postId,
      { $addToSet: { downVotes: _id } },
      { new: true, runValidators: true, session }
    ).populate('downVotes');

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const removePostDownvoteFromDB = async (
  postId: string,
  userData: Record<string, unknown>
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");

  const post = await Post.findById(postId);
  if (!post) throw new AppError(httpStatus.NOT_FOUND, "Post doesn't exist!");

  const userId = new Types.ObjectId(_id as string);

  if (!post.downVotes.some((downvoteId) => downvoteId.equals(userId))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You have't downvote this post!"
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    const result = await Post.findByIdAndUpdate(
      postId,
      { $pull: { downVotes: _id } },
      { new: true, runValidators: true, session }
    ).populate('downVotes');

    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const PostServices = {
  createPostIntoDB,
  getAllPostsFromDB,
  getSinglePostFromDB,
  updatePostIntoDB,
  deletePostFromDB,
  addPostUpvoteIntoDB,
  removePostUpvoteFromDB,
  addPostDownvoteIntoDB,
  removePostDownvoteFromDB,
};
