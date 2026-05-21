import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? format.json()
      : format.combine(
          format.colorize(),
          format.printf(({ timestamp, level, message, ...meta }) => {
            const extra = Object.keys(meta).length ? JSON.stringify(meta) : '';
            return `${timestamp} [${level}] ${message} ${extra}`;
          }),
        ),
  ),
  transports: [new transports.Console()],
});
