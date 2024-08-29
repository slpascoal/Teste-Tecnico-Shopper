import { Request, Response } from 'express';
import { Measure } from '../models/Measure';
import { uploadMeasureService } from '../services/measureService';

export const uploadMeasure = async (req: Request, res: Response) => {
  try {
    const result = await uploadMeasureService(req.body);
    return res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ error_code: "ERROR", error_description: error.message });
    } else {
      // Caso o erro não seja uma instância de Error
      return res.status(500).json({ error_code: "INTERNAL_ERROR", error_description: "An unexpected error occurred" });
    }
  }
};

export const confirmMeasure = async (req: Request, res: Response) => {
  const { measure_uuid, confirmed_value } : any = req.body;

  const measure : any = await Measure.findOne({ measure_uuid });

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
  const { customer_code } : any = req.params;
  const { measure_type } : any = req.query;


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
