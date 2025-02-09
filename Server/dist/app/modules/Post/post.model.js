"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = require("mongoose");
const post_constant_1 = require("./post.constant");
const postSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true, enum: { values: post_constant_1.PostCategory, message: '{VALUE} is not supported' } },
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: Object.keys(post_constant_1.POST_STATUS), default: post_constant_1.POST_STATUS.BASIC },
    upVotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    downVotes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Post = (0, mongoose_1.model)('Post', postSchema);
