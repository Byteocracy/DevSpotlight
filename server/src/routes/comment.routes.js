import verifyJWT from "../middlewares/auth.middleware.js";
import {
  addComment,
  updateComment,
  deleteComment,
  getAllComments,
} from "../controllers/comment.controller.js";

import { Router } from "express";

const router = Router();

router.route("/project/:projectId").post(verifyJWT, addComment).get(getAllComments);
router
  .route("/:commentId")
  .patch(verifyJWT, updateComment)
  .delete(verifyJWT, deleteComment);

export default router;
