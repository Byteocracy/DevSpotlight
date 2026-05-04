import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Contribution } from "../models/contribution.model.js";
import { Project } from "../models/project.model.js";

const sendContributionRequest = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }
  if (!userId) {
    throw new ApiError(400, "Invalid contributor!");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found!");
  }

  if (String(project.userId) === String(userId)) {
    throw new ApiError(400, "You cannot request contribution on your own project");
  }

  const existingRequest = await Contribution.findOne({
    projectId,
    userId,
  });
  if (existingRequest) {
    throw new ApiError(400, "Contribution request already sent!");
  }

  const contribution = await Contribution.create({
    projectId,
    userId,
  });

  const createdContribution = await Contribution.findById(contribution._id)
    .populate("projectId", "title")
    .populate("userId", "userName fullName avatar");

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdContribution,
        "Contribution request sent successfully"
      )
    );
});

const approveContributionRequest = asyncHandler(async (req, res) => {
  const { contributionId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(contributionId)) {
    throw new ApiError(400, "Invalid contribution id");
  }

  const contribution = await Contribution.findById(contributionId).populate("projectId");
  if (!contribution) {
    throw new ApiError(404, "Contribution request not found!");
  }

  if (String(contribution.projectId.userId) !== String(userId)) {
    throw new ApiError(403, "You are not authorized to approve this request!");
  }

  contribution.status = "approved";
  await contribution.save();

  return res
    .status(200)
    .json(new ApiResponse(200, contribution, "Contribution request approved!"));
});

const rejectContributionRequest = asyncHandler(async (req, res) => {
  const { contributionId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(contributionId)) {
    throw new ApiError(400, "Invalid contribution id");
  }

  const contribution = await Contribution.findById(contributionId).populate("projectId");
  if (!contribution) {
    throw new ApiError(404, "Contribution request not found!");
  }

  if (String(contribution.projectId.userId) !== String(userId)) {
    throw new ApiError(403, "You are not authorized to reject this request!");
  }

  contribution.status = "rejected";
  await contribution.save();

  return res
    .status(200)
    .json(new ApiResponse(200, contribution, "Contribution request rejected!"));
});

const deleteContributionRequest = asyncHandler(async (req, res) => {
  const { contributionId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(contributionId)) {
    throw new ApiError(400, "Invalid contribution id");
  }

  const contribution = await Contribution.findById(contributionId);
  if (!contribution) {
    throw new ApiError(404, "Contribution request not found!");
  }

  const project = await Project.findById(contribution.projectId);
  if (
    String(contribution.userId) !== String(userId) &&
    String(project.userId) !== String(userId)
  ) {
    throw new ApiError(403, "You are not authorized to delete this request!");
  }

  await contribution.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Contribution request deleted!"));
});

const getProjectContributionRequests = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid project id");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  if (String(project.userId) !== String(userId)) {
    throw new ApiError(403, "You are not allowed to view these requests");
  }

  const requests = await Contribution.find({ projectId })
    .sort({ createdAt: -1 })
    .populate("userId", "userName fullName avatar")
    .lean();

  return res
    .status(200)
    .json(
      new ApiResponse(200, requests, "Contribution requests fetched successfully")
    );
});

export {
  sendContributionRequest,
  approveContributionRequest,
  rejectContributionRequest,
  deleteContributionRequest,
  getProjectContributionRequests,
};
