import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Project } from "../models/project.model.js";
import { Favourite } from "../models/favourites.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

//upload project
const uploadProject = asyncHandler(async (req, res) => {
  //get project details
  const user = req.user;
  const { title, description, topic, githubUrl, liveUrl } = req.body;
  if (
    [title, description, topic, githubUrl, liveUrl].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required !");
  }
  //get thumbnail
  const thumbnailFile = req.files.thumbnail?.[0];

  if (!thumbnailFile) {
    throw new ApiError(400, "Thumbnail is required!");
  }
  //upload thumbnail to cloudinary
  const thumbnailUpload = await uploadOnCloudinary(thumbnailFile.path);

  //create project
  const project = await Project.create({
    title,
    description,
    title,
    githubUrl,
    projectUrl: liveUrl,
    thumbnail: thumbnailUpload.url,
    owner: user,
  });

  if (!project) {
    throw new ApiError(400, "Something went wrong while uploading project!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, Project, "Project uploaded successfully"));
});
//update project
const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "Project id is missing from params");
  }

  const user = req.user;
  if (!user) {
    throw new ApiError(400, "Invalid action");
  }

  const { title, description, topic, githubUrl, liveUrl } = req.body;
  const thumbnailFile = req.files.thumbnail?.[0];

  if (thumbnailFile) {
    const thumbnailUpload = await uploadOnCloudinary(thumbnailFile.path);
    project.thumbnail = thumbnailUpload.url;
  }

  //find project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found!!");
  }
  //check user authorization
  if (project.owner.toString() !== user._id.toString()) {
    throw new ApiError(
      400,
      "Unauthorized action !! You are not allowed to update this project!"
    );
  }

  //update
  if (title) {
    project.title = title;
  }
  if (description) {
    project.description = description;
  }
  if (topic) {
    project.topic = topic;
  }
  if (githubUrl) {
    project.githubUrl = githubUrl;
  }
  if (liveUrl) {
    project.liveUrl = liveUrl;
  }
  //save
  const updatedProject = await project.save();
  //send response
  return res
    .status(200)
    .json(200, updatedProject, "Project updated successfully!");
});
//delete project
const deleteProject = asyncHandler(async (req, res) => {
  //projectId
  const { projectId } = req.params;
  const user = req.user;
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project Not Found!");
  }

  //check owner
  if (user._id.toString() !== project.owner.toString()) {
    throw new ApiError(
      403,
      "Unauthorized action ! Your are not allowed to delete this project"
    );
  }

  //delete
  const result = await project.deleteOne();

  //send response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted Successfully!"));
});
//get all projects(all, topic, sort, pagination)
const getAllProjects = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 9,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const matchStage = {
    isPublished: true,
  };

  if (userId) {
    matchStage.owner = userId;
  }

  if (query) {
    matchStage.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  const sortOrder = sortType === "asc" ? 1 : -1;
  const sortStage = {
    [sortBy]: sortOrder,
  };

  const projects = await Project.aggregate([
    { $match: matchStage },
    { $sort: sortStage },
    { $skip: skip },
    { $limit: limitNum },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    {
      $unwind: "$owner",
    },
    {
      $project: {
        title: 1,
        description: 1,
        thumbnail: 1,
        views: 1,
        createdAt: 1,
        isPublished: 1,
        owner: {
          _id: 1,
          userName: 1,
          avatar: 1,
        },
      },
    },
  ]);

  const total = await Project.countDocuments(matchStage);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        total,
        page: pageNum,
        limit: limitNum,
        results: projects,
      },
      "Projects fetched successfully"
    )
  );
});
//get project by projectId
const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  if (!projectId) {
    throw new ApiError(400, "Project Id is missing in params");
  }

  const project = await Project.findById(projectId);
  project.visits += 1;
  await project.save();

  if (!project) {
    throw new ApiError(404, "Project nor Found !");
  }

  return res.status(200).json(200, project, "Project fetched successfully");
});

//toggle to favourites
const toggleFavourite = asyncHandler(async (req, res) => {
  //project Id
  const { projectId } = req.params;
  const userId = req.user._id;
  if (!projectId) {
    throw new ApiError(400, "Project ID is missing !");
  }
  //check for project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found !");
  }
  //check if already in favourites
  const isFavourite = await Favourite.findById(projectId);
  if (isFavourite) {
    //if yes then toggle
    const result = await isFavourite.deleteOne();
    return res
      .status(200)
      .json(200, {}, "Project Removed from favourites successfully!");
  } else {
    //else add to fav
    const newFavourite = await Favourite.create({
      project: project,
      straredBy: userId,
    });

    if (!newFavourite) {
      throw new ApiError(
        400,
        "Something went wrong ! unable to add to favourite!"
      );
    }
    return res
      .status(200)
      .json(200, newFavourite, "Project added to favourites successfully!");
  }
});

export {
  uploadProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjects,
  toggleFavourite,
};
