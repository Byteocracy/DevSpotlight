import { upload } from "../middlewares/multure.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  addComment,
  updateComment,
  deleteComment,
  getAllComments,
} from "../controllers/comment.controller.js";

import { Router } from "express";
import { get } from "mongoose";

const router = Router();

router.route("/c/:commentId").post(verifyJWT, addComment);
router.route("/c/:commentId").delete(verifyJWT, deleteComment);
router.route("/c/:commentId").patch(verifyJWT, updateComment);
router.route("/p/:projectId").get(verifyJWT, getAllComments);

export default router;
