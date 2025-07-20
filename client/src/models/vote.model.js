import mongoose, { Schema } from "mongoose";

const voteSchema = new Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    project: {
      type: mongoose.Types.ObjectId,
      ref: "Project",
    },
    comment: {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true }
);

export const Vote = mongoose.model("Vote", voteSchema);
