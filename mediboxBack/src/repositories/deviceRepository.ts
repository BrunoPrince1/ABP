import { pool } from '../db/connection';
import type { Device, AppNotification, NotificationType } from '../types';

// ─── Device ───────────────────────────────────────────────
export const deviceRepository = {
  async findByUser(userId: string): Promise<Device | null> {
    const { rows } = await pool.query<Device>(
      `SELECT * FROM devices WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    return rows[0] ?? null;
  },

  async findByKey(deviceKey: string): Promise<Device | null> {
    const { rows } = await pool.query<Device>(
      `SELECT * FROM devices WHERE device_key = $1`,
      [deviceKey],
    );
    return rows[0] ?? null;
  },

  async upsertHeartbeat(deviceKey: string, batteryLevel: number, signalStrength: string): Promise<void> {
    await pool.query(
      `UPDATE devices
       SET is_online = TRUE, last_sync = NOW(), battery_level = $2, signal_strength = $3
       WHERE device_key = $1`,
      [deviceKey, batteryLevel, signalStrength],
    );
  },

  async setOffline(deviceKey: string): Promise<void> {
    await pool.query(
      `UPDATE devices SET is_online = FALSE WHERE device_key = $1`,
      [deviceKey],
    );
  },
};

// ─── Notifications ────────────────────────────────────────
export const notificationRepository = {
  async findByUser(userId: string): Promise<AppNotification[]> {
    const { rows } = await pool.query<AppNotification>(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId],
    );
    return rows;
  },

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    body: string,
    medicationId?: string,
  ): Promise<AppNotification> {
    const { rows: [n] } = await pool.query<AppNotification>(
      `INSERT INTO notifications (user_id, type, title, body, medication_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, type, title, body, medicationId ?? null],
    );
    return n;
  },

  async markRead(id: string, userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, userId],
    );
  },

  async markAllRead(userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE user_id = $1`,
      [userId],
    );
  },
};
