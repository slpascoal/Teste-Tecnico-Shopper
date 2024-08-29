import { Request, Response } from 'express';
import { Measure } from '../models/Measure';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';

export const uploadMeasure = async (req: Request, res: Response) => {
  const { image, customer_code, measure_datetime, measure_type } = req.body;
  const apiKey = process.env.GEMINI_API_KEY || 'default_key';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

 const fileToGenerativePart = {
  inlineData: {
    data: image,
    mimeType: "image/jpeg",
  },
};

// Validação básica
if (!image || !customer_code || !measure_datetime || !measure_type) {
  return res.status(400).json({ error_code: "INVALID_DATA", error_description: "Dados inválidos" });
}


// Verificação de leitura duplicada no mês
const existingMeasure = await Measure.findOne({
  customer_code,
  measure_type,
  measure_datetime: {
    $gte: new Date(new Date(measure_datetime).setDate(1)), // Início do mês
    $lt: new Date(new Date(measure_datetime).setMonth(new Date(measure_datetime).getMonth() + 1)) // Fim do mês
  }
});


if (existingMeasure) {
  return res.status(409).json({ error_code: "DOUBLE_REPORT", error_description: "Leitura do mês já realizada" });
}


// Chamando a API do Google Gemini
try {
  const prompt = "What was the consumption for the month? Just the number";

  const result = await model.generateContent([prompt, fileToGenerativePart]);

  const dataIMG = new Date(measure_datetime)
  const filePath = `./uploads/[${measure_type}]${dataIMG.getDate()}-${dataIMG.getMonth()}-${dataIMG.getFullYear()}.png`;

  const buff = Buffer.from(image, 'base64');

  // Escreve o buffer no arquivo
  fs.writeFile(filePath, buff, (err) => {
    if (err) {
      console.error('Erro ao salvar a imagem:', err);
    } else {
      console.log('Imagem salva com sucesso em:', filePath);
    }
  });

  const IMGurl = 'http://localhost:5000' + filePath.slice(1);

  const measure_value = +result.response.text();
  const measure_uuid = uuidv4();
  const image_url = IMGurl;


  // Criando a medida no banco
  const measure = new Measure({
    customer_code,
    measure_datetime,
    measure_type,
    measure_value,
    measure_uuid,
    image_url
  });

  console.log(measure)

  await measure.save();

  return res.status(200).json({
    image_url,
    measure_value,
    measure_uuid
  });


} catch (error) {
  return res.status(500).json({ error_code: "GEMINI_ERROR", error_description: "Erro ao processar a imagem" });
}

};

export const confirmMeasure = async (req: Request, res: Response) => {
  const { measure_uuid, confirmed_value } = req.body;

  const measure = await Measure.findOne({ measure_uuid });

  if (!measure) {
    return res.status(404).json({ error_code: "MEASURE_NOT_FOUND", error_description: "Leitura não encontrada" });
  }

  if (measure.has_confirmed) {
    return res.status(409).json({ error_code: "CONFIRMATION_DUPLICATE", error_description: "Leitura já confirmada" });
  }

  measure.measure_value = confirmed_value;
  measure.has_confirmed = true;

  await measure.save();

  return res.status(200).json({ success: true });
};

export const listMeasures = async (req: Request, res: Response) => {
  const { customer_code } = req.params;
  const { measure_type } = req.query;


  const filter: any = { customer_code };



  if (measure_type && ['WATER', 'GAS'].includes((measure_type as string).toUpperCase())) {

    filter.measure_type = (measure_type as string).toUpperCase();
    
  } else if (measure_type) {

    return res.status(400).json({ error_code: "INVALID_TYPE", error_description: "Tipo de medição não permitida" });
  }

  const measures = await Measure.find(filter);

  if (measures.length === 0) {

    return res.status(404).json({ error_code: "MEASURES_NOT_FOUND", error_description: "Nenhuma leitura encontrada" });
  }

  const formattedMeasures = measures.map(measure => ({
    measure_uuid: measure.measure_uuid,
    measure_datetime: measure.measure_datetime,
    measure_type: measure.measure_type,
    has_confirmed: measure.has_confirmed,
    image_url: measure.image_url
  }));

  return res.status(200).json({ customer_code, measures: formattedMeasures });
};
