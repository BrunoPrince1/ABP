import { Request, Response, NextFunction } from 'express';
import { recordRepository } from '../repositories/recordRepository';
import { deviceRepository, notificationRepository } from '../repositories/deviceRepository';
import { AppError } from '../middleware/errorHandler';

// ─── Records ──────────────────────────────────────────────
export const recordController = {
  async today(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const records = await recordRepository.findToday(req.user!.sub);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  },

  async history(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(String(req.query.page ?? '1'), 10);
      const records = await recordRepository.findHistory(req.user!.sub, page);
      res.json({ success: true, data: records });
    } catch (err) { next(err); }
  },
};

// ─── Device ───────────────────────────────────────────────
export const deviceController = {
  async status(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const device = await deviceRepository.findByUser(req.user!.sub);
      if (!device) throw new AppError('Dispositivo não configurado', 404);
      res.json({ success: true, data: device });
    } catch (err) { next(err); }
  },

  // Chamado pelo próprio dispositivo IoT para enviar heartbeat
  async heartbeat(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { device_key, battery_level, signal_strength } = req.body as {
        device_key: string;
        battery_level: number;
        signal_strength: string;
      };

      await deviceRepository.upsertHeartbeat(device_key, battery_level, signal_strength);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  // Chamado pelo dispositivo IoT quando medicamento é retirado
  async compartmentOpened(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { device_key, compartment, record_id } = req.body as {
        device_key: string;
        compartment: number;
        record_id: string;
      };

      const device = await deviceRepository.findByKey(device_key);
      if (!device) throw new AppError('Dispositivo não encontrado', 404);

      const updated = await recordRepository.updateStatus(record_id, 'taken', new Date());
      if (!updated) throw new AppError('Registro não encontrado', 404);

      // Cria notificação positiva
      await notificationRepository.create(
        device.user_id,
        'taken',
        'Medicamento retirado',
        `${updated.medication_name} foi retirado(a) no compartimento ${compartment}.`,
        updated.medication_id,
      );

      res.json({ success: true, data: updated });
    } catch (err) { next(err); }
  },
};

// ─── Notifications ────────────────────────────────────────
export const notificationController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await notificationRepository.findByUser(req.user!.sub);
      res.json({ success: true, data: notifications });
    } catch (err) { next(err); }
  },

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationRepository.markRead(req.params.id, req.user!.sub);
      res.json({ success: true });
    } catch (err) { next(err); }
  },

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await notificationRepository.markAllRead(req.user!.sub);
      res.json({ success: true });
    } catch (err) { next(err); }
  },
};
