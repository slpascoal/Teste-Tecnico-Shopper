/* 
importação das bibliotecas e dependencias necessárias
  - Measure: modelo Measure para incluir no banco de dados
  - GoogleGenerativeAI: biblioteca necessária para a API Gemini
  - fs: para manipulação e criação dos arquivos estáticos em uploads (imagens)
  - uuidv4: para criar uuidv4, requisito da avaliação
*/
import { Measure } from '../models/Measure';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// função complexa que será executada durante um POST
export const uploadMeasureService = async (data: any) => {
  // variaveis necessárias para a aplicação
  const { image, customer_code, measure_datetime, measure_type } : any = data;
  const apiKey : string = process.env.GEMINI_API_KEY || 'default_key';
  const genAI : any = new GoogleGenerativeAI(apiKey);
  const model : any = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const PORT : any = process.env.PORT || 5000;

  // variavel com as informações necessárias para análise da imagem pelo Gemini
  const fileToGenerativePart : any = {
    inlineData: {
      data: image,
      mimeType: "image/jpeg",
    },
  };

  // se não tiver dados no body json, lançar erro
  if (!image || !customer_code || !measure_datetime || !measure_type) {
    throw new Error("Dados inválidos");
  }

  // se já tiver um mês preenchido, retorna como true
  const existingMeasure = await Measure.findOne({
    customer_code,
    measure_type,
    measure_datetime: {
      $gte: new Date(new Date(measure_datetime).setDate(1)),
      $lt: new Date(new Date(measure_datetime).setMonth(new Date(measure_datetime).getMonth() + 1))
    }
  });

  // caso variável acima recebe true, lançar erro
  if (existingMeasure) {
    throw new Error("Leitura do mês já realizada");
  }

  // tentativa de conectar com API Gemini e salvar dados no bd
  try {
    // variavei de prompt e armazenar resultado do Gemini
    const prompt : string = "What was the consumption for the month? Just the number";
    const result : any = await model.generateContent([prompt, fileToGenerativePart]);

    // variaveis auxiliares para criação das imagens que foram convertidas da base64 (recebida pelo body)
    const dataIMG : Date = new Date(measure_datetime);
    const filePath : string = `./uploads/[${measure_type}]${dataIMG.getDate()}-${dataIMG.getMonth()}-${dataIMG.getFullYear()}.png`;

    // conversão da base64 para imagem:
    const buff : Buffer = Buffer.from(image, 'base64'); // cria uma cadeia de strings correpondente a imagem da base64
    fs.writeFileSync(filePath, buff); // converte o buff em imagem e armazena a imagem em filePath

    // variavel que armazena o caminho para a imagem convertida anteriormente
    const IMGurl : string = `http://localhost:${PORT}` + filePath.slice(1);

    // variaveis que serão usadas para retorno do POST e incluidas no Measure no bd
    const measure_value : number = +result.response.text();
    const measure_uuid : string = uuidv4();
    const image_url : string = IMGurl;

    // criação do measure
    const measure : any = new Measure({
      customer_code,
      measure_datetime,
      measure_type,
      measure_value,
      measure_uuid,
      image_url
    });

    // salva o measure no bd
    await measure.save();

    // retorna os valores que serão usados no resultado de POST
    return { image_url, measure_value, measure_uuid };

    // tratamento do erro
  } catch (error) {
    throw new Error("Erro ao processar a imagem");
  }
};
