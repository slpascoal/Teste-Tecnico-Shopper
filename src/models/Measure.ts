/* 
  importação das bibliotecas e dependencias necessárias do mongoose
*/
import { Schema, model } from 'mongoose';

// interface para instanciar os dados de maniera mais prática 
interface IMeasure {
  customer_code: string;
  measure_datetime: Date;
  measure_type: 'WATER' | 'GAS';
  measure_value: number;
  measure_uuid: string;
  image_url: string;
  has_confirmed: boolean;
}

// estrutura do nosso measure, que será armazenado no bd
const measureSchema : any = new Schema<IMeasure>({
  customer_code: { type: String, required: true },
  measure_datetime: { type: Date, required: true },
  measure_type: { type: String, enum: ['WATER', 'GAS'], required: true },
  measure_value: { type: Number },
  measure_uuid: { type: String, required: true, unique: true },
  image_url: { type: String, required: true },
  has_confirmed: { type: Boolean, default: false },
});

// exporta o Measure
export const Measure = model<IMeasure>('Measure', measureSchema);
