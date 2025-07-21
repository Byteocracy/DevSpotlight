import mongoose, { Schema } from "mongoose";

const FollowSchema = new Schema({
    follower: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    following: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
}, { timestamps: true });

// Ensure a user cannot follow the same user multiple  
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

export const Follow = mongoose.model('Follow', FollowSchema);
