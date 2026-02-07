/**
 * Servicio centralizado para manejo de errores en el frontend
 */

// Niveles de error
export const ERROR_LEVELS = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

// Tipos de error comunes
export const ERROR_TYPES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTH: 'authentication',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

class ErrorService {
  constructor() {
    this.listeners = [];
    this.errorHistory = [];
    this.maxHistorySize = 100;
  }

  /**
   * Registra un listener para notificaciones de error
   * @param {Function} callback - Función a llamar cuando ocurre un error
   */
  onError(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Notifica a todos los listeners sobre un error
   * @param {Object} errorData - Datos del error
   */
  notifyListeners(errorData) {
    this.listeners.forEach(listener => {
      try {
        listener(errorData);
      } catch (err) {
        console.error('Error en listener de errores:', err);
      }
    });
  }

  /**
   * Procesa y categoriza un error
   * @param {Error|Object} error - Error a procesar
   * @param {string} context - Contexto donde ocurrió el error
   * @returns {Object} Error procesado
   */
  processError(error, context = '') {
    let errorData = {
      timestamp: new Date().toISOString(),
      context,
      level: ERROR_LEVELS.ERROR,
      type: ERROR_TYPES.UNKNOWN,
      message: 'Error desconocido',
      details: null,
      stack: null
    };

    // Error de Axios/Red
    if (error.response) {
      errorData.type = ERROR_TYPES.SERVER;
      errorData.message = error.response.data?.message || error.response.data?.error || 'Error del servidor';
      errorData.details = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data
      };

      // Clasificar por código de estado
      if (error.response.status === 401 || error.response.status === 403) {
        errorData.type = ERROR_TYPES.AUTH;
        errorData.level = ERROR_LEVELS.WARNING;
      } else if (error.response.status === 400) {
        errorData.type = ERROR_TYPES.VALIDATION;
        errorData.level = ERROR_LEVELS.WARNING;
      } else if (error.response.status >= 500) {
        errorData.level = ERROR_LEVELS.CRITICAL;
      }
    } 
    // Error de red
    else if (error.request) {
      errorData.type = ERROR_TYPES.NETWORK;
      errorData.message = 'Error de conexión. Verifica tu conexión a internet.';
      errorData.level = ERROR_LEVELS.ERROR;
      errorData.details = { request: error.request };
    }
    // Error de JavaScript
    else if (error instanceof Error) {
      errorData.message = error.message;
      errorData.stack = error.stack;
      errorData.details = { name: error.name };
    }
    // Objeto de error personalizado
    else if (typeof error === 'object') {
      errorData.message = error.message || JSON.stringify(error);
      errorData.details = error;
    }
    // String u otros tipos
    else {
      errorData.message = String(error);
    }

    return errorData;
  }

  /**
   * Registra un error en el historial y notifica a listeners
   * @param {Error|Object} error - Error a registrar
   * @param {string} context - Contexto donde ocurrió el error
   * @param {Object} options - Opciones adicionales
   */
  handleError(error, context = '', options = {}) {
    const errorData = this.processError(error, context);
    
    // Agregar opciones adicionales
    if (options.level) errorData.level = options.level;
    if (options.type) errorData.type = options.type;

    // Agregar al historial
    this.errorHistory.unshift(errorData);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.pop();
    }

    // Log en consola solo en desarrollo
    if (import.meta.env.DEV) {
      const consoleMethod = errorData.level === ERROR_LEVELS.CRITICAL ? 'error' : 
                           errorData.level === ERROR_LEVELS.WARNING ? 'warn' : 
                           'log';
      console[consoleMethod](`[${errorData.level.toUpperCase()}] ${context}:`, errorData.message, errorData.details);
    }

    // Notificar a listeners
    this.notifyListeners(errorData);

    return errorData;
  }

  /**
   * Registra un mensaje informativo
   */
  info(message, context = '') {
    return this.handleError(
      { message }, 
      context, 
      { level: ERROR_LEVELS.INFO }
    );
  }

  /**
   * Registra una advertencia
   */
  warn(message, context = '') {
    return this.handleError(
      { message }, 
      context, 
      { level: ERROR_LEVELS.WARNING }
    );
  }

  /**
   * Obtiene el historial de errores
   * @param {number} limit - Número máximo de errores a retornar
   * @returns {Array} Historial de errores
   */
  getHistory(limit = 50) {
    return this.errorHistory.slice(0, limit);
  }

  /**
   * Limpia el historial de errores
   */
  clearHistory() {
    this.errorHistory = [];
  }

  /**
   * Obtiene un mensaje user-friendly basado en el error
   * @param {Object} errorData - Datos del error procesado
   * @returns {string} Mensaje para mostrar al usuario
   */
  getUserMessage(errorData) {
    switch (errorData.type) {
      case ERROR_TYPES.NETWORK:
        return 'No se pudo conectar al servidor. Verifica tu conexión.';
      case ERROR_TYPES.AUTH:
        return 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.';
      case ERROR_TYPES.VALIDATION:
        return errorData.message || 'Los datos ingresados no son válidos.';
      case ERROR_TYPES.SERVER:
        return errorData.message || 'Error del servidor. Intenta nuevamente.';
      default:
        return 'Ocurrió un error inesperado. Intenta nuevamente.';
    }
  }
}

// Instancia singleton
const errorService = new ErrorService();

export default errorService;
