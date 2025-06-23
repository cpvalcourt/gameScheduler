"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageFile = exports.processAndSaveImage = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const sharp_1 = __importDefault(require("sharp"));
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
exports.upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
});
// Process and save uploaded image
const processAndSaveImage = async (buffer, filename, width = 300, height = 300) => {
    try {
        // Process image with sharp
        const processedImage = await (0, sharp_1.default)(buffer)
            .resize(width, height, {
            fit: 'cover',
            position: 'center'
        })
            .jpeg({ quality: 80 })
            .toBuffer();
        // Generate unique filename
        const uniqueFilename = `${(0, uuid_1.v4)()}-${filename}`;
        const filepath = path_1.default.join(__dirname, '../../uploads/avatars', uniqueFilename);
        // Save processed image
        await (0, sharp_1.default)(processedImage).toFile(filepath);
        // Return the relative path for database storage
        return `/uploads/avatars/${uniqueFilename}`;
    }
    catch (error) {
        console.error('Error processing image:', error);
        throw new Error('Failed to process image');
    }
};
exports.processAndSaveImage = processAndSaveImage;
// Delete image file
const deleteImageFile = async (filepath) => {
    try {
        const fs = require('fs').promises;
        const fullPath = path_1.default.join(__dirname, '../../', filepath);
        await fs.unlink(fullPath);
    }
    catch (error) {
        console.error('Error deleting image file:', error);
        // Don't throw error as file might not exist
    }
};
exports.deleteImageFile = deleteImageFile;
