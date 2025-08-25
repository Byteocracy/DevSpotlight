import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

import {
  sendContributionRequest,
  approveContributionRequest,
  rejectContributionRequest,
  deleteContributionRequest,
} from "../controllers/contribution.controller.js";
const router = Router();

router.route("/p/:projectId").post(verifyJWT, sendContributionRequest);
router
  .route("/requests/approve/:contributionId")
  .patch(verifyJWT, approveContributionRequest);
router
  .route("/requests/reject/:contributionId")
  .patch(verifyJWT, rejectContributionRequest);
router.route("/p/:projectId").delete(verifyJWT, deleteContributionRequest);
export default router;
