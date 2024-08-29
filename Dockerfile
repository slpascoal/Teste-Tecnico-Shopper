# Use a imagem oficial do Node.js como base
FROM node:22-alpine

# Define o diretório de trabalho
WORKDIR /app

# Copia o package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da aplicação para o contêiner
COPY . .

# Compila o projeto TypeScript
RUN npm run build

# Expõe a porta que a aplicação irá usar
EXPOSE 5000

# Comando para rodar a aplicação
CMD ["npm", "run", "start"]
