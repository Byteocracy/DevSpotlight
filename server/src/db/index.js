import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing in server/.env");
  }

  try {
    const normalizedUri = mongoUri.endsWith("/") ? mongoUri.slice(0, -1) : mongoUri;
    const connectionInstance = await mongoose.connect(`${normalizedUri}/${DB_NAME}`);

    console.log(`DB connected successfully: ${connectionInstance.connection.host}`);
  } catch (error) {
    throw new Error(`DB connection failed: ${error.message}`);
  }
};

export default connectDB;
