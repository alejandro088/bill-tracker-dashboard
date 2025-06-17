<template>
    <div class="service-icon" :style="iconStyle">
        <img v-if="faviconUrl" :src="faviconUrl" :alt="service.name" class="service-favicon" @error="handleFaviconError">
        <v-icon v-else-if="serviceIcon" :icon="serviceIcon" :color="iconColor" />
        <v-icon v-else icon="mdi-bookmark" :color="defaultColor" />
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
    service: {
        type: Object,
        required: true
    }
});

const faviconUrl = ref(null);
const faviconError = ref(false);

// Mapeo de servicios populares a sus iconos MDI
const popularServices = {
    netflix: { icon: 'mdi-netflix', color: 'error' },
    youtube: { icon: 'mdi-youtube', color: 'error' },
    chatgpt: { icon: 'mdi-robot', color: 'success' },
    spotify: { icon: 'mdi-spotify', color: 'success' },
    amazon: { icon: 'mdi-shopping', color: 'warning' },
    amazonprime: { icon: 'mdi-video', color: 'warning' },
    disney: { icon: 'mdi-disney-plus', color: 'info' },
    github: { icon: 'mdi-github', color: 'grey-darken-3' },
    google: { icon: 'mdi-google', color: 'primary' },
    microsoft: { icon: 'mdi-microsoft', color: 'info' },
    apple: { icon: 'mdi-apple', color: 'grey-darken-3' },
    dropbox: { icon: 'mdi-dropbox', color: 'primary' },
    slack: { icon: 'mdi-slack', color: 'purple' }
};

const serviceIcon = computed(() => {
    if (props.service.iconKey && popularServices[props.service.iconKey.toLowerCase()]) {
        return popularServices[props.service.iconKey.toLowerCase()].icon;
    }
    if (props.service.customIconKey) {
        return props.service.customIconKey;
    }
    return null;
});

const iconColor = computed(() => {
    if (props.service.iconKey && popularServices[props.service.iconKey.toLowerCase()]) {
        return popularServices[props.service.iconKey.toLowerCase()].color;
    }
    return 'grey';
});

onMounted(() => {
    if (props.service.customIconUrl) {
        faviconUrl.value = props.service.customIconUrl;
    } else if (props.service.url && !props.service.iconKey) {
        // Solo intentamos obtener el favicon si no hay un ícono personalizado o uno predefinido
        const domain = new URL(props.service.url).hostname;
        faviconUrl.value = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    }
});

const defaultColor = computed(() => {
    switch (props.service.category) {
        case 'utilities':
            return 'blue';
        case 'subscriptions':
            return 'purple';
        case 'taxes':
            return 'red';
        default:
            return 'grey';
    }
});

const iconStyle = computed(() => ({
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    overflow: 'hidden'
}));

const handleFaviconError = () => {
    faviconError.value = true;
    faviconUrl.value = null;
};

onMounted(() => {
    if (props.service.url && !props.service.iconKey) {
        try {
            const url = new URL(props.service.url);
            faviconUrl.value = `https://www.google.com/s2/favicons?sz=32&domain=${url.hostname}`;
        } catch (error) {
            console.warn('Invalid URL:', props.service.url);
            faviconUrl.value = null;
        }
    }
});
</script>

<style scoped>
.service-icon {
    background: rgba(0, 0, 0, 0.04);
}

.service-favicon {
    width: 16px;
    height: 16px;
    object-fit: contain;
}
</style>
