<template>
    <v-menu offset-y attach="body">
        <template #activator="{ props }">
            <v-btn icon v-bind="props" class="mx-2">
                <v-badge
                    :content="unreadNotifications.length"
                    color="red"
                    overlap
                    v-if="unreadNotifications.length"
                >
                    <v-icon>mdi-bell</v-icon>
                </v-badge>
                <v-icon v-else>mdi-bell</v-icon>
            </v-btn>
        </template>

        <v-card
            class="notifications-menu"
            max-width="400"
            min-width="320"
            elevation="3"
        >
            <v-card-text class="text-subtitle-1 px-4 py-2 d-flex align-center justify-space-between">
                <span>Notificaciones no leídas</span>
                <v-chip v-if="unreadCount" size="small" color="error" class="ml-2">{{ unreadCount }}</v-chip>
            </v-card-text>

            <v-divider></v-divider>

            <div v-if="loading" class="pa-4 text-center">
                <v-progress-circular indeterminate color="primary" size="24" class="mr-2"></v-progress-circular>
                <span class="text-medium-emphasis">Cargando...</span>
            </div>

            <v-list v-else class="notifications-list pa-0" density="comfortable">
                <template v-if="!unreadNotifications.length">
                    <v-list-item class="empty-notifications">
                        <v-list-item-subtitle
                            class="text-center py-4 text-medium-emphasis"
                        >
                            <v-icon class="mb-2">mdi-bell-off-outline</v-icon>
                            <div>No hay notificaciones por leer</div>
                        </v-list-item-subtitle>
                    </v-list-item>
                </template>

                <template v-else>
                    <v-list-item
                        v-for="(notification, i) in unreadNotifications.slice(0, 5)"
                        :key="notification.id"
                        :value="notification"
                        class="notification-item unread"
                        @click="handleNotificationClick(notification)"
                    >
                        <div class="notification-header d-flex align-center mb-1">
                            <v-avatar :color="getTypeColor(notification.type)" size="24" class="mr-2">
                                <v-icon size="small" color="white">{{ getTypeIcon(notification.type) }}</v-icon>
                            </v-avatar>
                            <div class="notification-title">
                                {{ notification.title }}
                            </div>
                        </div>
                        <div class="notification-message">
                            {{ notification.message }}
                        </div>
                        <div class="notification-date">
                            {{
                                formatDateRelative(
                                    new Date(notification.createdAt)
                                )
                            }}
                        </div>
                    </v-list-item>

                    <v-divider v-if="unreadCount > 5"></v-divider>

                    <v-list-item
                        v-if="unreadCount > 5"
                        to="/notifications"
                        class="view-more text-center py-2"
                        variant="text"
                    >
                        <v-list-item-subtitle>
                            <span class="view-more-text">
                                Ver
                                {{ unreadCount - 5 }} notificaciones
                                más
                            </span>
                        </v-list-item-subtitle>
                    </v-list-item>
                </template>
            </v-list>

            <v-divider></v-divider>
            
            <v-card-actions>
                <v-btn
                    variant="text"
                    color="primary"
                    class="mx-auto"
                    size="small"
                    to="/notifications"
                    prepend-icon="mdi-bell-outline"
                >
                    Ver todas las notificaciones
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-menu>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { formatDateRelative } from '../utils/formatters';
import api from '../api';

const props = defineProps({
    // Este prop ya no es necesario, pero lo mantenemos por compatibilidad
    notifications: {
        type: Array,
        default: () => [],
    },
});

const router = useRouter();
const unreadNotifications = ref([]);
const loading = ref(false);
const error = ref(null);
const unreadCount = ref(0);

// Obtener notificaciones no leídas desde el API
const fetchUnreadNotifications = async () => {
    loading.value = true;
    try {
        const response = await api.get('/notifications/unread', {
            params: { limit: 100 }
        });
        unreadNotifications.value = response.data;
        
        // Obtener también el conteo total
        const countResponse = await api.get('/notifications/unread-count');
        unreadCount.value = countResponse.data.count;
    } catch (err) {
        console.error('Error al cargar notificaciones no leídas:', err);
        error.value = 'Error al cargar notificaciones';
    } finally {
        loading.value = false;
    }
};

// Manejar el clic en una notificación
const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    if (notification.actionUrl) {
        router.push(notification.actionUrl);
    }
};

// Marcar como leída
const markAsRead = async (id) => {
    try {
        await api.post(`/notifications/${id}/read`);
        // Eliminar la notificación de la lista
        unreadNotifications.value = unreadNotifications.value.filter(n => n.id !== id);
        // Decrementar el contador
        unreadCount.value--;
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
    }
};

// Iconos para los tipos de notificaciones
const getTypeIcon = (type) => {
    const icons = {
        'bill': 'mdi-currency-usd',
        'payment': 'mdi-check-circle',
        'reminder': 'mdi-clock-outline',
        'alert': 'mdi-alert',
        'info': 'mdi-information'
    };
    return icons[type] || 'mdi-bell';
};

// Colores para los tipos de notificaciones
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

// Cargar notificaciones inicialmente
onMounted(fetchUnreadNotifications);

</script>

<style>
.notification-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  padding: 12px 16px;
  gap: 4px;
  min-height: 85px;
  
  transition: background-color 0.2s ease;
}

.notification-item.unread {
  background-color: rgb(var(--v-theme-surface-variant));
}
.notification-item:hover {
  background-color: rgb(var(--v-theme-surface-variant));
  cursor: pointer;
}

/* Fuerza alineación a la izquierda de todo contenido interno */
.notification-item .v-list-item__content {
    min-width: 350px;
}
:deep(.v-list-item-subtitle),
:deep(.v-list-item-title),
.notification-title,
.notification-message,
.notification-date {
  text-align: left !important;
  width: 100%;
  margin: 0;
  padding: 0;
  display: block;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
  flex-grow: 1;
}

.notification-message {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notification-date {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: auto;
}

.notifications-list {
  max-height: 350px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin; /* Para Firefox */
  scrollbar-color: rgba(var(--v-theme-primary), 0.5) rgba(0, 0, 0, 0.05); /* Para Firefox - color más oscuro */
  padding-right: 2px; /* Añade espacio para la barra de desplazamiento */
}

.notifications-list::-webkit-scrollbar {
  width: 8px; /* Aumentado el ancho para mejor visibilidad */
}

.notifications-list::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  margin: 4px 0;
}

.notifications-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-primary), 0.5); /* Color más oscuro por defecto */
  border-radius: 8px;
  transition: background-color 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1); /* Borde sutil para mejorar la visibilidad */
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(var(--v-theme-primary), 0.7); /* Aún más oscuro al hacer hover */
}

.empty-notifications {
  opacity: 0.7;
}
.empty-notifications .v-icon {
  display: block;
  margin: 0 auto;
  font-size: 24px;
}
.empty-notifications .v-list-item-subtitle {
  text-align: center;
}

.view-more-text {
  color: rgb(var(--v-theme-primary));
  font-size: 0.875rem;
  font-weight: 500;
}

.notification-header {
  width: 100%;
}
</style>
