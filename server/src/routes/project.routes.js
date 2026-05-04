import verifyJWT from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjects,
} from "../controllers/project.controller.js";
const router = Router();

router.route("/").post(verifyJWT, createProject).get(getAllProjects);
router
  .route("/:projectId")
  .get(getProjectById)
  .patch(verifyJWT, updateProject)
  .delete(verifyJWT, deleteProject);
export default router;
