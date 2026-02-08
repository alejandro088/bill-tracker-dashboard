<template>
  <div class="reminder-preferences">
    <h3>Preferencias de recordatorios</h3>
    <form @submit.prevent="save">
      <div>
        <label>
          <input type="checkbox" v-model="form.reminderEnabled" /> Habilitar recordatorios por correo
        </label>
      </div>

      <div style="margin-top:8px;">
        <label>Días de antelación</label>
        <input type="number" min="1" max="30" v-model.number="form.reminderWindowDays" />
      </div>

      <div style="margin-top:8px;">
        <label>Canal</label>
        <select v-model="form.reminderChannel">
          <option value="email">Email</option>
          <option value="push">Push</option>
        </select>
      </div>

      <div style="margin-top:12px;">
        <button type="submit" :disabled="loading">Guardar</button>
        <span v-if="message" style="margin-left:8px;color:green">{{ message }}</span>
        <span v-if="error" style="margin-left:8px;color:red">{{ error }}</span>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import api from '../api.js';

export default {
  name: 'ReminderPreferences',
  setup() {
    const form = ref({ reminderEnabled: true, reminderWindowDays: 3, reminderChannel: 'email' });
    const loading = ref(false);
    const message = ref('');
    const error = ref('');

    const load = async () => {
      loading.value = true;
      message.value = '';
      error.value = '';
      try {
        const res = await api.get('/accounts/reminder/preferences');
        if (res && res.data) {
          form.value.reminderEnabled = res.data.reminderEnabled ?? true;
          form.value.reminderWindowDays = res.data.reminderWindowDays ?? 3;
          form.value.reminderChannel = res.data.reminderChannel ?? 'email';
        }
      } catch (e) {
        // no bloquear la UI si no existe; mostrar error
        error.value = (e.response && e.response.data && e.response.data.error) || 'Error al cargar preferencias';
      } finally {
        loading.value = false;
      }
    };

    const save = async () => {
      loading.value = true;
      message.value = '';
      error.value = '';
      try {
        const payload = {
          reminderEnabled: form.value.reminderEnabled,
          reminderWindowDays: form.value.reminderWindowDays,
          reminderChannel: form.value.reminderChannel
        };
        const res = await api.put('/accounts/reminder/preferences', payload);
        message.value = (res && res.data && res.data.message) || 'Guardado';
      } catch (e) {
        if (e.response && e.response.data && e.response.data.details) {
          error.value = e.response.data.details.map(d => d.message).join(', ');
        } else {
          error.value = (e.response && e.response.data && (e.response.data.error || e.response.data.message)) || 'Error al guardar preferencias';
        }
      } finally {
        loading.value = false;
      }
    };

    onMounted(load);

    return { form, loading, load, save, message, error };
  }
};
</script>

<style scoped>
.reminder-preferences {
  max-width: 420px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
}
</style>
