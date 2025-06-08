<template>
  <div>
    <v-btn
      v-if="!open"
      class="chat-toggle"
      color="primary"
      icon="mdi-message-outline"
      @click="open = true"
    />

    <v-card v-else class="chat-panel elevation-12">
      <div class="d-flex justify-space-between align-center px-2 py-1">
        <span class="font-weight-medium">Assistant</span>
        <v-btn icon size="small" @click="open = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      <div class="chat-window">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['bubble', msg.from]"
        >
          {{ msg.text }}
        </div>
      </div>
      <v-switch v-model="llmMode" label="LLM Mode" density="compact" class="mb-1" />
      <v-text-field
        v-model="input"
        label="Ask a question"
        density="compact"
        append-inner-icon="mdi-send"
        @click:append-inner="send"
        @keyup.enter="send"
      />
      <div class="d-flex justify-space-between px-2 pb-2">
        <v-btn color="primary" @click="send">Send</v-btn>
        <v-btn variant="text" @click="resetConversation">New conversation</v-btn>
      </div>
    </v-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import api from '../api.js';

const open = ref(false);
const messages = ref([]);
const input = ref('');
const llmMode = ref(true);

onMounted(() => {
  const saved = localStorage.getItem('chatbot_messages');
  messages.value = saved
    ? JSON.parse(saved)
    : [{ from: 'bot', text: 'Hi! Ask me about your bills.' }];
});

watch(messages, val => {
  localStorage.setItem('chatbot_messages', JSON.stringify(val));
}, { deep: true });

async function resetConversation() {
  try {
    await api.post('/chat/reset');
  } catch (e) {
    // ignore errors when resetting
  }
  messages.value = [{ from: 'bot', text: 'Hi! Ask me about your bills.' }];
}

async function send() {
  if (!input.value.trim()) return;
  messages.value.push({ from: 'user', text: input.value });
  const answer = await handleQuery(input.value);
  messages.value.push({ from: 'bot', text: answer });
  input.value = '';
}

async function handleQuery(q) {
  if (!llmMode.value) return await manualHandleQuery(q);
  try {
    const { data } = await api.post('/assistant/ask', { query: q.slice(0, 200) });
    return data.answer || "Sorry, I couldn't understand your question.";
  } catch (err) {
    return "Sorry, I couldn't understand your question.";
  }
}

async function manualHandleQuery(q) {
  const query = q.toLowerCase();
  try {
    if (query.includes('paypal')) {
      const { data } = await api.get('/bills', {
        params: { status: 'paid', paymentProvider: 'PayPal', limit: 1000 }
      });
      const bills = data.data;
      return bills.length
        ? bills.map((b) => `${b.name} - $${b.amount.toFixed(2)}`).join('\n')
        : 'No PayPal payments found.';
    }
    if (query.includes('last month')) {
      const { data } = await api.get('/bills', { params: { status: 'paid', limit: 1000 } });
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      const bills = data.data.filter((b) => {
        const d = new Date(b.paidAt || b.dueDate);
        return d >= start && d < end;
      });
      const total = bills.reduce((sum, b) => sum + b.amount, 0);
      return `You spent $${total.toFixed(2)} last month.`;
    }
    if (query.includes('paid subscriptions')) {
      const { data } = await api.get('/bills', {
        params: { status: 'paid', category: 'subscriptions', limit: 1000 }
      });
      const bills = data.data;
      return bills.length
        ? bills.map((b) => `${b.name} - $${b.amount.toFixed(2)}`).join('\n')
        : 'No paid subscriptions found.';
    }
  } catch (err) {
    return 'An error occurred while fetching data.';
  }
  return "Sorry, I didn't understand that.";
}
</script>

<style scoped>
.chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}
.chat-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  max-height: 380px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}
.chat-window {
  flex: 1;
  overflow-y: auto;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
  padding: 8px;
}
.bubble {
  max-width: 80%;
  margin-bottom: 6px;
  padding: 6px 10px;
  border-radius: 8px;
}
.bubble.user {
  background-color: #e0e0e0;
  align-self: flex-end;
}
.bubble.bot {
  background-color: #d1eaff;
  align-self: flex-start;
}
</style>
