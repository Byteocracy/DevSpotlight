import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller.js";
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/refresh-accesstoken").post(refreshAccessToken);
router.route("/me").get(verifyJWT, getCurrentUser);
export default router;
