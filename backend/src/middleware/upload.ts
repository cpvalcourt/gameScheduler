import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Process and save uploaded image
export const processAndSaveImage = async (
  buffer: Buffer,
  filename: string,
  width: number = 300,
  height: number = 300
): Promise<string> => {
  try {
    // Process image with sharp
    const processedImage = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${filename}`;
    const filepath = path.join(__dirname, '../../uploads/avatars', uniqueFilename);

    // Save processed image
    await sharp(processedImage).toFile(filepath);

    // Return the relative path for database storage
    return `/uploads/avatars/${uniqueFilename}`;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

// Delete image file
export const deleteImageFile = async (filepath: string): Promise<void> => {
  try {
    const fs = require('fs').promises;
    const fullPath = path.join(__dirname, '../../', filepath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Error deleting image file:', error);
    // Don't throw error as file might not exist
  }
}; 