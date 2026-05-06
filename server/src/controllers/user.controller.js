import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Contribution } from "../models/contribution.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const updateProfile = asyncHandler(async (req, res) => {
  const { userName, bio, email, fullName } = req.body;
  const updates = {};

  if (typeof userName === "string" && userName.trim()) {
    updates.userName = userName.trim().toLowerCase();
  }
  if (typeof fullName === "string" && fullName.trim()) {
    updates.fullName = fullName.trim();
  }
  if (typeof email === "string" && email.trim()) {
    updates.email = email.trim().toLowerCase();
  }
  if (typeof bio === "string") {
    updates.bio = bio.trim();
  }

  if (Object.keys(updates).length === 0 && !req.files?.avatar?.[0] && !req.files?.coverImage?.[0]) {
    throw new ApiError(400, "At least one profile field or image is required");
  }

  const duplicateChecks = [
    ...(updates.userName ? [{ userName: updates.userName }] : []),
    ...(updates.email ? [{ email: updates.email }] : []),
  ];

  const duplicateUser = duplicateChecks.length
    ? await User.findOne({
        _id: { $ne: req.user._id },
        $or: duplicateChecks,
      })
    : null;

  if (duplicateUser) {
    throw new ApiError(400, "Username or email is already in use");
  }

  let avatarUrl = undefined;
  let coverImageUrl = undefined;

  const avatarFile = req.files?.avatar?.[0];
  if (avatarFile) {
    const avatarUpload = await uploadOnCloudinary(avatarFile.path);
    if (!avatarUpload?.secure_url) {
      throw new ApiError(500, "Avatar upload failed");
    }
    avatarUrl = avatarUpload.secure_url;
  }

  const coverImageFile = req.files?.coverImage?.[0];
  if (coverImageFile) {
    const coverImageUpload = await uploadOnCloudinary(coverImageFile.path);
    if (!coverImageUpload?.secure_url) {
      throw new ApiError(500, "Cover image upload failed");
    }
    coverImageUrl = coverImageUpload.secure_url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        ...updates,
        ...(avatarUrl && { avatar: avatarUrl }),
        ...(coverImageUrl && { coverImage: coverImageUrl }),
      },
    },
    { new: true, runValidators: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "Account detail updated successfully")
    );
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, user, "Profile fetched successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password is changed successfully"));
});

const getMyProjects = asyncHandler(async (req, res) => {
  const myProjects = await Project.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $sort: { createdAt: -1 }, // optional: most recent first
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, myProjects, "Projects fetched successfully"));
});

const getMyFavoriteProjects = asyncHandler(async (req, res) => {
  const myFavoriteProjects = await Favorite.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(200, myProjects, "Favorite projects fetched successfully")
    );
});

const getMyContributedProjects = asyncHandler(async (req, res) => {
  const myContributedProjects = await Contribution.aggregate([
    {
      $match: {
        contributor: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
  ]);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        myProjects,
        "Contibution projects fetched successfully"
      )
    );
});

const removeUserCoverImage = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: "",
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image removed succesfully"));
});

const removeUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar:
          "https://ui-avatars.com/api/?name=Dev+Spotlight&background=111827&color=f8fafc",
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image removed succesfully"));
});

const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Your account has been deleted successfully")
    );
});

export {
  updateProfile,
  changeCurrentPassword,
  removeUserAvatar,
  removeUserCoverImage,
  deleteProfile,
  getMyProfile,
  getMyProjects,
  getMyFavoriteProjects,
  getMyContributedProjects,
};
