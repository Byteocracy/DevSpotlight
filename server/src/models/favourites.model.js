import mongoose, { Schema } from "mongoose";
import { Project } from "./project.model.js";

const favouriteSchema = new Schema({
  project: {
    type: mongoose.Types.ObjectId,
    ref: "Project",
  },
  straredBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

export const Favourite = mongoose.model("Favourite", favouriteSchema);
