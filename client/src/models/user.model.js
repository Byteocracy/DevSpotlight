import mongoose,{Schema} from "mongoose";

const ProjectSchema = new Schema({
     projectId: {
            type: String,
            required: true
        },
        projectName: {
            type: String,
            required: true
        },
        description: {
            type: String
        }
}, {timestamps: true})

export const Project = mongoose.model("Project", ProjectSchema);

const UserSchema = new Schema({
    username : {
        type : String,
        required : true,
        unique  : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email : {
        type : String,
        required : true,
        unique  : true,
        lowercase : true,
        trim : true
    },
    fullname : {
        type : String,
        required : true,
        trim : true,
        index : true
    },
    avatar :  {
        type : String, 
        required : true
    },
    coverImage : {
        type : String
    },
    projectList : [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project"
        }
    ],
    password  : {
        type : String,
        required : [true, 'password is required']
    },
    refreshToken : {
        type : String
    }
},{timestamps : true})




export const User = mongoose.model("User", UserSchema);
