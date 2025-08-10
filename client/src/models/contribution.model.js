import mongoose, { Schema } from "mongoose";

const contributionSchema = new Schema({
  project: {
    type: mongoose.Types.ObjectId,
    ref: "Project",
  },
  contributor: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

export const Contribution = mongoose.model("Contribution", contributionSchema);
