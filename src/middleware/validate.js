import { ZodError } from 'zod';
import { logWarn } from '../utils/logger.js';

/**
 * Middleware para validar request body, query o params con un schema de Zod
 * @param {Object} schema - Schema de Zod para validar
 * @param {string} source - De dónde extraer los datos: 'body', 'query', o 'params'
 * @returns {Function} Middleware de Express
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const validated = schema.parse(dataToValidate);
      
      // Reemplazar los datos originales con los validados y transformados
      req[source] = validated;
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formatear errores de Zod para respuesta user-friendly
        const rawErrors = error.issues || [];
        const errors = rawErrors.map(err => ({
          field: err.path?.join('.') || 'unknown',
          message: err.message
        }));
        
        logWarn('Validation failed', {
          source,
          path: req.path,
          method: req.method,
          errors
        });
        
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors
        });
      }
      
      // Error inesperado durante validación
      logWarn('Unexpected validation error', {
        source,
        path: req.path,
        method: req.method,
        error: error.message || error.toString()
      });
      next(error);
    }
  };
};

/**
 * Middleware para validar múltiples fuentes (body, query, params)
 * @param {Object} schemas - Objeto con schemas por fuente: { body: schema, query: schema }
 * @returns {Function} Middleware de Express
 */
export const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const errors = [];
    
    try {
      // Validar cada fuente especificada
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema) {
          const validated = schema.parse(req[source]);
          req[source] = validated;
        }
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        logWarn('Multi-source validation failed', {
          errors: formattedErrors,
          path: req.path,
          method: req.method
        });
        
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: formattedErrors
        });
      }
      
      next(error);
    }
  };
};

/**
 * Validación parcial - útil para updates donde no todos los campos son requeridos
 * @param {Object} schema - Schema de Zod
 * @param {string} source - Fuente de datos
 * @returns {Function} Middleware de Express
 */
export const validatePartial = (schema, source = 'body') => {
  return validate(schema.partial(), source);
};

export default validate;
