"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
const http_status_1 = __importDefault(require("http-status"));
const QueryBuilder_1 = require("../../builder/QueryBuilder");
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_constant_1 = require("./user.constant");
const user_model_1 = require("./user.model");
const mongoose_1 = __importDefault(require("mongoose"));
const payment_1 = require("../../utils/payment");
const ObjectId = mongoose_1.default.Types.ObjectId;
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.create(payload);
    return user;
});
const getAllUsersFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const users = new QueryBuilder_1.QueryBuilder(user_model_1.User.find(), query)
        .fields()
        .paginate()
        .sort()
        .filter()
        .search(user_constant_1.UserSearchableFields);
    const result = yield users.modelQuery;
    const meta = yield users.countTotal();
    return { result, meta };
});
const getSingleUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id)
        .populate({
        path: 'followers',
        select: 'name email profilePhoto status isVerified', // Select only needed fields
    })
        .populate({
        path: 'following',
        select: 'name email profilePhoto status isVerified',
    });
    return user;
});
const addFollowingInDB = (userData, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    const isAlreadyFollowing = yield user_model_1.User.findOne({
        _id,
        following: followingId,
    });
    if (isAlreadyFollowing)
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Already following this profile!');
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield user_model_1.User.findByIdAndUpdate(_id, { $addToSet: { following: followingId } }, { new: true, runValidators: true, session }).populate('following');
        yield user_model_1.User.findByIdAndUpdate(followingId, { $addToSet: { followers: _id } }, { new: true, runValidators: true, session }).populate('followers');
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const removeFollowingFromDB = (userData, followingId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { _id } = userData;
    const user = yield user_model_1.User.findById(_id);
    if (!user)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    // Ensure followingId is ObjectId
    const followId = new ObjectId(followingId);
    if (!((_a = user === null || user === void 0 ? void 0 : user.following) === null || _a === void 0 ? void 0 : _a.some((id) => id.equals(followId)))) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'You are not following this profile!');
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const result = yield user_model_1.User.findByIdAndUpdate(user._id, { $pull: { following: followId } }, { new: true, runValidators: true, session });
        const result2 = yield user_model_1.User.findByIdAndUpdate(followId, { $pull: { followers: user._id } }, { new: true, runValidators: true, session });
        yield session.commitTransaction();
        return result;
    }
    catch (error) {
        yield session.abortTransaction();
        throw error;
    }
    finally {
        session.endSession();
    }
});
const getVerified = (payload, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    const session = yield mongoose_1.default.startSession();
    try {
        session.startTransaction();
        const transactionId = `TXN-${Date.now()}`;
        const userInfo = Object.assign(Object.assign({}, payload), { transactionId });
        const result = yield user_model_1.User.findByIdAndUpdate(_id, userInfo, {
            new: true,
        });
        const paymentData = {
            transactionId: transactionId,
            amount: payload === null || payload === void 0 ? void 0 : payload.premiumCharge,
            customerName: user.name,
            customerEmail: user.email,
            customerMobile: user.mobileNumber,
        };
        const payment = yield (0, payment_1.initiatePayment)(paymentData);
        yield session.commitTransaction();
        yield session.endSession();
        return { payment, result };
    }
    catch (error) {
        yield session.abortTransaction();
        yield session.endSession();
    }
});
const updateUserIntoDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deleteUserFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findByIdAndDelete(id);
    return result;
});
exports.UserServices = {
    createUser,
    getAllUsersFromDB,
    getSingleUserFromDB,
    addFollowingInDB,
    removeFollowingFromDB,
    getVerified,
    updateUserIntoDB,
    deleteUserFromDB,
};
