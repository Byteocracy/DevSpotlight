import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Project } from "../models/project.model.js";
import { Comment } from "../models/comment.model.js";

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const { projectId } = req.params;
  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const comment = await Comment.create({
    content: content.trim(),
    project: projectId,
    owner: req.user._id,
  });

  const createdComment = await Comment.findById(comment._id).populate(
    "owner",
    "userName fullName avatar"
  );

  return res
    .status(201)
    .json(new ApiResponse(201, createdComment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    throw new ApiError(400, "Comment content is required");
  }

  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (String(comment.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not allowed to update this comment");
  }

  comment.content = content.trim();
  await comment.save();

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (String(comment.owner) !== String(req.user._id)) {
    throw new ApiError(403, "You are not allowed to delete this comment");
  }

  await comment.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

const getAllComments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const comments = await Comment.find({ project: projectId })
    .sort({ createdAt: -1 })
    .populate("owner", "userName fullName avatar")
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

export { addComment, updateComment, deleteComment, getAllComments };
