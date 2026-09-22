import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { secrets } from '../config/secrets.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const leadId = req.params.id || 'general';
    const uploadPath = path.join(secrets.files.dir, 'brd', leadId);
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${cleanOriginalName}`);
  }
});

export const uploadBrd = multer({
  storage,
  limits: {
    fileSize: secrets.files.maxSizeMb * 1024 * 1024
  }
});

const csvStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(secrets.files.dir, 'csv');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `csv-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
  }
});

export const uploadCsv = multer({
  storage: csvStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

