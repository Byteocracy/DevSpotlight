import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Project } from "../models/project.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";

const parseStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => `${item}`.trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const validateOptionalUrl = (value, fieldName) => {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return url.toString();
  } catch {
    throw new ApiError(400, `${fieldName} must be a valid URL`);
  }
};

const buildProjectPayload = (project, extra = {}) => ({
  _id: project._id,
  title: project.title,
  description: project.description,
  techStack: project.techStack,
  githubLink: project.githubLink,
  liveLink: project.liveLink,
  images: project.images,
  userId: project.userId,
  visits: project.visits,
  createdAt: project.createdAt,
  updatedAt: project.updatedAt,
  ...extra,
});

const createProject = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title?.trim() || !description?.trim()) {
    throw new ApiError(400, "Title and description are required");
  }

  const project = await Project.create({
    title: title.trim(),
    description: description.trim(),
    techStack: parseStringArray(req.body.techStack),
    githubLink: validateOptionalUrl(req.body.githubLink?.trim(), "githubLink"),
    liveLink: validateOptionalUrl(req.body.liveLink?.trim(), "liveLink"),
    images: parseStringArray(req.body.images),
    userId: req.user._id,
  });

  const createdProject = await Project.findById(project._id).populate(
    "userId",
    "userName fullName avatar"
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        buildProjectPayload(createdProject),
        "Project created successfully"
      )
    );
});

const getAllProjects = asyncHandler(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page ?? "1", 10), 1);
  const limit = Math.min(
    Math.max(Number.parseInt(req.query.limit ?? "6", 10), 1),
    24
  );
  const skip = (page - 1) * limit;
  const query = req.query.query?.trim();
  const match = {};

  if (query) {
    match.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { techStack: { $elemMatch: { $regex: query, $options: "i" } } },
    ];
  }

  const [projects, total] = await Promise.all([
    Project.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "userName fullName avatar")
      .lean(),
    Project.countDocuments(match),
  ]);

  const projectIds = projects.map((project) => project._id);
  const [likes, comments] = await Promise.all([
    Like.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: "$project", count: { $sum: 1 } } },
    ]),
    Comment.aggregate([
      { $match: { project: { $in: projectIds } } },
      { $group: { _id: "$project", count: { $sum: 1 } } },
    ]),
  ]);

  const likeMap = new Map(likes.map((entry) => [String(entry._id), entry.count]));
  const commentMap = new Map(
    comments.map((entry) => [String(entry._id), entry.count])
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        projects: projects.map((project) =>
          buildProjectPayload(project, {
            likeCount: likeMap.get(String(project._id)) ?? 0,
            commentCount: commentMap.get(String(project._id)) ?? 0,
          })
        ),
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
          hasNextPage: skip + limit < total,
          hasPreviousPage: page > 1,
        },
      },
      "Projects fetched successfully"
    )
  );
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId).populate(
    "userId",
    "userName fullName avatar bio"
  );

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  project.visits += 1;
  await project.save();

  const [likeCount, commentCount] = await Promise.all([
    Like.countDocuments({ project: project._id }),
    Comment.countDocuments({ project: project._id }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      buildProjectPayload(project, {
        likeCount,
        commentCount,
      }),
      "Project fetched successfully"
    )
  );
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (String(project.userId) !== String(req.user._id)) {
    throw new ApiError(403, "You are not allowed to update this project");
  }

  const updates = {
    title: req.body.title?.trim(),
    description: req.body.description?.trim(),
    githubLink:
      req.body.githubLink !== undefined
        ? validateOptionalUrl(req.body.githubLink?.trim(), "githubLink")
        : undefined,
    liveLink:
      req.body.liveLink !== undefined
        ? validateOptionalUrl(req.body.liveLink?.trim(), "liveLink")
        : undefined,
  };

  if (updates.title) {
    project.title = updates.title;
  }
  if (updates.description) {
    project.description = updates.description;
  }
  if (updates.githubLink !== undefined) {
    project.githubLink = updates.githubLink;
  }
  if (updates.liveLink !== undefined) {
    project.liveLink = updates.liveLink;
  }
  if (req.body.techStack !== undefined) {
    project.techStack = parseStringArray(req.body.techStack);
  }
  if (req.body.images !== undefined) {
    project.images = parseStringArray(req.body.images);
  }

  await project.save();

  const updatedProject = await Project.findById(project._id).populate(
    "userId",
    "userName fullName avatar"
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        buildProjectPayload(updatedProject),
        "Project updated successfully"
      )
    );
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (String(project.userId) !== String(req.user._id)) {
    throw new ApiError(403, "You are not allowed to delete this project");
  }

  await Promise.all([
    project.deleteOne(),
    Comment.deleteMany({ project: project._id }),
    Like.deleteMany({ project: project._id }),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

export {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
};
