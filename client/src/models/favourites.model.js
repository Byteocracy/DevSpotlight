import mongoose, { Schema } from "mongoose";
import { Project } from "./project.model";

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

export const Favoutite = mongoose.model("Favoutite", favouriteSchema);
