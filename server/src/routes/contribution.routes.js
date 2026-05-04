import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

import {
  sendContributionRequest,
  approveContributionRequest,
  rejectContributionRequest,
  deleteContributionRequest,
  getProjectContributionRequests,
} from "../controllers/contribution.controller.js";
const router = Router();

router
  .route("/project/:projectId")
  .post(verifyJWT, sendContributionRequest)
  .get(verifyJWT, getProjectContributionRequests);
router
  .route("/:contributionId/approve")
  .patch(verifyJWT, approveContributionRequest);
router
  .route("/:contributionId/reject")
  .patch(verifyJWT, rejectContributionRequest);
router.route("/:contributionId").delete(verifyJWT, deleteContributionRequest);
export default router;
