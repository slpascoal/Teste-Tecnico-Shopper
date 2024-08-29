import { uploadMeasure, confirmMeasure, listMeasures } from '../controllers/measureController';
import { Measure } from '../models/Measure';
import { Request, Response } from 'express';
import mongoose from 'mongoose';

jest.mock('../models/Measure');

describe('Measure Controller', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let status: jest.Mock;
  let json: jest.Mock;

  beforeEach(() => {
    status = jest.fn(() => res);
    json = jest.fn();
    req = { body: {}, params: {}, query: {} };
    res = { status, json };
  });

  it('Erro 400: invalidez em uploadMeasure', async () => {
    req.body = {};

    await uploadMeasure(req as Request, res as Response);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      error_code: 'INVALID_DATA',
      error_description: 'Dados inválidos'
    });
  });
});
