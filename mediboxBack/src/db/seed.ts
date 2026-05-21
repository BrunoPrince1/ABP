import bcrypt from 'bcryptjs';
import { pool } from './connection';
import { logger } from '../utils/logger';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Usuário demo
    const hash = await bcrypt.hash('medibox123', 10);
    const { rows: [user] } = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`,
      ['Usuário Demo', 'demo@medibox.com', hash],
    );

    // Dispositivo
    await client.query(
      `INSERT INTO devices (user_id, name, device_key, is_online, battery_level, firmware_version)
       VALUES ($1, $2, $3, TRUE, 78, 'v1.2.0')
       ON CONFLICT (device_key) DO NOTHING`,
      [user.id, 'MediBox Principal', 'MBX-0042'],
    );

    // Responsável
    await client.query(
      `INSERT INTO responsibles (user_id, name, phone, email)
       VALUES ($1, $2, $3, $4)`,
      [user.id, 'Responsável Demo', '(12) 99999-0000', 'responsavel@medibox.com'],
    );

    // Medicamentos
    const meds = [
      { name: 'Metformina', dosage: '500mg', compartment: 1, color: 'blue',  times: ['08:00', '20:00'] },
      { name: 'Losartana',  dosage: '50mg',  compartment: 2, color: 'amber', times: ['14:00'] },
      { name: 'AAS',        dosage: '100mg', compartment: 3, color: 'green', times: ['22:00'] },
    ];

    for (const m of meds) {
      const { rows: [med] } = await client.query(
        `INSERT INTO medications (user_id, name, dosage, compartment, color)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user.id, m.name, m.dosage, m.compartment, m.color],
      );
      for (const time of m.times) {
        await client.query(
          `INSERT INTO schedules (medication_id, time) VALUES ($1, $2)`,
          [med.id, time],
        );
      }
    }

    await client.query('COMMIT');
    logger.info('Seed concluído. Login: demo@medibox.com / medibox123');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  logger.error('Erro no seed', err);
  process.exit(1);
});
