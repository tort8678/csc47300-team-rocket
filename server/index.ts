import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.ts';
import authRoutes from './routes/auth.ts';
import threadRoutes from './routes/thread.ts';
import commentRoutes from './routes/comment.ts';
import adminRoutes from './routes/admin.ts';
import { errorHandler } from './middleware/error.ts';
import { initGridFS } from './services/gridfs.ts';

(async function() {
   try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }
    await mongoose.connect(mongoUri);
    console.log("Connect to the MongoDB successfully!");
    
    // Initialize GridFS after connection
    await initGridFS();
  } catch (error) {
    console.log(new Error(`${error}`));
  }

   const app = express();
   
   // Middleware
   app.use(cors());
   // Only parse JSON for non-multipart requests (multer handles multipart)
   app.use((req, res, next) => {
     const contentType = req.headers['content-type'] || '';
     if (!contentType.includes('multipart/form-data')) {
       express.json()(req, res, next);
     } else {
       next();
     }
   });
   
   // Routes
   app.get('/', (req, res) => {
      res.json('Hello from Vite and Node.js!' );
   });
   app.use('/api/auth', authRoutes);
   app.use('/api/users', userRoutes);
   app.use('/api/threads', threadRoutes);
   app.use('/api/comments', commentRoutes);
   app.use('/api/admin', adminRoutes);
   
   // Error handling middleware (must be last)
   app.use(errorHandler);
   
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
   });
})();