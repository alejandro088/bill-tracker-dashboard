<template>
  <v-container>
    <h2>Assistant</h2>
    <div class="chat-window">
      <div
        v-for="(msg, index) in messages"
        :key="index"
        :class="['bubble', msg.from]"
      >
        {{ msg.text }}
      </div>
    </div>
    <v-switch v-model="llmMode" label="LLM Mode" class="mb-2" />
    <v-text-field
      v-model="input"
      label="Ask a question"
      density="compact"
      append-inner-icon="mdi-send"
      @click:append-inner="send"
      @keyup.enter="send"
    />
    <v-btn color="primary" @click="resetConversation" class="mt-2">
      Nueva conversación
    </v-btn>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api.js';

const messages = ref([{ from: 'bot', text: 'Hi! Ask me about your bills.' }]);
const input = ref('');
const llmMode = ref(true);

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
.chat-window {
  border: 1px solid #ccc;
  min-height: 200px;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}
.bubble {
  max-width: 80%;
  margin-bottom: 6px;
  padding: 8px 12px;
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

