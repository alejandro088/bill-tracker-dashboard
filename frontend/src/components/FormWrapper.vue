<template>
  <div>
    <slot
      :loading="loading"
      :generalError="generalError"
      :fieldErrors="fieldErrors"
      :hasFieldErrors="hasFieldErrors"
      :submit="submit"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import useValidationErrors from '../composables/useValidationErrors.js';
import api from '../api.js';

const props = defineProps({
  urlOnSubmit: { type: String, required: true },
  method: { type: String, default: 'post' },
  closeOnSuccess: { type: Boolean, default: false }
});

const emit = defineEmits(['success', 'error']);

const { generalError, setFromResponse, fieldErrors, hasFieldErrors, clearErrors } = useValidationErrors();
const loading = ref(false);

async function submit(payload) {
  clearErrors();
  loading.value = true;
  try {
    const method = props.method.toLowerCase();
    let res;
    if (method === 'post') res = await api.post(props.urlOnSubmit, payload);
    else if (method === 'put') res = await api.put(props.urlOnSubmit, payload);
    else if (method === 'patch') res = await api.patch(props.urlOnSubmit, payload);
    else if (method === 'delete') res = await api.delete(props.urlOnSubmit, { data: payload });
    else res = await api.request({ url: props.urlOnSubmit, method, data: payload });

    loading.value = false;
    emit('success', res);
    return res;
  } catch (err) {
    setFromResponse(err);
    loading.value = false;
    emit('error', err);
    throw err;
  }
}
</script>
