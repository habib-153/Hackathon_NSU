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
const getVerified = (payload, userData) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, _id } = userData;
    const user = yield user_model_1.User.isUserExistsByEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "User doesn't exist!");
    }
    return user;
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
    getVerified,
    updateUserIntoDB,
    deleteUserFromDB,
};
