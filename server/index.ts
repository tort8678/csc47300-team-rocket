import express from 'express';
import mongoose from 'mongoose';
import userRoutes from './routes/user';

(async function() {
   try {
    await mongoose.connect("mongodb://127.0.0.1/damit");
    console.log("Connect to the MongoDB successfully!");
    console.log("DB LINK -> ", "mongodb://127.0.0.1/damit");
  } catch (error) {
    console.log(new Error(`${error}`));
  }

   const app = express();
   app.get('/', (req, res) => {
      res.json('Hello from Vite and Node.js!' );
   });
   app.use(express.json());
   app.use('/user', userRoutes);
   
   const PORT = 3000;
   app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
   });
})();