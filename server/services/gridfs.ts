import { MongoClient, GridFSBucket, ObjectId } from 'mongodb';

let gridFSBucket: GridFSBucket | null = null;
let mongoClient: MongoClient | null = null;

export const initGridFS = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not set in environment variables');
    }
    
    // Create a separate MongoDB client for GridFS to avoid BSON version conflicts
    mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    
    const db = mongoClient.db();
    gridFSBucket = new GridFSBucket(db, {
      bucketName: 'attachments'
    });
    console.log('GridFS initialized');
  } catch (error) {
    console.error('Error initializing GridFS:', error);
    throw error;
  }
};

export const uploadFileToGridFS = (file: Express.Multer.File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!gridFSBucket) {
      reject(new Error('GridFS not initialized'));
      return;
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = `${uniqueSuffix}-${file.originalname}`;

    const writeStream = gridFSBucket.openUploadStream(filename, {
      metadata: {
        mimetype: file.mimetype,
        size: file.size,
        originalname: file.originalname,
        uploadedAt: new Date()
      }
    });

    writeStream.on('finish', () => {
      resolve(writeStream.id.toString());
    });

    writeStream.on('error', reject);
    
    // Write file buffer to GridFS
    writeStream.end(file.buffer);
  });
};

export const getFileFromGridFS = (fileId: string) => {
  if (!gridFSBucket) {
    throw new Error('GridFS not initialized');
  }
  return gridFSBucket.openDownloadStream(new ObjectId(fileId));
};

export const getFileInfoFromGridFS = async (fileId: string) => {
  if (!gridFSBucket) {
    throw new Error('GridFS not initialized');
  }
  
  const files = await gridFSBucket.find({ _id: new ObjectId(fileId) }).toArray();
  if (files.length === 0) {
    return null;
  }
  return files[0];
};

export const deleteFileFromGridFS = async (fileId: string): Promise<void> => {
  if (!gridFSBucket) {
    throw new Error('GridFS not initialized');
  }
  await gridFSBucket.delete(new ObjectId(fileId));
};

