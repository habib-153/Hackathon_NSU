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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const QueryBuilder_1 = require("../../builder/QueryBuilder");
const comment_model_1 = require("./comment.model");
const createCommentIntoDB = (comment) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (yield comment_model_1.Comment.create(comment)).populate('user post');
    return result;
});
const getAllCommentOfAPost = (query, postId) => __awaiter(void 0, void 0, void 0, function* () {
    const comments = new QueryBuilder_1.QueryBuilder(comment_model_1.Comment.find({ post: postId }).populate([{ path: 'user' }, { path: 'post' }]), query)
        .paginate()
        .sort()
        .filter();
    //await Comment.find({post: postId}).populate('user post');
    const result = yield comments.modelQuery;
    const meta = comments.countTotal();
    return { result, meta };
});
const updateCommentIntoDB = (payload, id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_model_1.Comment.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
});
const deleteCommentFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield comment_model_1.Comment.findByIdAndDelete(id);
    return result;
});
exports.CommentService = {
    createCommentIntoDB,
    getAllCommentOfAPost,
    updateCommentIntoDB,
    deleteCommentFromDB,
};
