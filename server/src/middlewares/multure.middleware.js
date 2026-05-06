import multer from "multer";
import fs from "fs";
import path from "path";

const tempDirectory = path.resolve("public/temp");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    fs.mkdirSync(tempDirectory, { recursive: true });
    cb(null, tempDirectory)
  },
  filename: function (req, file, cb) {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname)
  }
})

export const upload = multer({ 
    storage, 
})
