import verifyJWT from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  toggleLikedComment,
  toggleLikedProject,
  getAllLikes,
} from "../controllers/like.controller.js";
const router = Router();

router.route("/comment/:commentId").post(verifyJWT, toggleLikedComment);
router
  .route("/project/:projectId")
  .post(verifyJWT, toggleLikedProject)
  .get(getAllLikes);
export default router;
