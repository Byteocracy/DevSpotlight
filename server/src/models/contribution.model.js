import mongoose, { Schema } from "mongoose";

const contributionSchema = new Schema(
  {
    projectId: {
      type: mongoose.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

contributionSchema.index({ projectId: 1, userId: 1 }, { unique: true });

export const Contribution = mongoose.model("Contribution", contributionSchema);
