<template>
  <div class="register-page">
    <h2>Registrar usuario</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label>Usuario</label>
        <input v-model="username" />
      </div>
      <div>
        <label>Email</label>
        <input v-model="email" />
      </div>
      <div>
        <label>Contraseña</label>
        <input type="password" v-model="password" />
      </div>
      <button type="submit">Crear cuenta</button>
    </form>
    <p v-if="error" style="color:red">{{ error }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../composables/useAuth.js';

export default {
  setup() {
    const username = ref('');
    const email = ref('');
    const password = ref('');
    const error = ref(null);
    const router = useRouter();

    async function onSubmit() {
      error.value = null;
      try {
        await register(username.value, email.value, password.value);
        router.push('/login');
      } catch (e) {
        error.value = e.response?.data?.message || 'Error al registrar';
      }
    }

    return { username, email, password, error, onSubmit };
  }
};
</script>

<style scoped>
.register-page { max-width: 360px; margin: 40px auto; }
label { display:block; margin-top:8px }
input { width:100%; padding:8px; box-sizing:border-box }
button { margin-top:12px }
</style>
