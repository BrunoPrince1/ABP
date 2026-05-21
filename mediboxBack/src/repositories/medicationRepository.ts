import { pool } from '../db/connection';
import type { Medication, Schedule } from '../types';

export const medicationRepository = {
  async findAllByUser(userId: string): Promise<(Medication & { schedules: Schedule[] })[]> {
    const { rows: meds } = await pool.query<Medication>(
      `SELECT * FROM medications WHERE user_id = $1 AND active = TRUE ORDER BY created_at ASC`,
      [userId],
    );

    const result = await Promise.all(
      meds.map(async (med) => {
        const { rows: schedules } = await pool.query<Schedule>(
          `SELECT * FROM schedules WHERE medication_id = $1 ORDER BY time ASC`,
          [med.id],
        );
        return { ...med, schedules };
      }),
    );

    return result;
  },

  async findById(id: string, userId: string): Promise<(Medication & { schedules: Schedule[] }) | null> {
    const { rows } = await pool.query<Medication>(
      `SELECT * FROM medications WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    if (!rows[0]) return null;

    const { rows: schedules } = await pool.query<Schedule>(
      `SELECT * FROM schedules WHERE medication_id = $1 ORDER BY time ASC`,
      [id],
    );
    return { ...rows[0], schedules };
  },

  async create(
    userId: string,
    data: Pick<Medication, 'name' | 'dosage' | 'compartment' | 'alert_delay_minutes' | 'color'>,
    times: string[],
  ): Promise<Medication & { schedules: Schedule[] }> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: [med] } = await client.query<Medication>(
        `INSERT INTO medications (user_id, name, dosage, compartment, alert_delay_minutes, color)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [userId, data.name, data.dosage, data.compartment, data.alert_delay_minutes, data.color],
      );

      const schedules: Schedule[] = [];
      for (const time of times) {
        const { rows: [s] } = await client.query<Schedule>(
          `INSERT INTO schedules (medication_id, time) VALUES ($1, $2) RETURNING *`,
          [med.id, time],
        );
        schedules.push(s);
      }

      await client.query('COMMIT');
      return { ...med, schedules };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<Medication, 'name' | 'dosage' | 'compartment' | 'alert_delay_minutes' | 'color' | 'active'>>,
    times?: string[],
  ): Promise<(Medication & { schedules: Schedule[] }) | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const fields = Object.entries(data)
        .map(([key], i) => `${key} = $${i + 3}`)
        .join(', ');

      if (fields) {
        await client.query(
          `UPDATE medications SET ${fields} WHERE id = $1 AND user_id = $2`,
          [id, userId, ...Object.values(data)],
        );
      }

      if (times) {
        await client.query(`DELETE FROM schedules WHERE medication_id = $1`, [id]);
        for (const time of times) {
          await client.query(
            `INSERT INTO schedules (medication_id, time) VALUES ($1, $2)`,
            [id, time],
          );
        }
      }

      await client.query('COMMIT');
      return this.findById(id, userId);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async softDelete(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      `UPDATE medications SET active = FALSE WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
    return (rowCount ?? 0) > 0;
  },
};
