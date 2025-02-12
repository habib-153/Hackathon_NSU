import { Types } from "mongoose";
import { DISTRICTS } from "./post.constant";

type District = (typeof DISTRICTS)[number]

export type TPost = {
  title: string;
  description: string;
  image: string;
  author: Types.ObjectId;
  city: District;
  location: string;
  upVotes: Types.ObjectId[];
  downVotes: Types.ObjectId[];
  isDeleted: boolean;
  postDate: Date;
  crimeDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
};