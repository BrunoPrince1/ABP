import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// ─── Segurança ────────────────────────────────────────────
app.use(helmet());

app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS ?? '').split(',').map((o) => o.trim()),
  credentials: true,
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Muitas requisições. Tente novamente em instantes.' },
}));

// ─── Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Rotas ────────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 ──────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Rota não encontrada' });
});

// ─── Erros ────────────────────────────────────────────────
app.use(errorHandler);

export default app;
