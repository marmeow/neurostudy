<script setup>
import { ref, computed, nextTick, watch } from 'vue'

const props = defineProps({
  profileId: {
    type: String,
    required: true
  },
  profileDetails: {
    type: Object,
    default: null
  },
  accessibilitySettings: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const API_URL = 'http://localhost:3000/api'

// State
const messages = ref([])
const inputMessage = ref('')
const isLoading = ref(false)
const error = ref(null)
const chatContainer = ref(null)

// Profile color
const profileColor = computed(() => {
  const colors = {
    'visualis': '#8b5cf6',
    'narra': '#22c55e',
    'logika': '#3b82f6',
    'prax': '#f97316',
    'kreo': '#ec4899'
  }
  return colors[props.profileId] || '#0088ff'
})

// Load welcome message on mount
const loadWelcomeMessage = async () => {
  try {
    const response = await fetch(`${API_URL}/chat/welcome/${props.profileId}`)
    const data = await response.json()
    
    if (data.success && data.data?.message) {
      messages.value.push(data.data.message)
    }
  } catch (err) {
    console.error('Error loading welcome:', err)
    messages.value.push({
      role: 'assistant',
      content: `Hola! 👋 Sóc el teu assistent adaptat al teu perfil ${props.profileDetails?.name || ''}. Com et puc ajudar?`
    })
  }
}

// Send message
const sendMessage = async () => {
  if (!inputMessage.value.trim() || isLoading.value) return
  
  const userMessage = {
    role: 'user',
    content: inputMessage.value.trim()
  }
  
  messages.value.push(userMessage)
  inputMessage.value = ''
  isLoading.value = true
  error.value = null
  
  await scrollToBottom()
  
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: messages.value.filter(m => m.role !== 'system'),
        profileId: props.profileId,
        accessibilitySettings: props.accessibilitySettings
      })
    })
    
    const data = await response.json()
    
    if (data.success && data.data?.message) {
      messages.value.push(data.data.message)
    } else if (data.fallback) {
      messages.value.push(data.fallback)
    } else {
      error.value = data.error || 'Error al enviar el missatge'
    }
  } catch (err) {
    console.error('Chat error:', err)
    error.value = 'Error de connexió'
  } finally {
    isLoading.value = false
    await scrollToBottom()
  }
}

// Auto-scroll to bottom
const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Handle enter key
const handleKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}

// Format message content (simple markdown)
const formatMessage = (content) => {
  if (!content) return ''
  
  // Bold
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Italic
  formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
  // Line breaks
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}

// Initialize
loadWelcomeMessage()
</script>

<template>
  <div class="chat-container" :style="{ '--profile-color': profileColor }">
    <!-- Chat Header -->
    <div class="chat-header">
      <div class="chat-profile">
        <span class="profile-emoji">{{ profileDetails?.emoji || '🧠' }}</span>
        <div class="profile-info">
          <h3>NeuroStudy AI</h3>
          <span class="profile-badge">Adaptat a {{ profileDetails?.name || 'el teu perfil' }}</span>
        </div>
      </div>
      <button class="close-btn" @click="emit('close')" aria-label="Tancar xat">
        ✕
      </button>
    </div>

    <!-- Messages Container -->
    <div class="messages-container" ref="chatContainer">
      <div 
        v-for="(message, index) in messages" 
        :key="index"
        class="message"
        :class="message.role"
      >
        <div class="message-avatar">
          <span v-if="message.role === 'assistant'">🧠</span>
          <span v-else>👤</span>
        </div>
        <div class="message-content" v-html="formatMessage(message.content)"></div>
      </div>

      <!-- Loading indicator -->
      <div v-if="isLoading" class="message assistant loading">
        <div class="message-avatar">🧠</div>
        <div class="message-content">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <!-- Error message -->
      <div v-if="error" class="error-message">
        <span>⚠️</span>
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-container">
      <textarea
        v-model="inputMessage"
        @keydown="handleKeydown"
        placeholder="Escriu el teu missatge..."
        rows="1"
        :disabled="isLoading"
      ></textarea>
      <button 
        class="send-btn" 
        @click="sendMessage"
        :disabled="!inputMessage.trim() || isLoading"
      >
        <span>➤</span>
      </button>
    </div>

    <!-- Quick suggestions -->
    <div class="quick-suggestions" v-if="messages.length <= 1">
      <span class="suggestions-label">Prova amb:</span>
      <button @click="inputMessage = 'Explica\'m què és JavaScript'">
        📚 JavaScript
      </button>
      <button @click="inputMessage = 'Com funciona la intel·ligència artificial?'">
        🤖 IA
      </button>
      <button @click="inputMessage = 'Dona\'m consells per estudiar millor'">
        💡 Consells
      </button>
    </div>
  </div>
</template>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 600px;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

/* Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-lg);
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-profile {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.profile-emoji {
  font-size: 2rem;
}

.profile-info h3 {
  font-size: 1rem;
  margin: 0;
  color: white;
}

.profile-badge {
  font-size: 0.75rem;
  color: var(--profile-color);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: var(--gray-400);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Messages */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.message {
  display: flex;
  gap: var(--space-md);
  max-width: 85%;
  animation: fadeIn 0.3s ease-out;
}

.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  flex-shrink: 0;
  font-size: 1.25rem;
}

.message.assistant .message-avatar {
  background: var(--profile-color);
}

.message-content {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-lg);
  line-height: 1.5;
  font-size: 0.95rem;
}

.message.assistant .message-content {
  background: rgba(255, 255, 255, 0.08);
  color: var(--gray-200);
  border-bottom-left-radius: var(--radius-sm);
}

.message.user .message-content {
  background: var(--profile-color);
  color: white;
  border-bottom-right-radius: var(--radius-sm);
}

/* Typing indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: var(--space-sm) 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--gray-400);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* Error */
.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: #fca5a5;
  font-size: 0.875rem;
}

/* Input */
.chat-input-container {
  display: flex;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.chat-input-container textarea {
  flex: 1;
  padding: var(--space-md);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: white;
  font-family: inherit;
  font-size: 0.95rem;
  resize: none;
  outline: none;
  transition: border-color var(--transition-fast);
}

.chat-input-container textarea:focus {
  border-color: var(--profile-color);
}

.chat-input-container textarea::placeholder {
  color: var(--gray-500);
}

.send-btn {
  width: 48px;
  height: 48px;
  border: none;
  background: var(--profile-color);
  color: white;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: 1.25rem;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  filter: brightness(1.1);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quick suggestions */
.quick-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  padding: 0 var(--space-lg) var(--space-md);
  align-items: center;
}

.suggestions-label {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.quick-suggestions button {
  padding: var(--space-xs) var(--space-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  color: var(--gray-400);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick-suggestions button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: var(--profile-color);
  color: white;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
