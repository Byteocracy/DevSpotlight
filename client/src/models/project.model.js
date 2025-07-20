import mongoose, { Schema } from "mongoose";

const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    liveLink: {
        type: String,
        required: true,
        trim: true
    },
    gitHubLink: {
        type: String,
        required: true,
        trim: true
    },
    topic: {
        type: [String],
        required : true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    visits: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

export const Project = mongoose.model("Project", ProjectSchema);
