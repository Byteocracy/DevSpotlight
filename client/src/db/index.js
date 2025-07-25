import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
console.log(DB_NAME);
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log("DB connected sussesfully");
  } catch (error) {
    console.log("DB connection failed");
    process.exit(1);
  }
};

export default connectDB;
