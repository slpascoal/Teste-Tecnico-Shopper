# Teste Tecnico Shopper
Aplicação desenvolvida como um teste técnico para a vaga de Desenvolvedor Full-Stack Júnior

## Requisitos
Para rodar a aplicação sem instalar dependências, npm install, etc... você pode executar o Docker. Mas é necessário ter instalado em sua máquina:

### `Node.js`
### `Docker (eu uso o Docker Desktop, mais prático)`

## NPM Install
No desenvolvimento, usei os seguintes npm install:

### `npm install`
### `npm install express mongoose dotenv axios uuid`
### `npm install --save-dev typescript @types/express @types/mongoose ts-node nodemon`
### `npm install @google/generative-ai`
### `npm install --save-dev jest ts-jest @types/jest supertest @types/supertest`

## Arquivo .env
É necessario criar um arquivo `.env` na raiz do programa contendo uma variavel para o caminho do Banco de Dados MongoDB e API Gemini.
<br />
Siga esse padrão:
~~~
MONGO_URI=mongodb://localhost:<porta>/<nome do bd>
GEMINI_API_KEY=<chave api>
~~~
<br />
Obs: Caso não coloque o "MONGO_URI", será considerado outro endereço padrão.

## Executar
Para executar a aplicação, que está 100% dockerizada, execute o comando:
### `docker-compose up --build`

## Como usar?
Para usar a aplicação (consumir a API) é necessário usar algum software. Eu uso o Insomnia:

### POST
Endereço: 
  `http://localhost:<porta da aplicação>/api/measures/upload`
<br />
Body JSON: 
~~~
  {
    "image": "", <-- iamgem da conta de agua ou luz em base64
    "customer_code": "12345", <--- numero aleatorio
    "measure_datetime": "2023-02-27T10:00:00Z", <-- coloque nesse formato
    "measure_type": <"WATER" ou "GAS">
  }
~~~

### PATCH
Endereço: 
  `http://localhost:<porta da aplicação>/api/measures/confirm`
<br />
Body JSON: 
~~~
  {
    "measure_uuid": <pegar measure_uuid gerado no POST anterior>,
    "confirmed_value": 120
  }
~~~

### GET
Endereço: 
  `http://localhost:<porta da aplicação>/api/measures/<customer_code>/list`
<br />
Opcional - QUERY PARAMETERS : 
~~~
  measure_type : <"WATER" ou "GAS">
~~~

## Testes Unitários
Essa aplicação possui testes unitários, que podem ser executados com o comando:
### `npm test`
