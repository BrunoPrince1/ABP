import { recordRepository } from '../repositories/recordRepository';
import { notificationRepository } from '../repositories/deviceRepository';
import { pool } from '../db/connection';
import { logger } from '../utils/logger';

/**
 * Roda a cada minuto verificando registros com prazo vencido
 * e dispara notificações para o responsável.
 */
export async function checkMissedMedications(): Promise<void> {
  try {
    const pending = await recordRepository.findPendingForAlert();

    for (const record of pending) {
      // Busca user_id via medicamento
      const { rows } = await pool.query(
        `SELECT user_id FROM medications WHERE id = $1`,
        [record.medication_id],
      );
      const userId = rows[0]?.user_id;
      if (!userId) continue;

      // Atualiza status e marca como notificado
      await recordRepository.updateStatus(record.id, 'missed', undefined, true);

      // Cria notificação no banco
      await notificationRepository.create(
        userId,
        'missed',
        'Medicamento não retirado',
        `${record.medication_name} não foi retirado(a) no horário programado. Verifique!`,
        record.medication_id,
      );

      logger.warn(`Notificação enviada: ${record.medication_name} não retirado`, {
        recordId: record.id,
        userId,
      });
    }
  } catch (err) {
    logger.error('Erro ao verificar medicamentos atrasados', err);
  }
}

export function startAlertScheduler(): void {
  // Executa imediatamente e depois a cada 60 segundos
  checkMissedMedications();
  setInterval(checkMissedMedications, 60 * 1000);
  logger.info('Scheduler de alertas iniciado (intervalo: 60s)');
}
