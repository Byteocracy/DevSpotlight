import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multure.middleware.js";
import { Router } from "express";
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjects,
} from "../controllers/project.controller.js";
const router = Router();

router.route("/").post(verifyJWT, upload.array("images", 6), createProject).get(getAllProjects);
router
  .route("/:projectId")
  .get(getProjectById)
  .patch(verifyJWT, upload.array("images", 6), updateProject)
  .delete(verifyJWT, deleteProject);
export default router;
