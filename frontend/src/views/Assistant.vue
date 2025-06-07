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
    <v-text-field
      v-model="input"
      label="Ask a question"
      density="compact"
      append-inner-icon="mdi-send"
      @click:append-inner="send"
      @keyup.enter="send"
    />
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import api from '../api.js';

const messages = ref([{ from: 'bot', text: 'Hi! Ask me about your bills.' }]);
const input = ref('');
const lastContext = ref({});
const CONTEXT_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function clearStaleContext() {
  if (lastContext.value.time && Date.now() - lastContext.value.time > CONTEXT_TIMEOUT) {
    lastContext.value = {};
  }
}

async function send() {
  if (!input.value.trim()) return;
  clearStaleContext();
  messages.value.push({ from: 'user', text: input.value });
  const answer = await handleQuery(input.value);
  messages.value.push({ from: 'bot', text: answer });
  input.value = '';
}

async function handleQuery(q) {
  const context = parseQuery(q);
  if (context.intent === 'reset') {
    lastContext.value = {};
    return 'Context cleared.';
  }

  const ctx = { ...lastContext.value, ...context, time: Date.now() };
  lastContext.value = ctx;

  const params = { limit: 1000 };
  if (ctx.status) params.status = ctx.status;
  if (ctx.provider) params.paymentProvider = ctx.provider;
  if (ctx.category) params.category = ctx.category;

  try {
    const { data } = await api.get('/bills', { params });
    let bills = data.data;

    if (ctx.date === 'last_month') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      bills = bills.filter((b) => {
        const d = new Date(b.paidAt || b.dueDate);
        return d >= start && d < end;
      });
    }

    if (ctx.intent === 'summary') {
      const total = bills.reduce((sum, b) => sum + b.amount, 0);
      let msg = `You spent $${total.toFixed(2)}`;
      if (ctx.provider) msg += ` with ${ctx.provider}`;
      if (ctx.date === 'last_month') msg += ' last month';
      return msg + '.';
    }

    if (ctx.intent === 'list') {
      return bills.length
        ? bills.map((b) => `${b.name} - $${b.amount.toFixed(2)}`).join('\n')
        : 'No matching bills found.';
    }
  } catch (err) {
    return 'An error occurred while fetching data.';
  }
  return "Sorry, I didn't understand that.";
}

function parseQuery(q) {
  const query = q.toLowerCase().trim();
  const ctx = {};
  if (/reset|clear/.test(query)) {
    ctx.intent = 'reset';
    return ctx;
  }
  if (query.includes('paypal')) ctx.provider = 'PayPal';
  if (query.includes('last month') || query.includes('mes pasado')) ctx.date = 'last_month';
  if (query.includes('paid subscriptions')) {
    ctx.category = 'subscriptions';
    ctx.status = 'paid';
    ctx.intent = 'list';
  }
  if (/how much|total|cu[áa]nto/.test(query)) ctx.intent = 'summary';
  if (!ctx.intent && (ctx.provider || ctx.category || ctx.date)) {
    ctx.intent = lastContext.value.intent || 'list';
  }
  return ctx;
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

