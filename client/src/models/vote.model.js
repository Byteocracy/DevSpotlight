import mongoose, { Schema } from "mongoose";

const VoteSchema = new Schema({
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project"
    },
    voteBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true });


export const Vote =  mongoose.model("Vote", VoteSchema);
