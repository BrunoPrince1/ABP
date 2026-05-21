import { Pool } from 'pg';
import { logger } from '../utils/logger';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não definida nas variáveis de ambiente');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  logger.error('Erro inesperado no pool do PostgreSQL', err);
});

export async function connectDB(): Promise<void> {
  const client = await pool.connect();
  client.release();
  logger.info('PostgreSQL conectado com sucesso');
}
