# Sistema de Logging y Manejo de Errores

Este documento describe cómo usar el nuevo sistema de logging estructurado en el backend y el servicio centralizado de errores en el frontend.

---

## 🔧 Backend - Logger con Winston

### Uso básico

```javascript
import logger, { logInfo, logWarn, logError, logDebug } from './utils/logger.js';

// Logs simples
logInfo('Servidor iniciado');
logWarn('Configuración faltante');
logError('Error al conectar a DB');
logDebug('Variable X =', value);

// Logs con metadata
logInfo('Usuario autenticado', { userId: '123', email: 'user@example.com' });
logError('Error en operación', error, { operation: 'createBill', billId: 'abc' });
```

### Niveles de log

- **debug**: Información detallada de debugging (solo visible con LOG_LEVEL=debug)
- **info**: Información general del flujo de la aplicación
- **warn**: Advertencias que no interrumpen el funcionamiento
- **error**: Errores que requieren atención

### Configuración

Variables de entorno en `.env`:

```env
LOG_LEVEL=info           # Nivel mínimo de logs (debug|info|warn|error)
NODE_ENV=development     # Afecta formato y destino de logs
```

### Comportamiento por entorno

- **Development**: Logs en consola con colores
- **Production**: Logs en archivos (`logs/error.log` y `logs/combined.log`) y consola sin colores
- **Test**: Logs silenciados (solo errores críticos)

### Archivos de logs (producción)

- `logs/error.log`: Solo errores (level: error)
- `logs/combined.log`: Todos los niveles

---

## 🎨 Frontend - Servicio de Errores

### Uso en componentes Vue

```vue
<script setup>
import { useErrorHandler } from '@/composables/useErrorHandler';

const { handleError, currentError, getUserMessage, clearError } = useErrorHandler();

async function loadData() {
  try {
    const response = await api.get('/bills');
    // ...
  } catch (error) {
    handleError(error, 'Cargando facturas');
  }
}

// Usar con wrapper automático
const loadDataSafe = withErrorHandler(async () => {
  const response = await api.get('/bills');
  return response.data;
}, 'Cargando facturas');
</script>

<template>
  <v-alert v-if="currentError" type="error" closable @click:close="clearError">
    {{ getUserMessage() }}
  </v-alert>
</template>
```

### API del servicio

#### `handleError(error, context, options)`
Registra y procesa un error.

```javascript
import errorService from '@/utils/errorService';

errorService.handleError(error, 'Login de usuario', {
  level: 'warning',
  type: 'auth'
});
```

#### `onError(callback)`
Suscribirse a notificaciones de error.

```javascript
const unsubscribe = errorService.onError((errorData) => {
  console.log('Error:', errorData.message);
  showNotification(errorData);
});

// Desuscribirse cuando no se necesite más
unsubscribe();
```

#### `getHistory(limit)`
Obtener historial de errores.

```javascript
const lastErrors = errorService.getHistory(10);
```

### Tipos de error

- **network**: Error de conexión
- **validation**: Datos inválidos
- **auth**: Error de autenticación/autorización
- **server**: Error del servidor
- **unknown**: Error desconocido

### Niveles de error

- **info**: Información
- **warning**: Advertencia
- **error**: Error
- **critical**: Error crítico

---

## 📊 Ejemplos de Uso

### Backend: Log de operación completa

```javascript
import { logInfo, logError } from '../utils/logger.js';

export const createBill = async (data, userId) => {
  logInfo('Creating bill', { userId, amount: data.amount });
  
  try {
    const bill = await prisma.bill.create({ data });
    logInfo('Bill created successfully', { billId: bill.id, userId });
    return bill;
  } catch (error) {
    logError('Failed to create bill', error, { userId, data });
    throw error;
  }
};
```

### Frontend: Componente con manejo de errores

```vue
<script setup>
import { ref } from 'vue';
import { useErrorHandler } from '@/composables/useErrorHandler';
import api from '@/api';

const bills = ref([]);
const loading = ref(false);
const { handleError, currentError, getUserMessage, clearError } = useErrorHandler();

async function fetchBills() {
  loading.value = true;
  clearError();
  
  try {
    const response = await api.get('/api/bills');
    bills.value = response.data.data;
  } catch (error) {
    handleError(error, 'Obteniendo facturas');
  } finally {
    loading.value = false;
  }
}

onMounted(fetchBills);
</script>

<template>
  <div>
    <v-alert
      v-if="currentError"
      type="error"
      variant="tonal"
      closable
      @click:close="clearError"
    >
      {{ getUserMessage() }}
    </v-alert>
    
    <v-progress-linear v-if="loading" indeterminate />
    
    <!-- Contenido -->
  </div>
</template>
```

---

## 🚀 Migración desde console.log/error

### Antes

```javascript
console.log('User logged in:', user.email);
console.error('Error:', error.message);
```

### Después

```javascript
import { logInfo, logError } from './utils/logger.js';

logInfo('User logged in', { email: user.email });
logError('Authentication failed', error, { email: user.email });
```

---

## 🔍 Debugging

### Ver logs de debug en desarrollo

```bash
LOG_LEVEL=debug npm run dev
```

### Ver historial de errores en frontend

```javascript
import errorService from '@/utils/errorService';

// En DevTools Console
console.log(errorService.getHistory());
```

---

## 📝 Notas

- En **producción**, asegúrate de que el directorio `logs/` tenga permisos de escritura
- Los logs se rotan automáticamente cuando alcanzan el límite de tamaño
- El historial de errores del frontend mantiene solo los últimos 100 errores
- En **tests**, los logs están silenciados para no contaminar la salida

---

## 🤝 Contribuir

Al agregar nuevas funcionalidades:

1. Usa el logger apropiado según el nivel de importancia
2. Incluye metadata relevante (IDs, operación, contexto)
3. No uses `console.log/error` directamente en código de producción
4. En frontend, usa `handleError` para errores de API/async
