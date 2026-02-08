import { ref } from 'vue';

export default function useValidationErrors() {
  const generalError = ref(null);
  const validationErrors = ref({});

  function clearErrors() {
    generalError.value = null;
    validationErrors.value = {};
  }

  function setFromResponse(err) {
    clearErrors();
    const data = err?.response?.data;
    if (data?.details && Array.isArray(data.details)) {
      const map = {};
      data.details.forEach(d => {
        if (d.field) {
          map[d.field] = map[d.field] || [];
          map[d.field].push(d.message);
        }
      });
      validationErrors.value = map;
      generalError.value = data.error || 'Datos de entrada inválidos';
    } else if (data?.error) {
      generalError.value = data.error;
    } else {
      generalError.value = err?.message || String(err);
    }
  }

  function fieldErrors(field) {
    return validationErrors.value[field] || [];
  }

  function hasFieldErrors(field) {
    return fieldErrors(field).length > 0;
  }

  return {
    generalError,
    validationErrors,
    clearErrors,
    setFromResponse,
    fieldErrors,
    hasFieldErrors
  };
}
