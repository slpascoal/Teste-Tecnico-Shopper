/* 
  importação das bibliotecas e dependencias necessárias:
  - Request, Response: recebe tudo que foi passado pela requisição API
  - Measure: importa o modelo Measure
  - uploadMeasureService: função que será usada em uploadMeasure, mas foi colocada em /services devido a complexidade
*/
import { Request, Response } from 'express';
import { Measure } from '../models/Measure';
import { uploadMeasureService } from '../services/measureService';

// função responsavel pelo POST
export const uploadMeasure = async (req: Request, res: Response) => {
  try {

    // em caso de sucesso em uploadMeasureService, retorna o resultado
    const result = await uploadMeasureService(req.body);

    return res.status(200).json(result);

  } catch (error: unknown) {

    // em caso de erro, valida qual erro foi retorna
    if (error instanceof Error) {

      return res.status(400).json({ error_code: "ERROR", error_description: error.message });

    } else {

      // Caso o erro não seja uma instância de Error
      return res.status(500).json({ error_code: "INTERNAL_ERROR", error_description: "Erro inesperado" });

    }
  }
};

// função responsavel pelo PATCH
export const confirmMeasure = async (req: Request, res: Response) => {
  // recebe infomações vindas do body da API
  const { measure_uuid, confirmed_value }: any = req.body;

  // procura uma leitura correspondente ao measure_uuid
  const measure: any = await Measure.findOne({ measure_uuid });

  // validação se não encontrar leitura
  if (!measure) {
    return res.status(404).json({ error_code: "MEASURE_NOT_FOUND", error_description: "Leitura não encontrada" });
  }

  // validação se leitura já for confirmada
  if (measure.has_confirmed) {
    return res.status(409).json({ error_code: "CONFIRMATION_DUPLICATE", error_description: "Leitura já confirmada" });
  }

  // confirma a leitura
  measure.measure_value = confirmed_value;
  measure.has_confirmed = true;

  // salva informação no bd
  await measure.save();

  // retorna como sucesso
  return res.status(200).json({ success: true });
};

// função responsavel pelo GET
export const listMeasures = async (req: Request, res: Response) => {
  // recebe possíveis infomações vindas dos parâmetros da API
  const { customer_code }: any = req.params;
  const { measure_type }: any = req.query;

  // recebe customer_code
  const filter: any = { customer_code };

  // valida se measure_type é "WATER" ou "GAS"
  if (measure_type && ['WATER', 'GAS'].includes((measure_type as string).toUpperCase())) {

    // recebe measure_type e converte o valor da forma que será esperada
    filter.measure_type = (measure_type as string).toUpperCase();

  } else if (measure_type) {

    // em caso de measure_type diferente de "WATER" OU "GAS"
    return res.status(400).json({ error_code: "INVALID_TYPE", error_description: "Tipo de medição não permitida" });
  }

  // measures recebe os dados filtrados por measure_type (ou "WATER" OU "GAS")
  const measures = await Measure.find(filter);

  // se não tiver leitura correspondente a essse tipo, retorna erro
  if (measures.length === 0) {

    return res.status(404).json({ error_code: "MEASURES_NOT_FOUND", error_description: "Nenhuma leitura encontrada" });
  }

  // se possuir um tipo equivalente ao filtrado, será maepado e retornado da requisição
  const formattedMeasures = measures.map(measure => ({
    measure_uuid: measure.measure_uuid,
    measure_datetime: measure.measure_datetime,
    measure_type: measure.measure_type,
    has_confirmed: measure.has_confirmed,
    image_url: measure.image_url
  }));

  // retorno do GET filtrado
  return res.status(200).json({ customer_code, measures: formattedMeasures });
};
