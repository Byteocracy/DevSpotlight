import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Project from "../models/project.model.js";
import Comment from "../models/comment.model.js";

export const getAllUsers = async (req, res) => {
  const users = await User.find();
  if (!users.length) {
    throw new ApiError(404, "No users found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
};

export const getAllProjects = async (req, res) => {
  const projects = await Project.find().populate("owner", "name email");
  if (!projects.length) {
    throw new ApiError(404, "No projects found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, projects, "Projects fetched successfully"));
};

export const getAllComments = async (req, res) => {
  const comments = await Comment.find()
    .populate("author", "name email")
    .populate("project", "title");
  if (!comments.length) {
    throw new ApiError(404, "No comments found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  await user.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, null, "User deleted successfully"));
};

export const deleteProject = async (req, res) => {
  const { id } = req.params;
  const project = await Project.findById(id);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  await project.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Project deleted successfully"));
};

export const deleteComment = async (req, res) => {
  const { id } = req.params;
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }
  await comment.deleteOne();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
};

//tempo ban and permenent ban 
export const banUser = async (req, res) => {
    const { userId } = req.params;
    const { duration, unit } = req.body; 
  

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    user.isBanned = true;

    if (unit !== "permanent") {
        const now = new Date();
        if (unit === "days") now.setDate(now.getDate() + duration);
        else if (unit === "hours") now.setHours(now.getHours() + duration);
        else if (unit === "minutes") now.setMinutes(now.getMinutes() + duration);
        user.banExpiresAt = now;
    } else {
        user.banExpiresAt = null; 
    }

    await user.save();

    res.status(200).json(
        new ApiResponse(200, { 
            message: unit === "permanent" 
                ? `User permanently banned` 
                : `User banned until ${user.banExpiresAt}`, 
            user 
        })
    );
};

export { 
    getAllUsers,
    getAllProjects,
    getAllComments,
    deleteComment,deleteProject,
    deleteUser,
    banUser
}