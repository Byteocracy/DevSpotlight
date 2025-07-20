import mongoose, { Schema } from "mongoose";

const FollowSchema = new Schema(
  {
    follower: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    following: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", FollowSchema);
