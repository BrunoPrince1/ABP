import { pool } from '../db/connection';
import type { AdministrationRecord, RecordStatus } from '../types';

export const recordRepository = {
  async findToday(userId: string): Promise<AdministrationRecord[]> {
    const { rows } = await pool.query<AdministrationRecord>(
      `SELECT ar.*
       FROM administration_records ar
       JOIN medications m ON m.id = ar.medication_id
       WHERE m.user_id = $1
         AND ar.scheduled_time::date = CURRENT_DATE
       ORDER BY ar.scheduled_time ASC`,
      [userId],
    );
    return rows;
  },

  async findHistory(userId: string, page: number, limit = 20): Promise<AdministrationRecord[]> {
    const offset = (page - 1) * limit;
    const { rows } = await pool.query<AdministrationRecord>(
      `SELECT ar.*
       FROM administration_records ar
       JOIN medications m ON m.id = ar.medication_id
       WHERE m.user_id = $1
       ORDER BY ar.scheduled_time DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset],
    );
    return rows;
  },

  async updateStatus(
    id: string,
    status: RecordStatus,
    takenAt?: Date,
    notifiedResponsible?: boolean,
  ): Promise<AdministrationRecord | null> {
    const { rows } = await pool.query<AdministrationRecord>(
      `UPDATE administration_records
       SET status = $2,
           taken_at = COALESCE($3, taken_at),
           notified_responsible = COALESCE($4, notified_responsible)
       WHERE id = $1
       RETURNING *`,
      [id, status, takenAt ?? null, notifiedResponsible ?? null],
    );
    return rows[0] ?? null;
  },

  async findPendingForAlert(): Promise<AdministrationRecord[]> {
    // Busca registros "upcoming" cujo prazo de alerta já passou
    const { rows } = await pool.query<AdministrationRecord>(
      `SELECT ar.*
       FROM administration_records ar
       JOIN medications m ON m.id = ar.medication_id
       WHERE ar.status = 'upcoming'
         AND ar.scheduled_time + (m.alert_delay_minutes * INTERVAL '1 minute') < NOW()
         AND ar.notified_responsible = FALSE`,
    );
    return rows;
  },

  async createForToday(
    medicationId: string,
    medicationName: string,
    compartment: number,
    scheduledTime: Date,
  ): Promise<AdministrationRecord> {
    const { rows: [record] } = await pool.query<AdministrationRecord>(
      `INSERT INTO administration_records
         (medication_id, medication_name, compartment, scheduled_time, status)
       VALUES ($1, $2, $3, $4, 'upcoming')
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [medicationId, medicationName, compartment, scheduledTime],
    );
    return record;
  },
};
