import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config();

connectDB().then(() => {
  //db connect , now start server
  const port = process.env.PORT || 5000;
  try {
    app.on("error", (error) => {
      console.log("Application : ", error.message);
      throw error;
    });

    app.listen(port, () => {
      console.log("Server is running on port : ", port);
    });
  } catch (error) {
    console.log("MongoDB connection failed !! : ", error.message);
    process.exit(1);
  }
});
