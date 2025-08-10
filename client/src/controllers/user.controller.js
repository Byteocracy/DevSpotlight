import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandlers.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";


const updateProfile = asyncHandler(async (req, res) => {
  const { userName, bio, email, fullName } = req.body;

  if (!fullName || !email || !bio) {
    throw new ApiError(400, "Full name, email, and bio are required");
  }

  let avatarUrl = undefined;
  let coverImageUrl = undefined;

  const avatarFile = req.files?.avatar?.[0];
  if (avatarFile) {
    const avatarUpload = await uploadOnCloudinary(avatarFile.path);
    avatarUrl = avatarUpload?.url;
  }

  const coverImageFile = req.files?.coverImage?.[0];
  if (coverImageFile) {
    const coverImageUpload = await uploadOnCloudinara2qy(coverImageFile.path);
    coverImageUrl = coverImageUpload?.url;
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        userName,
        fullName,
        email,
        bio,
        ...(avatarUrl && { avatar: avatarUrl }),
        ...(coverImageUrl && { coverImage: coverImageUrl }),
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Account detail updated successfully"));
});

const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, user, "Profile fetched successfully")
  );
});

const changeCurrentPassword = asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword} = req.body

 const user = await User.findById(req.user?._id)
 const isPasswordCorrect= await user.isPasswordCorrect(oldPassword)
  
 if(!isPasswordCorrect){
  throw new ApiError(400,"Invalid old password")
 }

 user.password = newPassword
 await user.save({validateBeforeSave : false})

 return res
 .status(200)
 .json(new ApiResponse(200,{},"Password is changed successfully"))
 
})

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
    .json(new ApiResponse(200, myProjects, "Favorite projects fetched successfully"));
});

const getMyContributedProjects = asyncHandler(async (req, res) => {
  const myContributedProjects = await Contribution.aggregate([
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
    .json(new ApiResponse(200, myProjects, "Contibution projects fetched successfully"));
});

const removeUserCoverImage = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: null,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover image removed succesfully"));
});

const removeUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: null,
      },
    },
    { new: true }
  ).select("-password");

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
    .json(new ApiResponse(200, null, "Your account has been deleted successfully"));
});


