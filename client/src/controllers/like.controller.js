import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandlers.js";
import ApiResponse from "../utils/apiResponse.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

//like-toggle project
const toggleLikedProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "Project ID is missing in params");
  }
  const userId = req.user._id;
  const isliked = await Like.findOne({ project: projectId, likeBy: userId });

  if (isliked) {
    await isliked.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "project unliked succesfylly!"));
  } else {
    const likedProject = await Like.create({
      project: projectId,
      comment: null,
      likeBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, likedProject, "Project Liked SuccessFully"));
  }
});
//toggle comment like
const toggleLikedComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const isliked = await Like.findOne({ comment: commentId, likeBy: userId });

  if (isliked) {
    await isliked.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment unliked succesfylly!"));
  } else {
    const likedComment = await Like.create({
      comment: commentId,
      project: null,
      likeBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, likedComment, "Comment Liked SuccessFully"));
  }
});
//get all likes on project
const getAllLikes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "Project ID is missing from params");
  }
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project Not Found !");
  }

  const likes = await Like.aggregate([
    {
      $match: {
        project: projectId,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likedBy",
        foreignField: "_id",
        as: "allLikes",
      },
    },
    {
      $unwind: "$allLikes",
    },
    {
      $project: {
        userName: "$allLikes.userName",
        avatar: "#$allLikes.avatar",
      },
    },
  ]);

  return res.status(200).json(20, likes, "Likes fetched successfully!");
});

export { toggleLikedComment, toggleLikedProject, getAllLikes };
