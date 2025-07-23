import mongoose, { Schema } from "mongoose";

const LikeSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project"
    },
    likeBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });


export const Like =  mongoose.model("Like", LikeSchema);
