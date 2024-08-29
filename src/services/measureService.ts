import { Measure } from '../models/Measure';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

export const uploadMeasureService = async (data: any) => {
  const { image, customer_code, measure_datetime, measure_type } = data;
  const apiKey = process.env.GEMINI_API_KEY || 'default_key';
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const fileToGenerativePart = {
    inlineData: {
      data: image,
      mimeType: "image/jpeg",
    },
  };

  if (!image || !customer_code || !measure_datetime || !measure_type) {
    throw new Error("Dados inválidos");
  }

  const existingMeasure = await Measure.findOne({
    customer_code,
    measure_type,
    measure_datetime: {
      $gte: new Date(new Date(measure_datetime).setDate(1)),
      $lt: new Date(new Date(measure_datetime).setMonth(new Date(measure_datetime).getMonth() + 1))
    }
  });

  if (existingMeasure) {
    throw new Error("Leitura do mês já realizada");
  }

  try {
    const prompt = "What was the consumption for the month? Just the number";
    const result = await model.generateContent([prompt, fileToGenerativePart]);

    const dataIMG = new Date(measure_datetime);
    const filePath = `./uploads/[${measure_type}]${dataIMG.getDate()}-${dataIMG.getMonth()}-${dataIMG.getFullYear()}.png`;

    const buff = Buffer.from(image, 'base64');
    fs.writeFileSync(filePath, buff);

    const IMGurl = 'http://localhost:5000' + filePath.slice(1);

    const measure_value = +result.response.text();
    const measure_uuid = uuidv4();
    const image_url = IMGurl;

    const measure = new Measure({
      customer_code,
      measure_datetime,
      measure_type,
      measure_value,
      measure_uuid,
      image_url
    });

    await measure.save();

    return { image_url, measure_value, measure_uuid };

  } catch (error) {
    throw new Error("Erro ao processar a imagem");
  }
};
