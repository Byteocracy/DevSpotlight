import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);
//configurations
app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    // allows complex objects and arrays to be encoded into the URL-encoded format.

    limit: "16kb",
  })
);

app.use(express.static("public")); //serves static files from the public directory

app.use(cookieParser()); //parse cookies from incoming requests

//import routes
import userRouter from "./routes/user.routes.js";
import projectRouter from "./routes/project.routes.js";
import likeRouter from "./routes/like.routes.js";
import contributionRouter from "./routes/contribution.routes.js";
import commentRouter from "./routes/comment.routes.js";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";

//define routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/contributions", contributionRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/admin", adminRouter);
export { app };
