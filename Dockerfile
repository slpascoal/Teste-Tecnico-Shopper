# Usar Node.js como base
FROM node:22-alpine

# Diretório de trabalho
WORKDIR /app

# Copia o package.json e package-lock.json
COPY package*.json ./

# Instala as dependências necessárias
RUN npm install

# Copia o restante do código para o contêiner
COPY . .

# Compila a aplicação
RUN npm run build

# Porta que será usada
EXPOSE 5000

# Comando para rodar a aplicação
CMD ["npm", "run", "start"]
