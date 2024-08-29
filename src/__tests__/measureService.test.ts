import { Measure } from '../models/Measure';

jest.mock('../models/Measure');

describe('Measure Service', () => {
  it('Sucesso na criação do Measure', async () => {
    const mockMeasure = {
      customer_code: '12345',
      measure_datetime: new Date(),
      measure_type: 'WATER',
      measure_value: 100,
      measure_uuid: 'uuid',
      image_url: 'http://image.url'
    };

    (Measure.create as jest.Mock).mockResolvedValue(mockMeasure);

    const createdMeasure = await Measure.create(mockMeasure);

    expect(createdMeasure).toEqual(mockMeasure);
  });
});
