<template>
  <div class="notifications-container">
    <BaseCard
      header="Notificaciones"
      :actions="[{ text: 'Marcar todo como leído', onClick: markAllAsRead }]"
    >
      <div v-if="notifications.length === 0" class="empty-state">
        No hay notificaciones nuevas
      </div>
      <ul v-else class="notifications-list">
        <li
          v-for="notification in notifications"
          :key="notification.id"
          :class="['notification-item', { unread: !notification.read }]"
        >
          <div class="notification-content">
            <div class="notification-header">
              <span :class="['notification-type', notification.type]">
                {{ getTypeIcon(notification.type) }}
              </span>
              <span class="notification-title">{{ notification.title }}</span>
              <span class="notification-date">{{ formatDate(notification.createdAt) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
          </div>
          <div class="notification-actions">
            <button
              class="action-button"
              @click="markAsRead(notification.id)"
              v-if="!notification.read"
            >
              Marcar como leído
            </button>
            <button
              class="action-button"
              @click="handleAction(notification)"
              v-if="notification.actionUrl"
            >
              Ver detalles
            </button>
          </div>
        </li>
      </ul>
    </BaseCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import BaseCard from '../components/BaseCard.vue';
import { formatDateRelative } from '../utils/formatters';

const router = useRouter();
const notifications = ref([]);

const getTypeIcon = (type) => {
  const icons = {
    'bill': '💰',
    'payment': '✅',
    'reminder': '⏰',
    'alert': '⚠️',
    'info': 'ℹ️'
  };
  return icons[type] || '📝';
};

const formatDate = (date) => {
  return formatDateRelative(new Date(date));
};

const markAsRead = async (id) => {
  try {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    const notification = notifications.value.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    notifications.value.forEach(notification => {
      notification.read = true;
    });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
  }
};

const handleAction = (notification) => {
  if (notification.actionUrl) {
    router.push(notification.actionUrl);
  }
};

const fetchNotifications = async () => {
  try {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    notifications.value = data;

    // Aplicar valores por defecto
    notifications.value = data.map(n => ({
      ...n,
      type: n.type || 'info',
      title: n.title || 'Notificación'
    }));
    console.log('Notificaciones cargadas:', notifications.value);
  } catch (error) {
    console.error('Error al cargar notificaciones:', error);
  }
};

onMounted(fetchNotifications);
</script>

<style>
.notifications-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.notifications-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.notification-item {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification-item.unread {
  background-color: var(--color-background-light);
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.notification-type {
  font-size: 1.2rem;
}

.notification-title {
  font-weight: 600;
  flex: 1;
}

.notification-date {
  color: var(--color-text-light);
  font-size: 0.875rem;
}

.notification-message {
  margin: 0;
  color: var(--color-text);
}

.notification-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.action-button {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  font-size: 0.875rem;
}

.action-button:hover {
  background: var(--color-background-light);
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-light);
}
</style>
