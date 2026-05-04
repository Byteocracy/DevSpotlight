import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Project } from "../models/project.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

const toggleLikedProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const userId = req.user._id;
  const isliked = await Like.findOne({ project: projectId, likeBy: userId });

  if (isliked) {
    await isliked.deleteOne();
    const likeCount = await Like.countDocuments({ project: projectId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { liked: false, likeCount },
          "Project unliked successfully"
        )
      );
  }

  await Like.create({
    project: projectId,
    comment: null,
    likeBy: userId,
  });

  const likeCount = await Like.countDocuments({ project: projectId });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { liked: true, likeCount },
        "Project liked successfully"
      )
    );
});

const toggleLikedComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const userId = req.user._id;

  const isliked = await Like.findOne({ comment: commentId, likeBy: userId });

  if (isliked) {
    await isliked.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, { liked: false }, "Comment unliked successfully"));
  }

  await Like.create({
    comment: commentId,
    project: null,
    likeBy: userId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { liked: true }, "Comment liked successfully"));
});

const getAllLikes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const likes = await Like.find({ project: projectId })
    .populate("likeBy", "userName fullName avatar")
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: likes.length,
        likes: likes.map((item) => item.likeBy).filter(Boolean),
      },
      "Likes fetched successfully"
    )
  );
});

export { toggleLikedComment, toggleLikedProject, getAllLikes };
