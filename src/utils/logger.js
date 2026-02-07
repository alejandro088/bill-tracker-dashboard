import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const logLevel = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';

// Formato personalizado para logs
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Agregar metadata si existe
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    
    // Agregar stack trace si es un error
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Configuración de transports según el entorno
const transports = [];

// En desarrollo, loguear a consola con colores
if (nodeEnv === 'development') {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    })
  );
}

// En producción, loguear a archivo y consola sin colores
if (nodeEnv === 'production') {
  transports.push(
    new winston.transports.Console({
      format: customFormat
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: customFormat
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: customFormat
    })
  );
}

// En testing, reducir logging
if (nodeEnv === 'test') {
  transports.push(
    new winston.transports.Console({
      level: 'error',
      format: customFormat,
      silent: true // Silenciar en tests
    })
  );
}

// Crear el logger
const logger = winston.createLogger({
  level: logLevel,
  format: customFormat,
  transports,
  // No salir en errores no capturados
  exitOnError: false
});

// Métodos de conveniencia
export const logInfo = (message, meta = {}) => logger.info(message, meta);
export const logWarn = (message, meta = {}) => logger.warn(message, meta);
export const logError = (message, error = null, meta = {}) => {
  if (error instanceof Error) {
    logger.error(message, { ...meta, error: error.message, stack: error.stack });
  } else {
    logger.error(message, meta);
  }
};
export const logDebug = (message, meta = {}) => logger.debug(message, meta);

export default logger;
