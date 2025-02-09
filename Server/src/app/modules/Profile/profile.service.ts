import { JwtPayload } from "jsonwebtoken";
import { User } from "../User/user.model";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { TImageFile } from "../../interfaces/image.interface";
import { TUserProfileUpdate } from "./profile.interface";

const getMyProfile = async (user: JwtPayload) => {
    const profile = await User.findOne({
        email: user.email,
    })
    .populate({
        path: 'followers',
        select: 'name email profilePhoto status isVerified', // Select only needed fields
    })
    .populate({
        path: 'following',
        select: 'name email profilePhoto status isVerified',
    });

    if (!profile) {
        throw new AppError(httpStatus.NOT_FOUND, "User does not exixts!")
    };

    return profile;
};

const updateMyProfile = async (
    user: JwtPayload,
    data: Partial<TUserProfileUpdate>,
    profilePhoto: TImageFile
) => {
    const filter = {
        email: user.email,
    };

    const profile = await User.findOne(filter);

    if (!profile) {
        throw new AppError(httpStatus.NOT_FOUND, "User profile does not exixts!")
    };

    if (profilePhoto) {
        data.profilePhoto = profilePhoto.path
    }
    else {
        delete data.profilePhoto;
    };

    return await User.findOneAndUpdate(filter, data, { new: true });
};

export const ProfileServices = {
    getMyProfile,
    updateMyProfile
}