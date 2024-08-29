import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import measureRoutes from './routes/measureRoutes';
import path from 'path';


dotenv.config();

const app = express();
app.use(express.json());

connectDB();

app.use('/api/measures', measureRoutes);

app.use((req, res, next) => {
    console.log(`Recebida requisição para ${req.method} ${req.url}`);
    next();
});

app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
