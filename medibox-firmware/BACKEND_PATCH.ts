/**
 * ADICIONE ESTA ROTA ao arquivo src/routes/index.ts do medibox-api
 *
 * Permite que o dispositivo IoT busque a programação do dia
 * usando apenas o device_key (sem JWT), já que o ESP32 não faz login.
 *
 * Cole o controller abaixo em src/controllers/iotController.ts
 * e registre a rota em src/routes/index.ts.
 */

// ── Em iotController.ts, adicione: ──────────────────────────────────────────

export const deviceScheduleController = {
  async getScheduleByDeviceKey(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const deviceKey = req.query.key as string;
      if (!deviceKey) throw new AppError('device_key obrigatório', 400);

      // Busca o dispositivo pelo key
      const device = await deviceRepository.findByKey(deviceKey);
      if (!device) throw new AppError('Dispositivo não encontrado', 404);

      // Busca registros de hoje para esse usuário
      const records = await recordRepository.findToday(device.user_id);

      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  },
};

// ── Em routes/index.ts, adicione: ───────────────────────────────────────────

// Rota pública para o dispositivo IoT (sem authMiddleware)
// router.get('/device/schedule', deviceScheduleController.getScheduleByDeviceKey);
