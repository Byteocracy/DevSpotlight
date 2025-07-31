import { upload } from "../middlewares/multure.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  toggleLikedComment,
  toggleLikedProject,
  getAllLikes,
} from "../controllers/like.controller.js";
const router = Router();

router.route("/c/:commentId").post(verifyJWT, toggleLikedComment);
router.route("/p/:projectId").post(verifyJWT, toggleLikedProject);
router.route("/p/:projectId").get(verifyJWT, getAllLikes);
export default router;
