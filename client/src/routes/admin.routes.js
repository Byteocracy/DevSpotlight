import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multure.middleware.js";
import {
  getAllUsers,
  getAllProjects,
  getAllComments,
  deleteComment,
  deleteProject,
  deleteUser,
  banUser,
} from "../controllers/admin.controller.js";
const router = Router();

router.route("/users").get(verifyJWT, getAllUsers);
router.route("/comments").get(verifyJWT, getAllComments);
router.route("/projects").get(verifyJWT, getAllProjects);
router.route("/c/:commentId").delete(verifyJWT, deleteComment);
router.route("/p/:projectId").delete(verifyJWT, deleteProject);
router.route("/u/:userId").delete(verifyJWT, deleteUser);
router.route("/u/:userId").patch(verifyJWT, banUser);

export default router;
