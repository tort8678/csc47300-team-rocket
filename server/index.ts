import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/user.js';
import authRoutes from './routes/auth.js';
import threadRoutes from './routes/thread.js';
import commentRoutes from './routes/comment.js';
import { errorHandler } from './middleware/error.js';
import { initGridFS } from './services/gridfs.js';

(async function() {
   try {
    const mongoUri = process.env.MONGODB_URI;
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
   app.use(express.json());
   
   // Routes
   app.get('/', (req, res) => {
      res.json('Hello from Vite and Node.js!' );
   });
   app.use('/api/auth', authRoutes);
   app.use('/api/users', userRoutes);
   app.use('/api/threads', threadRoutes);
   app.use('/api/comments', commentRoutes);
   
   // Error handling middleware (must be last)
   app.use(errorHandler);
   
   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
   });
})();