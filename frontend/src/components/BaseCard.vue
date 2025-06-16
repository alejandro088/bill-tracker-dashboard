<template>
    <div
        class="card"
        :class="{
            'card-success': type === 'success',
            'card-warning': type === 'warning',
            'card-danger': type === 'danger',
            clickable: clickable,
        }"
    >
        <div class="card-icon" v-if="$slots.icon">
            <slot name="icon">
                <v-icon v-if="icon" :icon="icon" size="large" />
            </slot>
        </div>
        <div class="card-content">
            <div class="card-header">
                <div class="card-title">
                    <slot name="title">{{ title }}</slot>
                </div>
                <div class="card-subtitle" v-if="subtitle || $slots.subtitle">
                    <slot name="subtitle">{{ subtitle }}</slot>
                </div>
            </div>
            <div class="card-value">
                <slot name="value"></slot>
            </div>
            <div class="card-footer" v-if="$slots.footer">
                <slot name="footer"></slot>
            </div>

            <div class="card-body">
                <slot />
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    type: {
        type: String,
        default: 'default',
        validator: (value) =>
            ['default', 'success', 'warning', 'danger'].includes(value),
    },
    icon: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: '',
    },
    subtitle: {
        type: String,
        default: '',
    },
    clickable: {
        type: Boolean,
        default: false,
    },
});
</script>

<style scoped>
.card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
    display: flex;
    align-items: flex-start;
    gap: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease-in-out;
    border-left: 4px solid transparent;
    height: 100%;
}

.card.clickable {
    cursor: pointer;
}

.card.clickable:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}

.card.card-success {
    border-left-color: var(--color-success, #4caf50);
    background: linear-gradient(
        to right,
        var(--color-success-light, rgba(76, 175, 80, 0.05)),
        transparent 50%
    );
}

.card.card-success .card-icon {
    color: var(--color-success, #4caf50);
    background: var(--color-success-light, rgba(76, 175, 80, 0.1));
}

.card.card-warning {
    border-left-color: var(--color-warning, #ff9800);
    background: linear-gradient(
        to right,
        var(--color-warning-light, rgba(255, 152, 0, 0.05)),
        transparent 50%
    );
}

.card.card-warning .card-icon {
    color: var(--color-warning, #ff9800);
    background: var(--color-warning-light, rgba(255, 152, 0, 0.1));
}

.card.card-danger {
    border-left-color: var(--color-danger, #f44336);
    background: linear-gradient(
        to right,
        var(--color-danger-light, rgba(244, 67, 54, 0.05)),
        transparent 50%
    );
}

.card.card-danger .card-icon {
    color: var(--color-danger, #f44336);
    background: var(--color-danger-light, rgba(244, 67, 54, 0.1));
}

.card-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background-light, rgba(0, 0, 0, 0.04));
    border-radius: 12px;
    transition: all 0.2s ease-in-out;
}

.card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.card-header {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.card-title {
    font-size: 0.9rem;
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
    font-weight: 500;
}

.card-subtitle {
    font-size: 0.8rem;
    color: var(--color-text-tertiary, rgba(0, 0, 0, 0.4));
}

.card-value {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--color-text-primary, rgba(0, 0, 0, 0.87));
    line-height: 1.2;
}

.card-footer {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--color-border, rgba(0, 0, 0, 0.08));
    font-size: 0.85rem;
    color: var(--color-text-secondary, rgba(0, 0, 0, 0.6));
}
</style>
