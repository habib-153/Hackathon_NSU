/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import httpStatus from 'http-status';
import { QueryBuilder } from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { UserSearchableFields } from './user.constant';
import { TUser } from './user.interface';
import { User } from './user.model';
import mongoose from 'mongoose';
import { initiatePayment } from '../../utils/payment';
const ObjectId = mongoose.Types.ObjectId;

const createUser = async (payload: TUser) => {
  const user = await User.create(payload);

  return user;
};

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const users = new QueryBuilder(User.find(), query)
    .fields()
    .paginate()
    .sort()
    .filter()
    .search(UserSearchableFields);

  const result = await users.modelQuery;
  const meta = await users.countTotal();

  return { result, meta };
};

const getSingleUserFromDB = async (id: string) => {
  const user = await User.findById(id)
    .populate({
      path: 'followers',
      select: 'name email profilePhoto status isVerified', // Select only needed fields
    })
    .populate({
      path: 'following',
      select: 'name email profilePhoto status isVerified',
    });

  return user;
};

const addFollowingInDB = async (
  userData: Record<string, unknown>,
  followingId: string
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");

  const isAlreadyFollowing = await User.findOne({
    _id,
    following: followingId,
  });
  if (isAlreadyFollowing)
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Already following this profile!'
    );

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await User.findByIdAndUpdate(
      _id,
      { $addToSet: { following: followingId } },
      { new: true, runValidators: true, session }
    ).populate('following');
    await User.findByIdAndUpdate(
      followingId,
      { $addToSet: { followers: _id } },
      { new: true, runValidators: true, session }
    ).populate('followers');
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const removeFollowingFromDB = async (
  userData: Record<string, unknown>,
  followingId: string
) => {
  const { _id } = userData;

  const user = await User.findById(_id as string);
  if (!user) throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");

  // Ensure followingId is ObjectId
  const followId = new ObjectId(followingId);

  if (!user?.following?.some((id) => id.equals(followId))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You are not following this profile!'
    );
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const result = await User.findByIdAndUpdate(
      user._id,
      { $pull: { following: followId } },
      { new: true, runValidators: true, session }
    );

    const result2 = await User.findByIdAndUpdate(
      followId,
      { $pull: { followers: user._id } },
      { new: true, runValidators: true, session }
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

const getVerified = async (
  payload: Partial<TUser>,
  userData: Record<string, unknown>
) => {
  const { email, _id } = userData;

  const user = await User.isUserExistsByEmail(email as string);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User doesn't exist!");
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const transactionId = `TXN-${Date.now()}`;

    const userInfo = {
      ...payload,
      transactionId,
    };

    const result = await User.findByIdAndUpdate(_id, userInfo, {
      new: true,
    });

    const paymentData = {
      transactionId: transactionId,
      amount: payload?.premiumCharge,
      customerName: user.name,
      customerEmail: user.email,
      customerMobile: user.mobileNumber,
    };

    const payment = await initiatePayment(paymentData);

    await session.commitTransaction();
    await session.endSession();

    return { payment, result };
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
  }
};

const updateUserIntoDB = async (payload: Partial<TUser>, id: string) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    new: true,
  });

  return result;
};

const deleteUserFromDB = async (id: string) => {
  const result = await User.findByIdAndDelete(id);

  return result;
};

export const UserServices = {
  createUser,
  getAllUsersFromDB,
  getSingleUserFromDB,
  addFollowingInDB,
  removeFollowingFromDB,
  getVerified,
  updateUserIntoDB,
  deleteUserFromDB,
};
