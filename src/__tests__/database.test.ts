import mongoose from 'mongoose';
import { connectDB } from '../config/database';

jest.mock('mongoose');

describe('Database Connection', () => {
  it('Conexão com MongoDB OK', async () => {
    (mongoose.connect as jest.Mock).mockResolvedValue({});
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalled();
  });

  it('Erro durante conexão', async () => {
    (mongoose.connect as jest.Mock).mockRejectedValue(new Error('Erro'));
    try {
      await connectDB();
    } catch (error) {
      expect(error).toEqual(new Error('Erro'));
    }
  });
});
