<template>
  <div class="login-page">
    <h2>Iniciar sesión</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label>Usuario</label>
        <input v-model="username" />
      </div>
      <div>
        <label>Contraseña</label>
        <input type="password" v-model="password" />
      </div>
      <button type="submit">Entrar</button>
    </form>
    <p v-if="error" style="color:red">{{ error }}</p>
    <p style="margin-top:12px">¿No tienes cuenta? <a @click.prevent="goRegister" href="/register">Regístrate</a></p>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../composables/useAuth.js';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const error = ref(null);
    const router = useRouter();

    async function onSubmit() {
      error.value = null;
      try {
        await login(username.value, password.value);
        router.push('/');
      } catch (e) {
        error.value = e.response?.data?.message || 'Error al iniciar sesión';
      }
    }

    function goRegister() {
      router.push('/register');
    }

    return { username, password, error, onSubmit, goRegister };
  }
};
</script>

<style scoped>
.login-page { max-width: 360px; margin: 40px auto; }
label { display:block; margin-top:8px }
input { width:100%; padding:8px; box-sizing:border-box }
button { margin-top:12px }
</style>
