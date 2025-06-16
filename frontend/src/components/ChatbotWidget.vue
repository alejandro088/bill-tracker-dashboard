<template>
  <div>
    <v-btn
      v-if="!open"
      class="chat-toggle"
      color="primary"
      size="large"
      elevation="4"
      @click="open = true"
    >
      <template #prepend>
        <v-icon>mdi-message-text-outline</v-icon>
      </template>
      <span class="chat-toggle-text">¿Necesitas ayuda?</span>
    </v-btn>

    <v-card v-else class="chat-panel elevation-12">
      <v-toolbar density="compact" color="primary" class="chat-header">
        <div class="d-flex align-center py-2 px-1">
          <v-icon color="white" class="mr-3" size="22">mdi-robot</v-icon>
          <span class="text-white font-weight-medium text-body-1">Asistente Financiero</span>
        </div>
        <template #append>
          <v-btn
            icon="mdi-close"
            variant="text"
            color="white"
            size="small"
            @click="open = false"
          />
        </template>
      </v-toolbar>
      <div class="chat-window">
        <div
          v-for="(msg, index) in messages"
          :key="index"
          :class="['bubble', msg.from]"
        >
          <div class="bubble-content">
            <v-icon
              v-if="msg.from === 'bot'"
              size="small"
              color="primary"
              class="mr-2"
            >mdi-robot</v-icon>
            <v-icon
              v-else
              size="small"
              color="grey-darken-1"
              class="mr-2"
            >mdi-account</v-icon>
            {{ msg.text }}
          </div>
          <div class="bubble-timestamp text-caption text-grey">
            {{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
          </div>
        </div>
      </div>
      
      <v-divider />
      
      <div class="chat-footer pa-2">
        <div class="d-flex align-center mb-2">
          <v-switch
            v-model="llmMode"
            label="Modo IA"
            density="compact"
            color="primary"
            hide-details
            class="mr-2"
          />
          <v-btn
            variant="text"
            size="small"
            color="grey-darken-1"
            prepend-icon="mdi-refresh"
            @click="resetConversation"
          >
            Nueva conversación
          </v-btn>
        </div>
        
        <v-text-field
          v-model="input"
          placeholder="Escribe tu pregunta..."
          density="compact"
          variant="outlined"
          hide-details
          class="chat-input"
          @keyup.enter="send"
        >
          <template #append-inner>
            <v-fade-transition>
              <v-btn
                v-if="input"
                color="primary"
                icon="mdi-send"
                variant="text"
                size="small"
                @click="send"
              />
            </v-fade-transition>
          </template>
        </v-text-field>
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
  min-width: 180px;
  border-radius: 24px;
}

.chat-toggle-text {
  margin-left: 4px;
  font-size: 0.9rem;
}

.chat-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 360px;
  height: 520px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border-radius: 12px;
  overflow: hidden;
}

.chat-header {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.chat-window {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: rgb(248, 249, 250);
}

.chat-footer {
  background-color: white;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.bubble {
  max-width: 85%;
  margin-bottom: 2px;
  display: flex;
  flex-direction: column;
}

.bubble-content {
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  align-items: flex-start;
  line-height: 1.4;
}

.bubble-timestamp {
  margin-top: 2px;
  padding: 0 4px;
}

.bubble.user {
  align-self: flex-end;
}

.bubble.user .bubble-content {
  background-color: rgb(var(--v-theme-primary));
  color: white;
  border-bottom-right-radius: 4px;
}

.bubble.user .bubble-timestamp {
  align-self: flex-end;
}

.bubble.bot {
  align-self: flex-start;
}

.bubble.bot .bubble-content {
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom-left-radius: 4px;
}

.bubble.bot .bubble-timestamp {
  align-self: flex-start;
}

.chat-input {
  border-radius: 24px;
}

/* Scrollbar styles */
.chat-window::-webkit-scrollbar {
  width: 6px;
}

.chat-window::-webkit-scrollbar-track {
  background: transparent;
}

.chat-window::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.chat-window::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
