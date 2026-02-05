<template>
  <div class="notifications-container">
    <BaseCard
      header="Notificaciones"
      :actions="cardActions"
    >
      <!-- Barra de búsqueda y filtros -->
      <div class="search-filter-bar">
        <v-text-field
          v-model="searchQuery"
          density="compact"
          variant="outlined"
          placeholder="Buscar notificaciones..."
          prepend-inner-icon="mdi-magnify"
          hide-details
          class="search-field"
          @update:model-value="debouncedSearch"
          clearable
        ></v-text-field>
        
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn 
              variant="outlined" 
              color="primary" 
              v-bind="props"
              class="filter-btn ml-2"
              :prepend-icon="activeFilters.length > 0 ? 'mdi-filter' : 'mdi-filter-outline'"
              :color="activeFilters.length > 0 ? 'primary' : undefined"
            >
              {{ activeFilters.length > 0 ? `Filtros (${activeFilters.length})` : 'Filtros' }}
            </v-btn>
          </template>
          
          <v-card min-width="300">
            <v-card-title class="text-subtitle-1 py-2">
              Filtrar por tipo
            </v-card-title>
            <v-divider></v-divider>
            <v-card-text class="pt-2">
              <v-chip-group v-model="activeFilters" column multiple>
                <v-chip 
                  v-for="filter in availableFilters" 
                  :key="filter.value" 
                  :value="filter.value"
                  filter
                  :variant="activeFilters.includes(filter.value) ? 'elevated' : 'outlined'"
                  class="filter-chip mb-2"
                >
                  <v-icon :icon="getTypeIconMaterial(filter.value)" size="small" class="mr-1"></v-icon>
                  {{ filter.label }}
                </v-chip>
              </v-chip-group>
              
              <v-divider class="my-2"></v-divider>
              
              <v-switch
                v-model="showUnreadOnly"
                color="primary"
                hide-details
                density="compact"
                label="Solo no leídas"
              ></v-switch>
              
              <div class="d-flex justify-end mt-3">
                <v-btn
                  variant="text"
                  color="primary"
                  @click="resetFilters"
                >
                  Limpiar filtros
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-menu>
      </div>
      
      <!-- Estado de carga -->
      <div v-if="loading" class="loading-state">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <p class="mt-2">Cargando notificaciones...</p>
      </div>
      
      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <v-icon icon="mdi-alert-circle" color="error" size="large" class="mb-2"></v-icon>
        <p>{{ error }}</p>
        <v-btn 
          variant="text" 
          color="primary" 
          @click="fetchNotifications"
          prepend-icon="mdi-refresh"
          class="mt-2"
        >
          Reintentar
        </v-btn>
      </div>
      
      <!-- Estado vacío -->
      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <v-icon icon="mdi-bell-off" size="large" class="mb-2"></v-icon>
        <p>{{ getEmptyStateMessage() }}</p>
        <v-btn 
          v-if="hasActiveFilters"
          variant="text" 
          color="primary" 
          @click="resetFilters"
          prepend-icon="mdi-filter-off"
        >
          Quitar filtros
        </v-btn>
      </div>
      
      <!-- Lista de notificaciones agrupadas por fecha -->
      <div v-else>
        <div v-for="(group, date) in groupedNotifications" :key="date" class="notification-group">
          <div class="date-header">
            <span class="date-label">{{ formatGroupDate(date) }}</span>
            <v-divider></v-divider>
          </div>
          
          <v-list class="notifications-list pa-0" lines="three">
            <v-list-item
              v-for="notification in group"
              :key="notification.id"
              :value="notification.id"
              :class="{ 'unread': !notification.read }"
              class="notification-item"
              :ripple="true"
              :lines="false"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-content">
                <div class="notification-header">
                  <v-avatar :color="getTypeColor(notification.type)" size="36" class="mr-3">
                    <v-icon :icon="getTypeIconMaterial(notification.type)" color="white"></v-icon>
                  </v-avatar>
                  <div class="d-flex flex-column flex-grow-1">
                    <span class="notification-title">{{ notification.title }}</span>
                    <span class="notification-date">{{ formatTime(notification.createdAt) }}</span>
                  </div>
                  <v-badge
                    v-if="!notification.read"
                    dot
                    color="primary"
                    offset-x="2"
                    offset-y="2"
                  ></v-badge>
                </div>
                <p class="notification-message">{{ notification.message }}</p>
              </div>
              <div class="notification-actions">
                <v-btn
                  v-if="!notification.read"
                  variant="text"
                  size="small"
                  color="primary"
                  icon="mdi-check"
                  @click.stop="markAsRead(notification.id)"
                >
                  <v-tooltip activator="parent" location="top">
                    Marcar como leído
                  </v-tooltip>
                </v-btn>
                <v-btn
                  v-if="notification.actionUrl"
                  variant="text"
                  size="small"
                  color="primary"
                  icon="mdi-arrow-right"
                  @click.stop="handleAction(notification)"
                >
                  <v-tooltip activator="parent" location="top">
                    Ver detalles
                  </v-tooltip>
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  color="error"
                  icon="mdi-delete"
                  @click.stop="confirmDelete(notification)"
                >
                  <v-tooltip activator="parent" location="top">
                    Eliminar
                  </v-tooltip>
                </v-btn>
              </div>
            </v-list-item>
          </v-list>
        </div>
      </div>
      
      <!-- Paginación -->
      <div v-if="pagination.totalPages > 1" class="pagination-container mt-4">
        <v-pagination
          v-model="pagination.page"
          :length="pagination.totalPages"
          :total-visible="5"
          rounded
          @update:model-value="handlePageChange"
        ></v-pagination>
      </div>
    </BaseCard>
    
    <!-- Diálogo de confirmación para eliminar -->
    <BaseConfirmDialog
      v-model="deleteDialog.show"
      :title="deleteDialog.title"
      :message="deleteDialog.message"
      @confirm="deleteNotification"
    />
    
    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Cerrar
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es';
import BaseCard from '../components/BaseCard.vue';
import BaseConfirmDialog from '../components/BaseConfirmDialog.vue';
import { formatDateRelative, formatDate as formatDateFn } from '../utils/formatters';
import api from '../api';

const router = useRouter();
const notifications = ref([]);
const loading = ref(false);
const error = ref(null);
const activeFilters = ref([]);
const showUnreadOnly = ref(false);
const searchQuery = ref('');

// Paginación
const pagination = ref({
  page: 1,
  pageSize: 10,
  total: 0,
  totalPages: 0
});

// Dialog de confirmación para eliminar
const deleteDialog = ref({
  show: false,
  title: '',
  message: '',
  notificationId: null
});

// Snackbar para mensajes
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
});

// Filtros disponibles
const availableFilters = [
  { value: 'bill', label: 'Facturas', icon: '💰' },
  { value: 'payment', label: 'Pagos', icon: '✅' },
  { value: 'info', label: 'Información', icon: 'ℹ️' },
  { value: 'alert', label: 'Alertas', icon: '⚠️' },
  { value: 'reminder', label: 'Recordatorios', icon: '⏰' }
];

// Acciones de la tarjeta
const cardActions = computed(() => {
  const actions = [
    { text: 'Marcar todo como leído', onClick: markAllAsRead, icon: 'mdi-check-all' },
  ];
  
  // Agregar opción para eliminar leídas si hay notificaciones leídas
  const hasReadNotifications = notifications.value.some(n => n.read);
  if (hasReadNotifications) {
    actions.push({ 
      text: 'Eliminar leídas', 
      onClick: confirmClearRead, 
      icon: 'mdi-delete-sweep' 
    });
  }
  
  return actions;
});

// Verificar si hay filtros activos
const hasActiveFilters = computed(() => {
  return activeFilters.value.length > 0 || showUnreadOnly.value || searchQuery.value;
});

// Notificaciones filtradas según los criterios activos
// Ya no es necesario filtrar aquí porque la API lo hace
const filteredNotifications = computed(() => {
  return notifications.value;
});

// Agrupar notificaciones por fecha
const groupedNotifications = computed(() => {
  const groups = {};
  
  if (!filteredNotifications.value || !Array.isArray(filteredNotifications.value)) {
    return {};
  }
  
  filteredNotifications.value.forEach(notification => {
    if (!notification || !notification.createdAt) {
      console.warn('Notificación sin fecha detectada:', notification);
      return;
    }
    try {
      const date = new Date(notification.createdAt).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    } catch (error) {
      console.error('Error procesando notificación:', notification, error);
    }
  });
  
  // Ordenar las fechas de más reciente a más antigua
  return Object.fromEntries(
    Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  );
});

// Debounce para la búsqueda
const debouncedSearch = debounce(() => {
  fetchNotifications();
}, 300);

// Formatear fecha para los grupos
const formatGroupDate = (dateString) => {
  try {
    if (!dateString) {
      return 'Fecha desconocida';
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Fecha inválida:', dateString);
      return 'Fecha inválida';
    }
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateString === today) {
      return 'Hoy';
    } else if (dateString === yesterday) {
      return 'Ayer';
    } else {
      return formatDateFn(date);
    }
  } catch (error) {
    console.error('Error formateando fecha:', dateString, error);
    return 'Error de formato';
  }
};

// Formatear hora
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// Mensaje para el estado vacío
const getEmptyStateMessage = () => {
  if (error.value) {
    return 'Error al cargar notificaciones';
  }
  
  if (loading.value) {
    return 'Cargando notificaciones...';
  }
  
  if (hasActiveFilters.value) {
    return 'No hay notificaciones con los filtros seleccionados';
  }
  
  return 'No hay notificaciones nuevas';
};

// Iconos para los tipos de notificación (Material Design)
const getTypeIconMaterial = (type) => {
  const icons = {
    'bill': 'mdi-currency-usd',
    'payment': 'mdi-check-circle',
    'reminder': 'mdi-clock-outline',
    'alert': 'mdi-alert',
    'info': 'mdi-information'
  };
  return icons[type] || 'mdi-bell';
};

// Colores para los tipos de notificación
const getTypeColor = (type) => {
  const colors = {
    'bill': 'indigo',
    'payment': 'success',
    'reminder': 'warning',
    'alert': 'error',
    'info': 'info'
  };
  return colors[type] || 'primary';
};

const formatDate = (date) => {
  return formatDateRelative(new Date(date));
};

// Resetear filtros
const resetFilters = () => {
  activeFilters.value = [];
  showUnreadOnly.value = false;
  searchQuery.value = '';
  fetchNotifications();
};

// Manejar cambio de página
const handlePageChange = (page) => {
  pagination.value.page = page;
  fetchNotifications();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Marcar notificación como leída
const markAsRead = async (id) => {
  try {
    await api.post(`/notifications/${id}/read`);
    const notification = notifications.value.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
    showSnackbar('Notificación marcada como leída', 'success');
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    showSnackbar('Error al marcar notificación como leída', 'error');
  }
};

// Marcar todas como leídas
const markAllAsRead = async () => {
  try {
    // Construir parámetros de filtro
    const params = {};
    if (activeFilters.value.length > 0) {
      params.type = activeFilters.value;
    }
    
    await api.post('/notifications/read-all', null, { params });
    
    // Actualizar el estado local
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    
    showSnackbar('Todas las notificaciones marcadas como leídas', 'success');
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    showSnackbar('Error al marcar todas las notificaciones como leídas', 'error');
  }
};

// Confirmar eliminación de notificación
const confirmDelete = (notification) => {
  deleteDialog.value = {
    show: true,
    title: 'Eliminar notificación',
    message: '¿Estás seguro de que deseas eliminar esta notificación?',
    notificationId: notification.id
  };
};

// Confirmar eliminación de todas las leídas
const confirmClearRead = () => {
  deleteDialog.value = {
    show: true,
    title: 'Eliminar notificaciones leídas',
    message: '¿Estás seguro de que deseas eliminar todas las notificaciones leídas?',
    notificationId: null,
    clearRead: true
  };
};

// Eliminar notificación
const deleteNotification = async () => {
  try {
    if (deleteDialog.value.clearRead) {
      // Eliminar todas las leídas
      await api.delete('/notifications/clear-read');
      // Actualizar lista
      notifications.value = notifications.value.filter(n => !n.read);
      showSnackbar('Notificaciones leídas eliminadas correctamente', 'success');
    } else if (deleteDialog.value.notificationId) {
      // Eliminar una notificación específica
      await api.delete(`/notifications/${deleteDialog.value.notificationId}`);
      // Actualizar lista
      notifications.value = notifications.value.filter(n => n.id !== deleteDialog.value.notificationId);
      showSnackbar('Notificación eliminada correctamente', 'success');
    }
  } catch (error) {
    console.error('Error al eliminar notificación:', error);
    showSnackbar('Error al eliminar notificación', 'error');
  } finally {
    deleteDialog.value.show = false;
  }
};

// Manejar clic en notificación
const handleNotificationClick = (notification) => {
  // Si no está leída, marcarla como leída
  if (!notification.read) {
    markAsRead(notification.id);
  }
  
  // Si tiene URL de acción, navegar
  if (notification.actionUrl) {
    handleAction(notification);
  }
};

// Manejar acción de notificación
const handleAction = (notification) => {
  if (notification.actionUrl) {
    router.push(notification.actionUrl);
  }
};

// Mostrar snackbar
const showSnackbar = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color,
    timeout: 3000
  };
};

// Cargar notificaciones con paginación y filtros
const fetchNotifications = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // Construir parámetros
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    };
    
    // Añadir filtro por tipo
    if (activeFilters.value.length > 0) {
      params.type = activeFilters.value;
    }
    
    // Añadir filtro por estado de lectura
    if (showUnreadOnly.value) {
      params.read = false;
    }
    
    // Añadir búsqueda
    if (searchQuery.value) {
      params.search = searchQuery.value;
    }
    
    // Realizar petición
    const response = await api.get('/notifications', { params });
    
    // Aplicar valores por defecto
    notifications.value = response.data.data.map(n => ({
      ...n,
      type: n.type || 'info',
      title: n.title || 'Notificación'
    }));
    
    // Actualizar paginación
    pagination.value = {
      ...pagination.value,
      ...response.data.pagination
    };
  } catch (err) {
    console.error('Error al cargar notificaciones:', err);
    error.value = 'Error al cargar notificaciones. Por favor, inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
};

// Cuando cambian los filtros, volver a la primera página y cargar
watch([activeFilters, showUnreadOnly], () => {
  pagination.value.page = 1;
  fetchNotifications();
});

onMounted(fetchNotifications);
</script>

<style>
.notifications-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.search-filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 8px;
}

.search-field {
  flex-grow: 1;
}

.filter-btn {
  white-space: nowrap;
}

.filter-chip {
  margin-right: 0.5rem;
}

.notifications-list {
  border-radius: 8px;
  overflow: hidden;
}

.notification-group {
  margin-bottom: 2rem;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.date-header {
  margin-bottom: 0.75rem;
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-header .v-divider {
  flex-grow: 1;
}

.date-label {
  position: relative;
  background-color: var(--v-theme-background);
  padding: 4px 10px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: background-color 0.3s ease;
  height: auto !important; /* Aseguramos que la altura sea automática */
  min-height: 82px; /* Altura mínima para asegurar consistencia */
  overflow: visible; /* Permitimos que el contenido fluya */
}

.notification-item.unread {
  background-color: rgba(var(--v-theme-primary), 0.05);
  position: relative;
}

.notification-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
  cursor: pointer;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-title {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.2;
  margin-bottom: 2px;
}

.notification-date {
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 0.8rem;
}

.notification-message {
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.87);
  line-height: 1.5;
}

.notification-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.empty-state,
.loading-state,
.error-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 1rem 0 0.5rem;
}

@media (max-width: 600px) {
  .search-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-btn {
    margin-left: 0 !important;
  }
  
  .notification-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .notification-actions {
    justify-content: flex-start;
  }
}
</style>
