/* 
importação das bibliotecas e dependencias necessárias
  - Express: framework para a construção de servidores web (HTTP)
  - dotenv: para reconhecer o arquivo de variáveis .env
  - connectDB: para ter acesso ao banco de dados em ./config/database
  - measureRoutes: rotas da aplicação (post, patch, get)
*/
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import measureRoutes from './routes/measureRoutes';

// carrega o arquivo .env
dotenv.config();

// app recebe as funcionalidades de express
const app = express();
app.use(express.json());

// executa o banco de dados
connectDB();

// instancia o caminho da api e suas rotas
app.use('/api/measures', measureRoutes);

// mostra no console cada requisição pedida pela API
app.use((req, res, next) => {
    console.log(`Recebida requisição para ${req.method} ${req.url}`);
    next();
});

// indica que a pasta uploads armazenara arquivos estáticos (imagens convertidas de base64 para png)
app.use('/uploads', express.static('uploads'));

// porta da aplicação
const PORT = process.env.PORT || 5000;

// mostra no console em que porta subiu a aplicação
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});