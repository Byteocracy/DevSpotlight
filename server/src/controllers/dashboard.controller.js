import jwt from "jsonwebtoken";
import mongoose, { mongo } from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Follow } from "../models/follow.model.js";
import { Project } from "../models/project.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Contribution } from "../models/contribution.model.js";

//user profile
const getProfile = asyncHandler(async (req, res) => {
  const userID = req.user._id;
  if (!userID) {
    throw new ApiError(400, "User Id is missing!");
  }

  const user = await User.findById(userID).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  return res.status(200).json(200, user, "User data fetched successfully!");
});
//all followers, count
const getFollowers = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "user ID is missing !");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found !");
  }

  const followers = Follow.aggregate([
    {
      $match: {
        following: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "following",
        foreignField: "_id",
        as: "followers",
      },
    },
    {
      $unwind: "$followers",
    },
    {
      $project: {
        userName: 1,
        avatar: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, followers, "Followers fetched successFully"));
});
//all following, count
const getFollowing = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "user ID is missing !");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found !");
  }

  const followers = Follow.aggregate([
    {
      $match: {
        follower: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "follower",
        foreignField: "_id",
        as: "following",
      },
    },
    {
      $unwind: "$following",
    },
    {
      $project: {
        userName: 1,
        avatar: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, following, "Following fetched successFully"));
});
//total visits
const totalVisits = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "user ID is missing !");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found !");
  }

  const totalVisits = await Project.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: null,
        count: {
          $sum: "$visits",
        },
      },
    },
    {
      $project: {
        count: 1,
      },
    },
  ]);
});

//total likes
const totalLikes = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "user ID is missing !");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found !");
  }

  const totalLikes = await Project.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "project",
        localField: "_id",
        as: "allLikes",
      },
    },
    {
      $unwind: "$allLikes",
    },
    {
      $count: "likesCount",
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, totalLikes, "Likes count fetched successfully!")
    );
});

//total comments
const totalComments = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "user ID is missing !");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found !");
  }

  const totalComments = await Comment.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "likes",
        foreignField: "comment",
        localField: "_id",
        as: "allLikes",
      },
    },
    {
      $unwind: "$allLikes",
    },
    {
      $count: "likesCount",
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        totalComments,
        "Total comment count fetched succesfully"
      )
    );
});

export {
  totalVisits,
  totalComments,
  totalLikes,
  getFollowers,
  getFollowing,
  getProfile,
};
