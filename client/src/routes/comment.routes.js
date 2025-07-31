import { upload } from "../middlewares/multure.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  addComment,
  updateComment,
  deleteComment,
  getAllComments,
} from "../controllers/comment.controller.js";
const router = Router();

router.route("/p/:projectId").post(verifyJWT, addComment);
router.route("/c/:commentId").post(verifyJWT, updateComment);
router.route("/c/:commentId").delete(verifyJWT, getAllLikes);
router.route("/p/:projectId").get(verifyJWT, getAllComments);
export default router;
