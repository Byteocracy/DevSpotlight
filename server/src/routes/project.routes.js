import { upload } from "../middlewares/multure.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  uploadProject,
  updateProject,
  deleteProject,
  getProjectById,
  getAllProjects,
  toggleFavourite,
} from "../controllers/project.controller.js";
const router = Router();

router
  .route("/upload-project")
  .post(verifyJWT, upload.single("thumbnail"), uploadProject);
router
  .route("/update-project/p/:projectId")
  .patch(verifyJWT, upload.single("thumbnail"), updateProject);
router.route("/delete-project/p/:projectId").delete(verifyJWT, deleteProject);
router
  .route("/upload-project")
  .post(verifyJWT, upload.single("thumbnail"), uploadProject);
router.route("/p/:projectId").get(getProjectById);
router.route("/projects").get(getAllProjects);
router.route("/toggle/p/:projectId").patch(verifyJWT, toggleFavourite);
export default router;
