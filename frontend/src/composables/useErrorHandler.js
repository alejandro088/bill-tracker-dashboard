import { ref, onMounted, onUnmounted } from 'vue';
import errorService, { ERROR_LEVELS } from '../utils/errorService';

/**
 * Composable para manejo de errores en componentes Vue
 */
export function useErrorHandler() {
  const currentError = ref(null);
  const errorHistory = ref([]);

  let unsubscribe = null;

  onMounted(() => {
    // Suscribirse a errores
    unsubscribe = errorService.onError((errorData) => {
      currentError.value = errorData;
      errorHistory.value = errorService.getHistory(10);
    });
  });

  onUnmounted(() => {
    // Desuscribirse al desmontar
    if (unsubscribe) {
      unsubscribe();
    }
  });

  /**
   * Maneja un error y lo registra en el servicio
   */
  const handleError = (error, context = '') => {
    return errorService.handleError(error, context);
  };

  /**
   * Limpia el error actual
   */
  const clearError = () => {
    currentError.value = null;
  };

  /**
   * Obtiene un mensaje user-friendly del error actual
   */
  const getUserMessage = (errorData = currentError.value) => {
    if (!errorData) return '';
    return errorService.getUserMessage(errorData);
  };

  /**
   * Verifica si hay un error activo
   */
  const hasError = () => {
    return currentError.value !== null;
  };

  /**
   * Verifica si el error es crítico
   */
  const isCritical = () => {
    return currentError.value?.level === ERROR_LEVELS.CRITICAL;
  };

  /**
   * Envuelve una función async con manejo de errores
   */
  const withErrorHandler = (fn, context = '') => {
    return async (...args) => {
      try {
        return await fn(...args);
      } catch (error) {
        handleError(error, context);
        throw error; // Re-lanzar para que el componente pueda manejarlo si es necesario
      }
    };
  };

  return {
    currentError,
    errorHistory,
    handleError,
    clearError,
    getUserMessage,
    hasError,
    isCritical,
    withErrorHandler
  };
}
