import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const port = process.env.PORT || 5000;

    app.on("error", (error) => {
      console.log("Application error:", error.message);
      throw error;
    });

    app.listen(port, () => {
      console.log("Server is running on port:", port);
    });
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};

void startServer();
