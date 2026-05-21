import { Request, Response, NextFunction } from 'express';
import { medicationRepository } from '../repositories/medicationRepository';
import { AppError } from '../middleware/errorHandler';

export const medicationController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const medications = await medicationRepository.findAllByUser(req.user!.sub);
      res.json({ success: true, data: medications });
    } catch (err) {
      next(err);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const med = await medicationRepository.findById(req.params.id, req.user!.sub);
      if (!med) throw new AppError('Medicamento não encontrado', 404);
      res.json({ success: true, data: med });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, dosage, compartment, alert_delay_minutes = 30, color = 'blue', schedules } = req.body as {
        name: string;
        dosage: string;
        compartment: number;
        alert_delay_minutes?: number;
        color?: string;
        schedules: { time: string }[];
      };

      if (!schedules?.length) throw new AppError('Informe ao menos um horário', 400);

      const times = schedules.map((s) => s.time);
      const med = await medicationRepository.create(
        req.user!.sub,
        { name, dosage, compartment, alert_delay_minutes, color: color as any },
        times,
      );

      res.status(201).json({ success: true, data: med });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { schedules, ...fields } = req.body as any;
      const times = schedules?.map((s: { time: string }) => s.time);

      const updated = await medicationRepository.update(req.params.id, req.user!.sub, fields, times);
      if (!updated) throw new AppError('Medicamento não encontrado', 404);

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await medicationRepository.softDelete(req.params.id, req.user!.sub);
      if (!deleted) throw new AppError('Medicamento não encontrado', 404);
      res.json({ success: true, message: 'Medicamento removido' });
    } catch (err) {
      next(err);
    }
  },
};
