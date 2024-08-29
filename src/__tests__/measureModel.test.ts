import { Measure } from '../models/Measure';

describe('Measure Model', () => {
  it('Criar instância Measure', () => {
    const validMeasure = new Measure({
      customer_code: '12345',
      measure_datetime: new Date(),
      measure_type: 'WATER',
      measure_value: 100,
      measure_uuid: 'uuid',
      image_url: 'http://image.url'
    });

    const validationError = validMeasure.validateSync();
    expect(validationError).toBeUndefined();
  });

  it('Erro de validação, campos faltando', () => {
    const invalidMeasure = new Measure({
      customer_code: '12345'
    });

    const validationError = invalidMeasure.validateSync();
    expect(validationError).toBeDefined();
  });
});
