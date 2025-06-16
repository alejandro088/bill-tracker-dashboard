<template>
    <v-menu offset-y attach="body">
        <template #activator="{ props }">
            <v-btn icon v-bind="props" class="mx-2">
                <v-badge
                    :content="notifications.length"
                    color="red"
                    overlap
                    v-if="notifications.length"
                >
                    <v-icon>mdi-bell</v-icon>
                </v-badge>
                <v-icon v-else>mdi-bell</v-icon>
            </v-btn>
        </template>

        <!-- menú igual que antes -->
        <v-card
            class="notifications-menu"
            max-width="400"
            min-width="320"
            elevation="3"
        >
            <v-card-text class="text-subtitle-1 px-4 py-2">
                Notificaciones
            </v-card-text>

            <v-divider></v-divider>

            <v-list class="notifications-list pa-0" density="comfortable">
                <template v-if="!notifications.length">
                    <v-list-item class="empty-notifications">
                        <v-list-item-subtitle
                            class="text-center py-4 text-medium-emphasis"
                        >
                            <v-icon class="mb-2">mdi-bell-off-outline</v-icon>
                            <div>No hay notificaciones</div>
                        </v-list-item-subtitle>
                    </v-list-item>
                </template>

                <template v-else>
                    <v-list-item
                        v-for="(notification, i) in notifications.slice(0, 5)"
                        :key="i"
                        :value="notification"
                        class="notification-item"
                        :class="{ unread: !notification.read }"
                        :to="notification.actionUrl"
                    >
                        <div class="notification-title">
                            {{ notification.title }}
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

                    <v-divider v-if="notifications.length > 5"></v-divider>

                    <v-list-item
                        v-if="notifications.length > 5"
                        to="/notifications"
                        class="view-more text-center py-2"
                        variant="text"
                    >
                        <v-list-item-subtitle>
                            <span class="view-more-text">
                                Ver
                                {{ notifications.length - 5 }} notificaciones
                                más
                            </span>
                        </v-list-item-subtitle>
                    </v-list-item>
                </template>
            </v-list>
        </v-card>
    </v-menu>
</template>

<script>
import { formatDateRelative } from '../utils/formatters';

export default {
    name: 'NotificationMenu',
    props: {
        notifications: {
            type: Array,
            default: () => [],
        },
    },
    methods: {
        formatDateRelative,
    },
};
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
}

.notification-message {
  font-size: 0.875rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.notification-date {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-top: auto;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}
.notifications-list::-webkit-scrollbar {
  width: 8px;
}
.notifications-list::-webkit-scrollbar-track {
  background: transparent;
}
.notifications-list::-webkit-scrollbar-thumb {
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 4px;
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


</style>
