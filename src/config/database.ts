/* 
  importação das bibliotecas e dependencias necessárias do mongoose
*/
import mongoose from 'mongoose';

// instanciar e executar o bd
export const connectDB = async () => {
  
  // tenta se conectar ao bd relacionado em process.env.MONGO_URI
  try {

    await mongoose.connect(process.env.MONGO_URI || "mongodb://mongo:27017/teste" as string, {});
    console.log('MongoDB connected');

  } catch (error) {

    // caso não se conecte, retorna erro
    console.error('MongoDB connection failed:', error);
    process.exit(1);

  }
};
