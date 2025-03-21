import multer from "multer";
import path from "path";

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Make sure this directory exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
    // Accept video files only
    if (file.mimetype.startsWith("video/")) {
        cb(null, true);
    } else {
        cb(new Error("Not a video file! Please upload only videos."), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB max file size
    },
});

// Create uploads directory if it doesn't exist
import fs from 'fs';
const dir = './uploads';
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
}
