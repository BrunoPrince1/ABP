import 'dotenv/config';
import app from './app';
import { connectDB } from './db/connection';
import { startAlertScheduler } from './services/alertScheduler';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT ?? '3000', 10);

async function bootstrap() {
  await connectDB();
  startAlertScheduler();

  app.listen(PORT, () => {
    logger.info(`🚀 MediBox API rodando em http://localhost:${PORT}`);
    logger.info(`📋 Ambiente: ${process.env.NODE_ENV ?? 'development'}`);
  });
}

bootstrap().catch((err) => {
  logger.error('Falha ao iniciar servidor', err);
  process.exit(1);
});
