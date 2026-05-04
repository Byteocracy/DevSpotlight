import mongoose, { Schema } from "mongoose";

const contributionSchema = new Schema(
  {
    project: {
      type: mongoose.Types.ObjectId,
      ref: "Project",
      required: true
    },
    contributor: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

export const Contribution = mongoose.model("Contribution", contributionSchema);
