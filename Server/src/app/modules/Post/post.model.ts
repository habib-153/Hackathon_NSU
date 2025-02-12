import { model, Schema } from "mongoose";
import { TPost } from "./post.interface";

const postSchema = new Schema<TPost>({
    title: {type: String, required: true},
    description: {type: String, required: true},
    image: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    upVotes:[ {type: Schema.Types.ObjectId, ref: 'User'}],
    downVotes: [{type: Schema.Types.ObjectId, ref: 'User'}],
    city: {type: String, required: true},
    location: {type: String, required: true},
    postDate: {type: Date, required: true},
    crimeDate: {type: Date, required: true},
    isDeleted: {type: Boolean, default: false},
},
{
    timestamps: true,
    versionKey: false,
})

export const Post = model<TPost>('Post', postSchema);