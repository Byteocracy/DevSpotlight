import { ApiError } from "../utils/apiError.js";

export const verifyAdmin = (req, _, next) => {
  if (!req.user || req.user.role !== "admin") {
    throw new ApiError(403, "Access denied. Admins only.");
  }
  next();
};
