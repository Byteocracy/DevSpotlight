import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Comment } from "../models/comment.model.js";

//add comment
const addComment = asyncHandler(async (req, res) => {
  //project id validation
  const { content } = req.body;
  if (!content || !content.trim()) {
    throw new ApiError(400, "field is empty !");
  }

  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "Project ID is missing from params!");
  }
  //project validation
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found !");
  }
  //add comment
  const comment = await Comment.create({
    content,
    projectId,
    owner: req.user._id,
  });

  if (!comment) {
    throw new ApiError(400, "Something went wrong ! comment failed !");
  }
  //send response
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added succesfully!"));
});

//update
const updateComment = asyncHandler(async (req, res) => {
  //comment id validation
  const { content } = req.body;
  if (!content || !content.trim()) {
    throw new ApiError(400, "field is empty !");
  }

  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment ID is missing from params!");
  }

  //comment validation
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found !");
  }

  //update comment
  comment.content = content;

  const updatedComment = await comment.save({ validateBeforeSave: false });

  if (!updatedComment) {
    throw new ApiError(400, "Comment update failed !");
  }

  return res
    .status(200)
    .json(200, updatedComment, "Comment updated successFully!");
});

//delete
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "comment ID is missing from params");
  }

  const userId = req.user._id;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }

  await comment.deleteOne();

  return res.status(200).json(200, {}, "comment deleted Successfully!");
});

//get all comments
const getAllComments = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError(400, "Project ID is missing from params!");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found!");
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: "$user",
    },
    {
      $project: {
        content: 1,
        createdAt: 1,
        userName: "$user.userName",
        avatar: "$user.avatar",
      },
    },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched Successfully!"));
});

export { addComment, updateComment, deleteComment, getAllComments };
