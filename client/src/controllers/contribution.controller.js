import mongoose from "mongoose";
import asyncHandler from "../utils/asyncHandlers.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import { Contribution } from "../models/contribution.model.js";
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";

// Send a contribution request
const sendContributionRequest = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const contributorId = req.user?._id;

  if (!projectId) {
    throw new ApiError(400, "Project ID is required!");
  }
  if (!contributorId) {
    throw new ApiError(400, "Invalid contributor!");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found!");
  }

  // Check if already sent
  const existingRequest = await Contribution.findOne({
    project: projectId,
    contributor: contributorId,
  });
  if (existingRequest) {
    throw new ApiError(400, "Contribution request already sent!");
  }

  const contribution = await Contribution.create({
    project: projectId,
    contributor: contributorId,
    status: "PENDING",
  });

  if (!contribution) {
    throw new ApiError(400, "Unable to send contribution request!");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, contribution, "Contribution request sent!"));
});

// Approve contribution request
const approveContributionRequest = asyncHandler(async (req, res) => {
  const { contributionId } = req.params;
  const userId = req.user?._id;

  if (!contributionId) {
    throw new ApiError(400, "Contribution ID is required!");
  }
 
   
  // why populate - > In Mongoose, .populate() is used to replace a referenced document's ID in a field with the actual document data from another collection
  const contribution = await Contribution.findById(contributionId).populate("project");
  if (!contribution) {
    throw new ApiError(404, "Contribution request not found!");
  }

  // Only project owner can approve
  if (contribution.project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to approve this request!");
  }

  contribution.status = "APPROVED";
  await contribution.save();

  return res
    .status(200)
    .json(new ApiResponse(200, contribution, "Contribution request approved!"));
});

// Reject contribution request
const rejectContributionRequest = asyncHandler(async (req, res) => {
  const { contributionId } = req.params;
  const userId = req.user?._id;

  if (!contributionId) {
    throw new ApiError(400, "Contribution ID is required!");
  }

  const contribution = await Contribution.findById(contributionId).populate("project");
  if (!contribution) {
    throw new ApiError(404, "Contribution request not found!");
  }

  if (contribution.project.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to reject this request!");
  }

  contribution.status = "REJECTED";
  await contribution.save();

  return res
    .status(200)
    .json(new ApiResponse(200, contribution, "Contribution request rejected!"));
});

// Delete / Cancel contribution request
const deleteContributionRequest = asyncHandler(async (req, res) => {
  const { contributionId } = req.params;
  const userId = req.user?._id;

  if (!contributionId) {
    throw new ApiError(400, "Contribution ID is required!");
  }

  const contribution = await Contribution.findById(contributionId);
  if (!contribution) {
    throw new ApiError(404, "Contribution request not found!");
  }

  // Only contributor or project owner can delete
  const project = await Project.findById(contribution.project);
  if (
    contribution.contributor.toString() !== userId.toString() &&
    project.owner.toString() !== userId.toString()
  ) {
    throw new ApiError(403, "You are not authorized to delete this request!");
  }

  await contribution.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Contribution request deleted!"));
});

export {
  sendContributionRequest,
  approveContributionRequest,
  rejectContributionRequest,
  deleteContributionRequest,
};
