import multer from 'multer';
import type { FileFilterCallback } from 'multer';
import { Request } from 'express';

// File filter - accept all file types for now
const fileFilter = (req: Request, file: any, cb: FileFilterCallback) => {
  // Allow all file types, but you can add restrictions here
  cb(null, true);
};

// Configure multer to use memory storage (for GridFS)
export const upload = multer({
  storage: multer.memoryStorage(), // Store in memory, then upload to GridFS
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files per thread
  }
});

